import { useState } from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { GeneratingIndicator } from './GeneratingIndicator';
import { Button } from '../../../components/ui/Button';
import { useChatMessages } from '../hooks/useChatMessages';
import { useGenerate } from '../hooks/useGenerate';
import { toClientScenes, type ClientScene } from '../../timeline/types';

interface ChatPanelProps {
  projectId: string;
  onGenerated: (scenes: ClientScene[]) => void;
}

export function ChatPanel({ projectId, onGenerated }: ChatPanelProps) {
  const { messages, addMessage } = useChatMessages();
  const generate = useGenerate(projectId);
  const [lastPrompt, setLastPrompt] = useState('');

  const send = (prompt: string) => {
    setLastPrompt(prompt);
    addMessage({ id: `user-${Date.now()}`, role: 'user', content: prompt });
    generate.mutate(prompt, {
      onSuccess: (scenes) => {
        addMessage({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `Generated ${scenes.length} scenes. Edit them in the timeline, then preview.`,
        });
        onGenerated(toClientScenes(scenes));
      },
    });
  };

  return (
    <section
      aria-label="Chat"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4"
    >
      <h2 className="text-lg font-semibold">Chat</h2>
      <div className="min-h-40 flex-1">
        <MessageList messages={messages} />
        {generate.isPending ? <GeneratingIndicator /> : null}
        {generate.isError && lastPrompt ? (
          <div className="mt-3 flex items-center gap-2">
            <p role="alert" className="text-sm text-danger">
              Generation failed.
            </p>
            <Button variant="secondary" onClick={() => send(lastPrompt)}>
              Retry
            </Button>
          </div>
        ) : null}
      </div>
      <ChatInput onSend={send} sending={generate.isPending} />
    </section>
  );
}
