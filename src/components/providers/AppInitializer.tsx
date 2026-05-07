"use client";

import { FaucetModal } from "@/components/wallet/FaucetModal";
import { useFaucetAutoOpen } from "@/hooks/useFaucetAutoOpen";

export function AppInitializer() {
  // Initialize global side effects
  useFaucetAutoOpen();

  return <FaucetModal />;
}
