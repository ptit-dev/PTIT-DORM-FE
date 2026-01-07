import { useState, useEffect, useRef, useCallback } from 'react';
import ChatWorker from '@/features/socket/chatWorker.ts?sharedworker'; 

interface Message {
  type: 'user' | 'bot';
  text: string;
}

export const useWebSocketChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const workerRef = useRef<SharedWorker | null>(null);

  useEffect(() => {
    const worker = new ChatWorker({ name: 'PTIT_Dorm_chat_worker' }); 
    workerRef.current = worker;

    worker.port.start();

    worker.port.onmessage = (event) => {
      const { type, data } = event.data;
      
      if (type === 'UPDATE_MESSAGES') {
        setMessages(data);
      } else if (type === 'NEW_MESSAGE') {
        setMessages((prev) => [...prev, data]);
      } else if (type === 'STATUS') {
        setIsConnected(data);
      }
    };

    return () => {};
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    workerRef.current?.port.postMessage({ action: 'SEND_MESSAGE', text });
  }, []);

  const connect = useCallback(() => {
    workerRef.current?.port.postMessage({ action: 'RECONNECT' });
  }, []);

  const disconnect = useCallback(() => {
  }, []);

  return { messages, isConnected, sendMessage, connect, disconnect };
};