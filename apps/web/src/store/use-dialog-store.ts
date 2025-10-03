import { create } from "zustand";
import { Id } from "@packages/backend/convex/_generated/dataModel";

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

// Edit Project Dialog Store
export interface EditProjectDialogState {
  isOpen: boolean;
  isLoading: boolean;
  projectId: Id<"projects"> | null;
  formData: {
    title: string;
    description: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  errors: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface EditProjectDialogActions {
  openDialog: (
    projectId: Id<"projects">,
    data: {
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
  updateFormData: (data: Partial<EditProjectDialogState["formData"]>) => void;
  setError: (
    field: keyof EditProjectDialogState["errors"],
    error: string | undefined,
  ) => void;
  clearErrors: () => void;
  resetForm: () => void;
}

const initialEditFormData = {
  title: "",
  description: "",
  startDate: undefined,
  endDate: undefined,
};

const initialEditErrors = {
  title: undefined,
  description: undefined,
  startDate: undefined,
  endDate: undefined,
};

export const useEditProjectDialogStore = create<
  EditProjectDialogState & EditProjectDialogActions
>((set) => ({
  isOpen: false,
  isLoading: false,
  projectId: null,
  formData: initialEditFormData,
  errors: initialEditErrors,

  openDialog: (projectId, data) =>
    set({
      isOpen: true,
      projectId,
      formData: {
        title: data.title,
        description: data.description || "",
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      projectId: null,
      formData: initialEditFormData,
      errors: initialEditErrors,
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

  clearErrors: () => set({ errors: initialEditErrors }),
  resetForm: () =>
    set({
      formData: initialEditFormData,
      errors: initialEditErrors,
      isLoading: false,
    }),
}));

// Delete Project Dialog Store
export interface DeleteProjectDialogState {
  isOpen: boolean;
  isLoading: boolean;
  projectId: Id<"projects"> | null;
  projectTitle: string;
}

interface DeleteProjectDialogActions {
  openDialog: (projectId: Id<"projects">, projectTitle: string) => void;
  closeDialog: () => void;
  setLoading: (loading: boolean) => void;
}

export const useDeleteProjectDialogStore = create<
  DeleteProjectDialogState & DeleteProjectDialogActions
>((set) => ({
  isOpen: false,
  isLoading: false,
  projectId: null,
  projectTitle: "",

  openDialog: (projectId, projectTitle) =>
    set({ isOpen: true, projectId, projectTitle }),
  closeDialog: () =>
    set({ isOpen: false, projectId: null, projectTitle: "", isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
