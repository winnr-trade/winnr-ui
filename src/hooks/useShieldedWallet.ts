"use client";

import { bytesToHex, hexToBytes } from "@noble/ciphers/utils.js";
import type { Keypair } from "@solana/web3.js";
import { useState } from "react";
import { toast } from "sonner";
import { shieldedAccountCreationMessage, useRegisterShieldedWallet } from "@/api/notes";
import { rollup } from "@/api/utils";
import { ShieldedWallet } from "@/lib/crypto/shielded";
import { deriveDetectionTag, deriveStealthKey } from "@/lib/crypto/stealth";
import { useShieldedStore } from "@/store/useShieldedStore";
import { useMainWallet } from "./useMainWallet";

export interface StealthAddress {
  stealthPrivateKey: Uint8Array;
  detectionTag: Uint8Array;
  /** Global stealth nonce — store alongside the note for keypair recovery. */
  stealthNonce: bigint;
  /** Per-market detection nonce — store alongside the note for tag recovery. */
  detectionNonce: bigint;
}

export interface UseShieldedWalletReturn {
  isEnabled: boolean;
  wallet: ShieldedWallet | null;
  isEnabling: boolean;
  enable: () => Promise<ShieldedWallet | null>;
  disable: () => void;
  generateStealthParams: (params: {
    marketId: number;
    stealthNonce: bigint;
    detectionNonce: bigint;
  }) => StealthAddress;
}

export function useShieldedWallet(): UseShieldedWalletReturn {
  const { address: mainAddress, signMessage, connected } = useMainWallet();
  const { getMasterSecret, setMasterSecret, enabledWallets, setEnabledWallet } = useShieldedStore();
  const { mutateAsync: register } = useRegisterShieldedWallet();

  const [isEnabling, setIsEnabling] = useState(false);

  const isEnabledFlag = mainAddress ? (enabledWallets[mainAddress] ?? false) : false;
  const hex = mainAddress ? getMasterSecret(mainAddress) : null;

  const wallet =
    !mainAddress || !isEnabledFlag || !hex ? null : ShieldedWallet.fromMasterKey(hexToBytes(hex));

  const enable = async (): Promise<ShieldedWallet | null> => {
    if (!connected || !mainAddress || !signMessage) {
      toast.error("Connect your wallet before enabling private mode.");
      return null;
    }

    try {
      setIsEnabling(true);

      let derivedWallet: ShieldedWallet;
      if (hex) {
        derivedWallet = ShieldedWallet.fromMasterKey(hexToBytes(hex));
      } else {
        const message = shieldedAccountCreationMessage(mainAddress);
        const signature = await signMessage(new TextEncoder().encode(message));
        derivedWallet = ShieldedWallet.fromSignature(signature);
        setMasterSecret(mainAddress, bytesToHex(derivedWallet.masterSecret));
      }

      const hasAccount = await rollup.shieldedPool.hasAccount({ userAddress: mainAddress });

      if (!hasAccount) {
        await register(derivedWallet);
        toast.info("Shielded account registered.");
      }

      setEnabledWallet(mainAddress, true);
      toast.success("Private mode enabled.");
      return derivedWallet;
    } catch (err: unknown) {
      console.error("Shielded wallet enable failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(errorMessage ?? "Failed to enable private mode.");
      return null;
    } finally {
      setIsEnabling(false);
    }
  };

  const disable = () => {
    if (mainAddress) {
      setEnabledWallet(mainAddress, false);
      toast.success("Private mode disabled.");
    }
  };

  const generateStealthParams = (params: {
    marketId: number;
    stealthNonce: bigint;
    detectionNonce: bigint;
  }): StealthAddress => {
    if (!wallet) {
      throw new Error("Private mode is not enabled.");
    }
    const { marketId, stealthNonce, detectionNonce } = params;
    const stealthPrivateKey = deriveStealthKey(wallet.stealthSecret, stealthNonce);
    const detectionTag = deriveDetectionTag(wallet.viewKey, marketId, detectionNonce);
    return { stealthPrivateKey, detectionTag, stealthNonce, detectionNonce };
  };

  return {
    isEnabled: wallet !== null,
    wallet,
    isEnabling,
    enable,
    disable,
    generateStealthParams,
  };
}
