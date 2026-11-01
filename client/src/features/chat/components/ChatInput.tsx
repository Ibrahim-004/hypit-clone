import { useState } from 'react';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

export function ChatInput({
  onSend,
  sending,
}: {
  onSend: (prompt: string) => void;
  sending: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (prompt.trim() && !sending) {
          onSend(prompt.trim());
          setPrompt('');
        }
      }}
      className="flex flex-col gap-2"
      aria-label="Video prompt"
    >
      <Textarea
        id="prompt"
        label="Prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={3}
        placeholder="Describe your video…"
        maxLength={2000}
      />
      <Button type="submit" disabled={sending || !prompt.trim()}>
        {sending ? 'Generating…' : 'Generate scenes'}
      </Button>
    </form>
  );
}
