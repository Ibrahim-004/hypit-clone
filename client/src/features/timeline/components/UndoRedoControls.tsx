import { Button } from '../../../components/ui/Button';
export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" disabled={!canUndo} onClick={onUndo}>
        Undo
      </Button>
      <Button variant="secondary" disabled={!canRedo} onClick={onRedo}>
        Redo
      </Button>
    </div>
  );
}
