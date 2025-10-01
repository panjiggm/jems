import { create } from "zustand";

export interface TemplateDialogState {
  isOpen: boolean;
  isLoading: boolean;
  selectedTemplate: "monthly" | "quarterly" | null;
  quarterValue?: 1 | 2 | 3 | 4;
}

interface TemplateDialogActions {
  openDialog: () => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  setSelectedTemplate: (template: "monthly" | "quarterly" | null) => void;
  setQuarterValue: (quarter: 1 | 2 | 3 | 4) => void;
  resetDialog: () => void;
}

const initialState = {
  isOpen: false,
  isLoading: false,
  selectedTemplate: null,
  quarterValue: undefined,
};

export const useTemplateDialogStore = create<
  TemplateDialogState & TemplateDialogActions
>((set) => ({
  ...initialState,

  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set(initialState),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setQuarterValue: (quarter) => set({ quarterValue: quarter }),
  resetDialog: () => set(initialState),
}));
