import type { EditorTab } from '../../store/ui-store';
import { useUiStore } from '../../store/ui-store';

const tabs: { id: EditorTab; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'preview', label: 'Preview' },
];

export function Tabs() {
  const { activeTab, setActiveTab } = useUiStore();
  return (
    <div
      role="tablist"
      aria-label="Editor sections"
      className="flex gap-1 rounded-lg border border-line bg-surface p-1 md:hidden"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 rounded-md px-3 py-2 text-sm ${activeTab === tab.id ? 'bg-primary text-white' : 'text-muted'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
