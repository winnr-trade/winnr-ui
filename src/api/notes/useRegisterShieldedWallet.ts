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
import { Note } from "@/lib/crypto/tx/note";
import { generateTxProof } from "@/lib/crypto/tx/proof";
import { getTreeLeaves } from "./getTreeLeaves";

export const shieldedAccountCreationMessage = (owner: string) =>
  `Winnr Shielded Wallet Creation\nowner: ${owner}\nversion: 1`;

export const shieldedAccountRegistrationMessage = (owner: string) =>
  `Winnr Shielded Wallet Registration\nowner: ${owner}\nversion: 1`;

export function useRegisterShieldedWallet() {
  const { address: mainAddress, signMessage } = useMainWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wallet: ShieldedWallet): Promise<void> => {
      if (!mainAddress || !signMessage) {
        throw new Error("Wallet or signer not available.");
      }

      const leaves = await getTreeLeaves();
      const tree = MerkleTree.fromLeaves(TREE_DEPTH, leaves);

      // Dummy input note
      const inputNote = new Note({ owner: wallet.address, amount: 0n, nonce: 0n, index: 0 });

      const { proof, outputNote } = await generateTxProof({
        note: inputNote,
        amount: 0n,
        tree,
        isDeposit: false,
        isAccountCreation: true,
      });

      const message = shieldedAccountRegistrationMessage(mainAddress);
      const signature = await signMessage(new TextEncoder().encode(message));

      // Any signer works — verification is done via owner + signature fields.
      const kp = Keypair.generate();
      const seed = kp.secretKey.slice(0, 32);
      const seedHex = bytesToHex(seed);
      const signer = new Ed25519Signer(seedHex);
      await rollup.shieldedPool.registerAccount(
        {
          proof,
          root: numberToBytesBE(tree.root, 32),
          amount: 0n,
          commitment: numberToBytesBE(outputNote.commitment(), 32),
          nullifier: numberToBytesBE(inputNote.nullifier(), 32),
          memo: outputNote.memo(wallet.viewKey),
          owner: mainAddress,
          signature,
        },
        signer,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hasShielded"] });
    },
  });
}
