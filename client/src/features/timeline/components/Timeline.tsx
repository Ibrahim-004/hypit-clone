import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { ClientScene } from '../types';
import { SceneRow } from './SceneRow';
import { AddSceneButton } from './AddSceneButton';
import { UndoRedoControls } from './UndoRedoControls';
import { EmptyState } from '../../../components/ui/EmptyState';

interface TimelineProps {
  scenes: ClientScene[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onChange: (id: string, patch: Partial<ClientScene>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onAdd: () => void;
  onReorder: (orderedIds: string[]) => void;
}

export function Timeline(props: TimelineProps) {
  const { scenes } = props;
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    props.onReorder(arrayMove(scenes, oldIndex, newIndex).map((s) => s.id));
  };

  return (
    <section
      aria-label="Timeline"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <UndoRedoControls
          canUndo={props.canUndo}
          canRedo={props.canRedo}
          onUndo={props.onUndo}
          onRedo={props.onRedo}
        />
      </div>
      {scenes.length === 0 ? (
        <EmptyState title="No scenes yet">Generate scenes from chat, or add one below.</EmptyState>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-3">
              {scenes.map((scene, index) => (
                <SceneRow
                  key={scene.id}
                  scene={scene}
                  isFirst={index === 0}
                  isLast={index === scenes.length - 1}
                  onChange={props.onChange}
                  onDelete={props.onDelete}
                  onMove={props.onMove}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <AddSceneButton onAdd={props.onAdd} />
    </section>
  );
}
