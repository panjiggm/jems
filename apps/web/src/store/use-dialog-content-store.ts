import { create } from "zustand";

export interface ContentDialogState {
  isOpen: boolean;
  projectId?: string;
  isLoading: boolean;
  formData: {
    projectId?: string;
    title: string;
    platform:
      | "tiktok"
      | "instagram"
      | "youtube"
      | "x"
      | "facebook"
      | "threads"
      | "other";
    priority: "low" | "medium" | "high";
    dueDate: string;
    publishedAt: string;
    notes: string;
  };
  errors: {
    title?: string;
    platform?: string;
    projectId?: string;
    dueDate?: string;
    publishedAt?: string;
    priority?: string;
  };
}

interface ContentDialogActions {
  openDialog: (projectId?: string) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  updateFormData: (data: Partial<ContentDialogState["formData"]>) => void;
  setError: (
    field: keyof ContentDialogState["errors"],
    error: string | undefined,
  ) => void;
  clearErrors: () => void;
  resetForm: () => void;
}

const initialFormData = {
  projectId: undefined,
  title: "",
  platform: "tiktok" as const,
  priority: "low" as const,
  dueDate: "",
  publishedAt: "",
  notes: "",
};

const initialErrors = {
  title: undefined,
  platform: undefined,
  projectId: undefined,
  priority: undefined,
  dueDate: undefined,
  publishedAt: undefined,
};

export const useContentDialogStore = create<
  ContentDialogState & ContentDialogActions
>((set) => ({
  isOpen: false,
  isLoading: false,
  projectId: undefined,
  formData: initialFormData,
  errors: initialErrors,

  openDialog: (projectId) =>
    set({
      isOpen: true,
      projectId,
      formData: initialFormData,
      errors: initialErrors,
      isLoading: false,
    }),

  closeDialog: () =>
    set({
      isOpen: false,
      projectId: undefined,
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
