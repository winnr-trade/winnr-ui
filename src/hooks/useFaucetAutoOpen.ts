"use client";

import { useEffect, useRef } from "react";
import { useGetBalance } from "@/api/wallet/getBalance";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";

export function useFaucetAutoOpen() {
  const { address, connected } = useMainWallet();
  const { data: balance, isSuccess } = useGetBalance({ address: address ?? undefined });
  const { openFaucetModal } = useWalletUIStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only run this logic once when the component using this hook mounts
    // AND we have a successful balance fetch
    if (connected && isSuccess && balance !== undefined && !hasCheckedRef.current) {
      // 100 USDC threshold (assuming 6 decimals)
      const threshold = BigInt(100) * BigInt(10 ** 6);

      if (balance < threshold) {
        openFaucetModal();
      }

      hasCheckedRef.current = true;
    }
  }, [connected, isSuccess, balance, openFaucetModal]);
}
