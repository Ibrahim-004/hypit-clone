import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ClientScene } from '../types';
import { SceneEditor } from './SceneEditor';
import { Button } from '../../../components/ui/Button';

interface SceneRowProps {
  scene: ClientScene;
  isFirst: boolean;
  isLast: boolean;
  onChange: (id: string, patch: Partial<ClientScene>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function SceneRow({ scene, isFirst, isLast, onChange, onDelete, onMove }: SceneRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: scene.id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-line bg-surface2 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-sm text-muted"
          aria-label={`Drag scene ${scene.order + 1} to reorder`}
        >
          Drag · Scene {scene.order + 1}
        </button>
        <div className="flex gap-1">
          <Button
            variant="secondary"
            disabled={isFirst}
            onClick={() => onMove(scene.id, -1)}
            aria-label={`Move scene ${scene.order + 1} up`}
          >
            Up
          </Button>
          <Button
            variant="secondary"
            disabled={isLast}
            onClick={() => onMove(scene.id, 1)}
            aria-label={`Move scene ${scene.order + 1} down`}
          >
            Down
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(scene.id)}
            aria-label={`Delete scene ${scene.order + 1}`}
          >
            Delete
          </Button>
        </div>
      </div>
      <SceneEditor scene={scene} onChange={onChange} />
    </li>
  );
}
