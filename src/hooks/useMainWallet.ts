import { useWallet } from "@solana/wallet-adapter-react";

export function useMainWallet() {
  const { publicKey, ...rest } = useWallet();
  const address = publicKey ? publicKey.toBase58() : null;

  return {
    publicKey,
    address,
    ...rest,
  };
}
