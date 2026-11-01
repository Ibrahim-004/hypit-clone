import type { ChatMessage } from '../types';
import { MessageItem } from './MessageItem';
export function MessageList({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted">
        Describe the video you want. For example: “A calm 30-second ad for a seaside cafe, three
        scenes, warm light.”
      </p>
    );
  }
  return (
    <ul aria-live="polite" className="flex flex-col gap-3">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </ul>
  );
}
