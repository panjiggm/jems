import { create } from "zustand";

export interface CreateProjectDialogState {
  isOpen: boolean;
  isLoading: boolean;
  formData: {
    title: string;
    type: "campaign" | "series" | "routine";
    description: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  errors: {
    title?: string;
    type?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface CreateProjectDialogActions {
  openDialog: () => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  updateFormData: (data: Partial<CreateProjectDialogState["formData"]>) => void;
  setError: (
    field: keyof CreateProjectDialogState["errors"],
    error: string | undefined,
  ) => void;
  clearErrors: () => void;
  resetForm: () => void;
}

const initialFormData = {
  title: "",
  type: "campaign" as const,
  description: "",
  startDate: undefined,
  endDate: undefined,
};

const initialErrors = {
  title: undefined,
  type: undefined,
  description: undefined,
  startDate: undefined,
  endDate: undefined,
};

export const useCreateProjectDialogStore = create<
  CreateProjectDialogState & CreateProjectDialogActions
>((set) => ({
  isOpen: false,
  isLoading: false,
  formData: initialFormData,
  errors: initialErrors,

  openDialog: () => set({ isOpen: true }),
  closeDialog: () =>
    set({
      isOpen: false,
      formData: initialFormData,
      errors: initialErrors,
      isLoading: false,
    }),
  setLoading: (loading) => set({ isLoading: loading }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      errors: { ...state.errors, [Object.keys(data)[0]]: undefined },
    })),

  setError: (field, error) =>
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    })),

  clearErrors: () => set({ errors: initialErrors }),
  resetForm: () =>
    set({
      formData: initialFormData,
      errors: initialErrors,
      isLoading: false,
    }),
}));
