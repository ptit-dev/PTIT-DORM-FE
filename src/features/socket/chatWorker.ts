import { WEBSOCKET_CHATBOT_URL } from '@/config/apiConfig';

declare global {
  interface WorkerGlobalScope extends EventTarget { }
  interface SharedWorkerGlobalScope extends WorkerGlobalScope {
    onconnect: (event: MessageEvent) => void;
    close(): void;
  }
}
declare const self: SharedWorkerGlobalScope;

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

const messages: ChatMessage[] = [];
let ws: WebSocket | null = null;
const ports: MessagePort[] = [];

const broadcast = (type: string, data: any) => {
  for (let i = ports.length - 1; i >= 0; i--) {
    try {
      ports[i].postMessage({ type, data });
    } catch (e) {
      ports.splice(i, 1);
    }
  }
};

const connectWebSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  ws = new WebSocket(WEBSOCKET_CHATBOT_URL);

  ws.onopen = () => {
    broadcast('STATUS', true);
    if (messages.length === 0) {
      const welcome: ChatMessage = { 
        type: 'bot', 
        text: 'Chào bạn, mình là PTIT Dorm Chatbot. Rất vui được gặp bạn!' 
      };
      messages.push(welcome);
      broadcast('UPDATE_MESSAGES', messages);
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.answer) {
        const botMsg: ChatMessage = { type: 'bot', text: data.answer };
        messages.push(botMsg);
        broadcast('NEW_MESSAGE', botMsg);
      }
    } catch (e) {
      console.error(e);
    }
  };

  ws.onclose = () => {
    broadcast('STATUS', false);
    ws = null;
  };

  ws.onerror = () => {
    broadcast('STATUS', false);
    ws = null;
  };
};

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  ports.push(port);

  port.postMessage({ type: 'UPDATE_MESSAGES', data: messages });
  port.postMessage({ type: 'STATUS', data: ws?.readyState === WebSocket.OPEN });

  if (!ws) connectWebSocket();

  port.onmessage = (event: MessageEvent) => {
    const { action, text } = event.data;

    if (action === 'SEND_MESSAGE') {
      const userMsg: ChatMessage = { type: 'user', text };
      messages.push(userMsg);
      broadcast('NEW_MESSAGE', userMsg);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(text);
    }
    
    if (action === 'RECONNECT') connectWebSocket();
  };

  port.start();
};

export {};