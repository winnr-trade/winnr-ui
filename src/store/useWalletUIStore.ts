import { create } from "zustand";

interface WalletUIState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  isFaucetModalOpen: boolean;
  openFaucetModal: () => void;
  closeFaucetModal: () => void;
}

export const useWalletUIStore = create<WalletUIState>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  isFaucetModalOpen: false,
  openFaucetModal: () => set({ isFaucetModalOpen: true }),
  closeFaucetModal: () => set({ isFaucetModalOpen: false }),
}));
