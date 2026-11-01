import { useCallback, useState } from 'react';
import type { ChatMessage } from '../types';

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);
  const clear = useCallback(() => setMessages([]), []);
  return { messages, addMessage, clear };
}
