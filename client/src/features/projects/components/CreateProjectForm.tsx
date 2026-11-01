import { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function CreateProjectForm({
  onCreate,
  creating,
}: {
  onCreate: (title: string) => void;
  creating: boolean;
}) {
  const [title, setTitle] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim()) onCreate(title.trim());
      }}
      className="flex flex-col gap-3"
      aria-label="Create project"
    >
      <Input
        label="Project title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="My first video"
      />
      <Button type="submit" disabled={creating || !title.trim()}>
        Create project
      </Button>
    </form>
  );
}
