import type { ClientScene } from '../types';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

interface SceneEditorProps {
  scene: ClientScene;
  onChange: (id: string, patch: Partial<ClientScene>) => void;
}

export function SceneEditor({ scene, onChange }: SceneEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Textarea
        id={`scene-${scene.id}-text`}
        label={`Scene ${scene.order + 1} narration`}
        value={scene.text}
        onChange={(event) => onChange(scene.id, { text: event.target.value })}
        rows={3}
      />
      <Textarea
        id={`scene-${scene.id}-visual`}
        label="Visual description"
        value={scene.visual}
        onChange={(event) => onChange(scene.id, { visual: event.target.value })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id={`scene-${scene.id}-duration`}
          label="Duration (seconds)"
          type="number"
          min={1}
          max={30}
          value={scene.duration}
          onChange={(event) => onChange(scene.id, { duration: Number(event.target.value) || 1 })}
        />
        <Input
          id={`scene-${scene.id}-transition`}
          label="Transition"
          value={scene.transition}
          onChange={(event) => onChange(scene.id, { transition: event.target.value })}
        />
      </div>
    </div>
  );
}
