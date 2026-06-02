"use client";

import { numberToBytesBE } from "@noble/ciphers/utils.js";
import { Keypair } from "@solana/web3.js";
import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { TREE_DEPTH } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import type { ShieldedWallet } from "@/lib/crypto/shielded";
import { MerkleTree } from "@/lib/crypto/tree";
import { generateTxProof } from "@/lib/crypto/tx/proof";
import { getTreeLeaves } from "./getTreeLeaves";
import { getUserNote } from "./getUserNote";

export const shieldedAccountWithdrawMessage = (
  owner: string,
  nullifier: Uint8Array,
  amount: bigint,
  recipient: string,
) => {
  const nullifierHex = bytesToHex(nullifier);
  return `Winnr Shielded Withdraw\nowner: ${owner}\nnullifier: ${nullifierHex}\namount: ${amount.toString()}\nrecipient: ${recipient}\nversion: 1`;
};

export function useWithdrawShieldedWallet() {
  const { address: mainAddress, signMessage } = useMainWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      amount: bigint;
      wallet: ShieldedWallet;
      recipient: string;
    }): Promise<void> => {
      const { amount, wallet, recipient } = params;
      if (!mainAddress || !signMessage) {
        throw new Error("Wallet or signer not available.");
      }

      const leaves = await getTreeLeaves();
      const tree = MerkleTree.fromLeaves(TREE_DEPTH, leaves);

      const inputNote = await getUserNote(mainAddress, wallet);
      if (!inputNote) {
        throw new Error("No shielded note found. Please ensure you have enabled Private Mode.");
      }

      if (inputNote.amount < amount) {
        throw new Error("Insufficient shielded balance.");
      }

      const { proof, outputNote } = await generateTxProof({
        note: inputNote,
        amount,
        tree,
        isDeposit: false,
        isAccountCreation: false,
      });

      const nullifierBytes = numberToBytesBE(inputNote.nullifier(), 32);
      const message = shieldedAccountWithdrawMessage(
        mainAddress,
        nullifierBytes,
        amount,
        recipient,
      );
      const signature = await signMessage(new TextEncoder().encode(message));

      // Any signer works — verification is done via owner + signature fields.
      const kp = Keypair.generate();
      const seed = kp.secretKey.slice(0, 32);
      const seedHex = bytesToHex(seed);
      const signer = new Ed25519Signer(seedHex);

      await rollup.shieldedPool.withdraw(
        {
          proof,
          root: numberToBytesBE(tree.root, 32),
          amount,
          commitment: numberToBytesBE(outputNote.commitment(), 32),
          nullifier: nullifierBytes,
          memo: outputNote.memo(wallet.viewKey),
          owner: mainAddress,
          recipient,
          signature,
        },
        signer,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["shieldedNote"] });
    },
  });
}
