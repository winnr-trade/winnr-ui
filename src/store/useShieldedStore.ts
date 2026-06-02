import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShieldedState {
  /** Maps main wallet address → hex-encoded masterSecret. */
  masterSecrets: Record<string, string>;
  /** Tracks if private mode is toggled ON for an address. */
  enabledWallets: Record<string, boolean>;

  setMasterSecret: (walletAddress: string, hexSecret: string) => void;
  getMasterSecret: (walletAddress: string) => string | null;
  removeMasterSecret: (walletAddress: string) => void;

  setEnabledWallet: (walletAddress: string, enabled: boolean) => void;
}

export const useShieldedStore = create<ShieldedState>()(
  persist(
    (set, get) => ({
      masterSecrets: {},
      enabledWallets: {},

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

      setEnabledWallet: (walletAddress, enabled) =>
        set((state) => ({
          enabledWallets: { ...state.enabledWallets, [walletAddress]: enabled },
        })),
    }),
    {
      name: "winnr-shielded",
    },
  ),
);
