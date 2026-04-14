import { Ed25519Signer } from "@sovereign-sdk/signers";
import bs58 from "bs58";
import { useEffect, useState } from "react";
import { testUserPrivateKey } from "@/config/env";

export function useUserWallet() {
  const [signer, setSigner] = useState<Ed25519Signer | null>(null);
  const [address, setAddress] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function initWallet() {
      try {
        if (!testUserPrivateKey) {
          console.warn(
            "testUserPrivateKey is not defined. Please check your environment variables.",
          );
          setIsLoading(false);
          return;
        }

        const signer = new Ed25519Signer(testUserPrivateKey);
        const pubKeyBytes = await signer.publicKey();
        const addressBase58: string = bs58.encode(pubKeyBytes);

        if (isMounted) {
          setSigner(signer);
          setAddress(addressBase58);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to initialize user wallet:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  return { signer, address, isLoading };
}
