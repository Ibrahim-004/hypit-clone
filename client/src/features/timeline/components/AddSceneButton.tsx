import { Button } from '../../../components/ui/Button';
export function AddSceneButton({ onAdd }: { onAdd: () => void }) {
  return (
    <Button variant="secondary" onClick={onAdd}>
      Add scene
    </Button>
  );
}
