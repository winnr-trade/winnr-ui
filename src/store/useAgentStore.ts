import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AgentState {
  agentPrivateKeys: Record<string, string | null>; // Map of ownerAddress -> agentPrivateKey
  setAgentPrivateKey: (ownerAddress: string, privateKey: string | null) => void;
  getAgentPrivateKey: (ownerAddress: string) => string | null;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agentPrivateKeys: {},
      setAgentPrivateKey: (ownerAddress, privateKey) =>
        set((state) => ({
          agentPrivateKeys: {
            ...state.agentPrivateKeys,
            [ownerAddress]: privateKey,
          },
        })),
      getAgentPrivateKey: (ownerAddress) => get().agentPrivateKeys[ownerAddress] || null,
    }),
    {
      name: "winnr-agent-storage",
    },
  ),
);
