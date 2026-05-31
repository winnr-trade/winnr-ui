import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShieldedState {
  /** Maps main wallet address → hex-encoded masterSecret. */
  masterSecrets: Record<string, string>;

  setMasterSecret: (walletAddress: string, hexSecret: string) => void;
  getMasterSecret: (walletAddress: string) => string | null;
  removeMasterSecret: (walletAddress: string) => void;
}

export const useShieldedStore = create<ShieldedState>()(
  persist(
    (set, get) => ({
      masterSecrets: {},

      setMasterSecret: (walletAddress, hexSecret) =>
        set((state) => ({
          masterSecrets: { ...state.masterSecrets, [walletAddress]: hexSecret },
        })),

      getMasterSecret: (walletAddress) => get().masterSecrets[walletAddress] ?? null,

      removeMasterSecret: (walletAddress) =>
        set((state) => {
          const { [walletAddress]: _, ...rest } = state.masterSecrets;
          return { masterSecrets: rest };
        }),
    }),
    {
      name: "winnr-shielded",
    },
  ),
);
