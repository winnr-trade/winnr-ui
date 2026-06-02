"use client";

import { numberToBytesBE } from "@noble/ciphers/utils.js";
import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { TREE_DEPTH } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveStealthKey } from "@/lib/crypto/stealth";
import { MerkleTree } from "@/lib/crypto/tree";
import { generateTxProof } from "@/lib/crypto/tx/proof";
import { getTreeLeaves } from "./getTreeLeaves";
import { getUserNote } from "./getUserNote";

export interface CollectStealthAddressParams {
  nonce: bigint;
  amount: bigint;
  wallet: ShieldedWallet;
}

/**
 * Derives the stealth keypair for a specific nonce, checks the main shielded note,
 * and deposits the stealth address balance into the main shielded wallet.
 */
export function useCollectStealthAddress() {
  const { address: mainAddress } = useMainWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CollectStealthAddressParams) => {
      const { nonce, amount, wallet } = params;
      if (!mainAddress) throw new Error("Main wallet not connected.");

      const [leaves, currentNote] = await Promise.all([
        getTreeLeaves(),
        getUserNote(mainAddress, wallet),
      ]);

      if (!currentNote) {
        throw new Error("No shielded note found. Please deposit funds first.");
      }

      const tree = MerkleTree.fromLeaves(TREE_DEPTH, leaves);

      const { proof, publicInputs, outputNote } = await generateTxProof({
        note: currentNote,
        amount,
        tree,
        isDeposit: true,
        isAccountCreation: false,
      });

      const stealthPrivateKey = deriveStealthKey(wallet.stealthSecret, nonce);
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

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["shieldedNote"] });
      queryClient.invalidateQueries({ queryKey: ["stealthAddresses"] });
    },
  });
}
