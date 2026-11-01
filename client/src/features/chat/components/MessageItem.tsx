import type { ChatMessage } from '../types';
export function MessageItem({ message }: { message: ChatMessage }) {
  return (
    <li
      className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-white ml-8' : 'bg-surface2 mr-8'}`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
        {message.role === 'user' ? 'You' : 'Assistant'}
      </p>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </li>
  );
}
