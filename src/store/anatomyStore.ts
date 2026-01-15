import { create } from 'zustand';

interface AnatomyState {
  selectedPart: string | null;
  isSidebarOpen: boolean;
  selectPart: (id: string) => void;
  clearSelection: () => void;
  toggleSidebar: () => void;
}

export const useAnatomyStore = create<AnatomyState>((set) => ({
  selectedPart: null,
  isSidebarOpen: false,
  selectPart: (id: string) =>
    set({
      selectedPart: id,
      isSidebarOpen: true,
    }),
  clearSelection: () =>
    set({
      selectedPart: null,
      isSidebarOpen: false,
    }),
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
