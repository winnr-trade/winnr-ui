import { create } from "zustand";

interface AppState {
  portfolioValue: number;
  userRank: number;
  winnrScore: number;
  activeCategory: string;
  setPortfolioValue: (val: number) => void;
  setUserRank: (val: number) => void;
  setWinnrScore: (val: number) => void;
  setActiveCategory: (val: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  portfolioValue: 42904.12,
  userRank: 142,
  winnrScore: 8450,
  activeCategory: "All",
  setPortfolioValue: (val) => set({ portfolioValue: val }),
  setUserRank: (val) => set({ userRank: val }),
  setWinnrScore: (val) => set({ winnrScore: val }),
  setActiveCategory: (val) => set({ activeCategory: val }),
}));
