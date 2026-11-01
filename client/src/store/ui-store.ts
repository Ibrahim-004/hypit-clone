import { create } from 'zustand';

export type EditorTab = 'chat' | 'timeline' | 'preview';
export interface Toast {
  id: string;
  message: string;
  kind: 'success' | 'error' | 'info';
}

interface UiState {
  activeTab: EditorTab;
  toasts: Toast[];
  setActiveTab: (tab: EditorTab) => void;
  addToast: (message: string, kind: Toast['kind']) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useUiStore = create<UiState>()((set) => ({
  activeTab: 'chat',
  toasts: [],
  setActiveTab: (activeTab) => set({ activeTab }),
  addToast: (message, kind) => {
    toastCounter += 1;
    const id = `toast-${toastCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, kind }] }));
    window.setTimeout(
      () => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      5000,
    );
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
