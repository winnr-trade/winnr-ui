import { numberToBytesBE } from "@noble/ciphers/utils.js";
import { Keypair } from "@solana/web3.js";
import type { Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { getTreeLeaves, getUserNote } from "@/api/notes";
import { getBuyQuote } from "@/api/orderbook/getBuyQuote";
import { getLatestDetectionTagNonce } from "@/api/stealthOrder";
import { rollup } from "@/api/utils";
import { TREE_DEPTH } from "@/config/constants";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { MerkleTree } from "@/lib/crypto/tree";
import { generateTxProof } from "@/lib/crypto/tx/proof";
import type { OrderType, Outcome, Side } from "@/lib/rollup/types";
import { unitsToPrice } from "@/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Parameters the caller supplies — identical to regular order params. */
export interface StealthOrderParams {
  marketId: number;
  outcome: Outcome;
  side: Side;
  price: bigint;
  quantity: number;
  orderType: OrderType;
}

// ---------------------------------------------------------------------------
// Core async function (prepare + submit)
// ---------------------------------------------------------------------------

/**
 * Prepares a stealth order (derives keys, builds ZK proof) and submits it
 * to the rollup in a single call.
 */
export const placeOrderStealth = async (
  params: StealthOrderParams,
  signer: Signer,
  ctx: {
    mainAddress: string;
    shieldedWallet: ShieldedWallet;
    generateStealthParams: ReturnType<typeof useShieldedWallet>["generateStealthParams"];
  },
) => {
  const { marketId, outcome, side, price, quantity, orderType } = params;
  const { mainAddress, shieldedWallet, generateStealthParams } = ctx;

  // --- 1. Fetch tree and latest note in parallel ---
  const [leaves, inputNote] = await Promise.all([
    getTreeLeaves(),
    getUserNote(mainAddress, shieldedWallet),
  ]);

  if (!inputNote) {
    throw new Error("No shielded note found. Please deposit funds first.");
  }

  const tree = MerkleTree.fromLeaves(TREE_DEPTH, leaves);

  // --- 2. Derive nonces from on-chain state (no local store) ---
  const stealthNonce = inputNote.nonce + 1n;

  const latestDetectionNonce = await getLatestDetectionTagNonce(shieldedWallet.viewKey, marketId);
  const detectionNonce = latestDetectionNonce !== null ? latestDetectionNonce + 1n : 0n;

  const { stealthPrivateKey, detectionTag } = generateStealthParams({
    marketId,
    stealthNonce,
    detectionNonce,
  });

  // --- 3. Get quote for required collateral ---
  const quote = await getBuyQuote({ marketId, outcome, quantity });
  const requiredCollateral = quote.collateralRequired;

  if (inputNote.amount < requiredCollateral) {
    throw new Error(
      `Insufficient shielded balance. Required: ${requiredCollateral}, Available: ${inputNote.amount}`,
    );
  }

  // --- 4. Generate ZK proof ---
  const { proof, publicInputs, outputNote } = await generateTxProof({
    note: inputNote,
    amount: requiredCollateral,
    tree,
    isDeposit: false,
    isAccountCreation: false,
  });

  // --- 5. Encrypt change-note memo ---
  const noteMemo = outputNote.memo(shieldedWallet.viewKey);

  // --- 6. Submit to rollup ---
  const stealthAddress = Keypair.fromSeed(stealthPrivateKey).publicKey.toBase58();

  const root = `0x${bytesToHex(numberToBytesBE(tree.root, 32))}`;
  const commitment = `0x${bytesToHex(numberToBytesBE(publicInputs.outputCommitment, 32))}`;
  const nullifier = `0x${bytesToHex(numberToBytesBE(publicInputs.nullifier, 32))}`;
  const detectionTagHex = `0x${bytesToHex(detectionTag)}`;

  return rollup.orderbook.placeOrderStealth(
    {
      proof: Array.from(proof),
      root,
      commitment,
      nullifier,
      stealthAddress,
      marketId,
      outcome,
      side,
      price: unitsToPrice(price, 6),
      quantity,
      orderType,
      noteMemo: Array.from(noteMemo),
      detectionTag: detectionTagHex,
    },
    signer,
  );
};

// ---------------------------------------------------------------------------
// React-Query hook
// ---------------------------------------------------------------------------

export const usePlaceOrderStealth = () => {
  const { signer, isActive } = useAgentWallet();
  const { address: mainAddress } = useMainWallet();
  const { wallet, isEnabled, generateStealthParams } = useShieldedWallet();
  const queryClient = useQueryClient();

  // Stable refs so the mutationFn closure always sees fresh values
  const signerRef = useRef(signer);
  const isActiveRef = useRef(isActive);
  const mainAddressRef = useRef(mainAddress);
  const walletRef = useRef(wallet);
  const isEnabledRef = useRef(isEnabled);
  const generateStealthParamsRef = useRef(generateStealthParams);

  signerRef.current = signer;
  isActiveRef.current = isActive;
  mainAddressRef.current = mainAddress;
  walletRef.current = wallet;
  isEnabledRef.current = isEnabled;
  generateStealthParamsRef.current = generateStealthParams;

  return useMutation({
    mutationFn: async (params: StealthOrderParams) => {
      if (!isActiveRef.current || !signerRef.current) {
        throw new Error("Trading session not active. Please enable trading.");
      }
      if (!isEnabledRef.current || !walletRef.current) {
        throw new Error("Private mode is not enabled.");
      }
      if (!mainAddressRef.current) {
        throw new Error("Main wallet is not connected.");
      }

      return placeOrderStealth(params, signerRef.current, {
        mainAddress: mainAddressRef.current,
        shieldedWallet: walletRef.current,
        generateStealthParams: generateStealthParamsRef.current,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketShares"] });
      queryClient.invalidateQueries({ queryKey: ["shieldedNote"] });
      queryClient.invalidateQueries({ queryKey: ["stealthOrderMemos"] });
      queryClient.invalidateQueries({ queryKey: ["stealthShares"] });
    },
  });
};
