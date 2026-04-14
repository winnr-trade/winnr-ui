"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

export default function SolanaProvider({ children }: { children: React.ReactNode }) {
  // Use 'devnet' by default as requested
  const network = "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Modern wallets implementing the Wallet Standard (like Phantom)
  // are automatically detected by the WalletProvider without needing custom adapters.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
