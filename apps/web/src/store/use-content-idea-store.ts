import { create } from "zustand";

interface ContentIdeaState {
  isOpen: boolean;
}

interface ContentIdeaActions {
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
}

export const useContentIdeaStore = create<
  ContentIdeaState & ContentIdeaActions
>((set) => ({
  isOpen: false,

  openWidget: () => set({ isOpen: true }),
  closeWidget: () => set({ isOpen: false }),
  toggleWidget: () => set((state) => ({ isOpen: !state.isOpen })),
}));

