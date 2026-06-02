"use client";

import { numberToBytesBE } from "@noble/ciphers/utils.js";
import { Keypair } from "@solana/web3.js";
import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { rollup } from "@/api/utils";
import { tokens, TREE_DEPTH } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import { MerkleTree } from "@/lib/crypto/tree";
import { generateTxProof } from "@/lib/crypto/tx/proof";
import { getTreeLeaves } from "./getTreeLeaves";
import { getUserNote } from "./getUserNote";

/**
 * Scans all stealth nonces 1..inputNote.nonce, derives each stealth address,
 * checks its token balance, and deposits any non-zero balance back into the
 * shielded pool using the stealth keypair as signer.
 *
 * The stealth address is the tx signer — no owner signature is required,
 * matching the `Deposit` (no-sig) call message variant.
 */
export function useReclaimStealthCollateral() {
  const { address: mainAddress } = useMainWallet();
  const queryClient = useQueryClient();

  const mainAddressRef = useRef(mainAddress);
  mainAddressRef.current = mainAddress;

  return useMutation({
    mutationFn: async (params: { wallet: ShieldedWallet }): Promise<number> => {
      const { wallet } = params;
      const addr = mainAddressRef.current;
      if (!addr) throw new Error("Main wallet not connected.");

      const [leaves, inputNote] = await Promise.all([getTreeLeaves(), getUserNote(addr, wallet)]);

      if (!inputNote) {
        throw new Error("No shielded note found. Please deposit funds first.");
      }

      const tokenId = tokens.usdc.id;
      let tree = MerkleTree.fromLeaves(TREE_DEPTH, leaves);

      let reclaimed = 0;

      // Scan every stealth nonce that has ever been used (1 through current nonce).
      for (let n = 1n; n <= inputNote.nonce; n++) {
        const stealthPrivateKey = deriveStealthKey(wallet.stealthSecret, n);
        const stealthKeypair = Keypair.fromSeed(stealthPrivateKey);
        const stealthAddress = stealthKeypair.publicKey.toBase58();

        const balance = await rollup.bank.balance(stealthAddress, tokenId);
        if (!balance || balance === 0n) continue;

        const amount = balance;

        // Fetch fresh note state — tree may have grown from previous iterations.
        const currentNote = await getUserNote(addr, wallet);
        if (!currentNote) throw new Error("Lost track of shielded note mid-reclaim.");

        const freshLeaves = await getTreeLeaves();
        tree = MerkleTree.fromLeaves(TREE_DEPTH, freshLeaves);

        const { proof, publicInputs, outputNote } = await generateTxProof({
          note: currentNote,
          amount,
          tree,
          isDeposit: true,
          isAccountCreation: false,
        });

        const stealthSigner = new Ed25519Signer(bytesToHex(stealthPrivateKey));

        await rollup.shieldedPool.deposit(
          {
            proof,
            root: numberToBytesBE(tree.root, 32),
            amount,
            commitment: numberToBytesBE(publicInputs.outputCommitment, 32),
            nullifier: numberToBytesBE(publicInputs.nullifier, 32),
            memo: outputNote.memo(wallet.viewKey),
          },
          stealthSigner,
        );

        reclaimed++;
      }

      return reclaimed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["shieldedNote"] });
    },
  });
}
