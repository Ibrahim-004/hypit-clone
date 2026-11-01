import { useUiStore } from '../../store/ui-store';

export function Toast() {
  const { toasts, removeToast } = useUiStore();
  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`rounded-lg px-4 py-3 text-left text-sm shadow-lg ${toast.kind === 'error' ? 'bg-danger text-ink' : 'bg-surface2 text-text border border-line'}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
