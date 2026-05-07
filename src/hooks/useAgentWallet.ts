"use client";

import { Keypair } from "@solana/web3.js";
import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import { useQueryClient } from "@tanstack/react-query";
import bs58 from "bs58";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGetAgentPolicy } from "@/api/agentWallet/getAgentPolicy";
import { rollup } from "@/api/utils";
import { useAgentStore } from "@/store/useAgentStore";
import { useMainWallet } from "./useMainWallet";

export function useAgentWallet() {
  const {
    address: ownerAddress,
    publicKey: mainPublicKey,
    signMessage: mainSignMessage,
    connected,
  } = useMainWallet();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);

  const { agentPrivateKeys, setAgentPrivateKey } = useAgentStore();
  const agentPrivateKey = ownerAddress ? agentPrivateKeys[ownerAddress] : null;

  const { agentSigner, agentAddress } = useMemo(() => {
    if (!agentPrivateKey) return { agentSigner: null, agentAddress: null };
    try {
      const secretKey = bs58.decode(agentPrivateKey);
      const seed = secretKey.slice(0, 32);
      const seedHex = bytesToHex(seed);

      const signer = new Ed25519Signer(seedHex);
      const kp = Keypair.fromSecretKey(secretKey);
      return {
        agentSigner: signer,
        agentAddress: kp.publicKey.toBase58(),
      };
    } catch (e) {
      console.error("Failed to create agent signer:", e);
      return { agentSigner: null, agentAddress: null };
    }
  }, [agentPrivateKey]);

  const {
    data: agentPolicy,
    isLoading,
    refetch,
  } = useGetAgentPolicy({
    ownerAddress: ownerAddress || undefined,
    agentAddress: agentAddress || undefined,
  });

  const isAgentActive = useMemo(() => {
    if (!agentPolicy || !agentSigner) return false;

    const now = Date.now();
    const isExpired = agentPolicy.expiresAt < now;

    return !isExpired;
  }, [agentPolicy, agentSigner]);

  const enableTrading = async () => {
    if (!connected || !mainPublicKey || !mainSignMessage) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsRegistering(true);

      // Generate a random keypair for the agent
      const agentKeypair = Keypair.generate();
      const newAgentPrivateKey = bs58.encode(agentKeypair.secretKey);
      const newAgentAddress = agentKeypair.publicKey.toBase58();

      const seed = agentKeypair.secretKey.slice(0, 32);
      const seedHex = bytesToHex(seed);
      const newAgentSigner = new Ed25519Signer(seedHex);

      // Register agent address
      const scopesBinary = "11100000000000000000000000000000";
      const scopes = parseInt(scopesBinary, 2);
      const scopesHex = scopes.toString(16).padStart(8, "0");
      const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds
      const nonce = await rollup.agentWallet.getNonce({ owner: mainPublicKey.toBase58() });
      const message = `Winnr Agent Wallet Registration\nagent: ${newAgentAddress}\nscopes: 0x${scopesHex}\nexpires_at: ${expiresAt}\nnonce: ${nonce}\nversion: 1`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await mainSignMessage(encodedMessage);

      await rollup.agentWallet.registerAgent(
        {
          agent: newAgentAddress,
          scopes: scopes,
          expiresAt: expiresAt,
          nonce: nonce,
          owner: mainPublicKey.toBase58(),
          signature: signature,
        },
        newAgentSigner,
      );

      // Save the new agent key — this triggers a re-render with updated agentAddress/agentSigner
      if (ownerAddress) {
        setAgentPrivateKey(ownerAddress, newAgentPrivateKey);
      }

      // Seed the query cache with the policy we just registered.
      // This avoids the race condition where refetch() fires before
      // React propagates the new agentAddress through useMemo → useGetAgentPolicy.
      queryClient.setQueryData(["agentPolicy", ownerAddress, newAgentAddress], {
        expiresAt,
        scopes,
      });

      toast.success("Trading session enabled successfully");
    } catch (error: any) {
      console.error("Failed to enable trading:", error);
      toast.error(error.message || "Failed to enable trading session");
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    policy: agentPolicy,
    signer: agentSigner,
    address: agentAddress,
    isActive: isAgentActive,
    isLoading,
    isRegistering,
    enableTrading,
    refreshAgent: refetch,
  };
}
