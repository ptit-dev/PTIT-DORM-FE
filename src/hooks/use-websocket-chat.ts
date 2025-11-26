import { useState, useEffect, useRef, useCallback } from 'react';

const WEBSOCKET_URL = "ws://localhost:8000/ws/chat";
const BROADCAST_CHANNEL = "chatbot-channel";
const LEADER_KEY = "chatbot-leader";

interface Message {
	type: 'user' | 'bot';
	text: string;
}

let sharedConnection: WebSocket | null = null;
let sharedMessages: Message[] = [];
let sharedConnected = false;
let connectionCount = 0;

export const useWebSocketChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isLeader = useRef(false);

	useEffect(() => {
		connectionCount++;

		channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL);

		channelRef.current.onmessage = (event) => {
			const { type, data } = event.data;

			if (type === 'NEW_MESSAGE') {
				sharedMessages = data;
				setMessages([...data]);
			} else if (type === 'CONNECTION_STATUS') {
				setIsConnected(data);
			}
		};

		const checkLeader = () => {
			const leaderTimestamp = localStorage.getItem(LEADER_KEY);
			const now = Date.now();

			if (!leaderTimestamp || now - parseInt(leaderTimestamp) > 3000) {
				becomeLeader();
			} else {
				setMessages([...sharedMessages]);
				setIsConnected(sharedConnection?.readyState === WebSocket.OPEN);
			}
		};

		checkLeader();

		const handleBeforeUnload = () => {
			if (isLeader.current && sharedConnection) {
				sharedConnection.close();
				sharedConnection = null;
				localStorage.removeItem(LEADER_KEY);
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			connectionCount--;

			if (channelRef.current) {
				channelRef.current.close();
				channelRef.current = null;
			}

			if (isLeader.current) {
				isLeader.current = false;
				localStorage.removeItem(LEADER_KEY);

				if (connectionCount === 0) {
					if (sharedConnection) {
						sharedConnection.close();
						sharedConnection = null;
					}
					sharedMessages = [];
					sharedConnected = false;
				}
			}
		};
	}, []);

  // Trở thành leader và tạo WebSocket connection duy nhất cho tất cả các tab
  const becomeLeader = useCallback(() => {
    if (isLeader.current) return;
    
    isLeader.current = true;

    if (!sharedConnection || sharedConnection.readyState === WebSocket.CLOSED) {
      sharedConnection = new WebSocket(WEBSOCKET_URL);

      sharedConnection.onopen = () => {
        sharedMessages = [{ type: 'bot', text: 'Chào bạn, tôi là Chatbot KTX. Tôi có thể giúp gì cho bạn?' }];
        
        setIsConnected(true);
        setMessages([...sharedMessages]);
        
        channelRef.current?.postMessage({
          type: 'CONNECTION_STATUS',
          data: true
        });
        channelRef.current?.postMessage({
          type: 'NEW_MESSAGE',
          data: sharedMessages
        });
      };

      sharedConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.answer) {
          sharedMessages = [...sharedMessages, { type: 'bot', text: data.answer }];
          
          setMessages([...sharedMessages]);
          
          channelRef.current?.postMessage({
            type: 'NEW_MESSAGE',
            data: sharedMessages
          });
        }
      };

      sharedConnection.onclose = () => {
        sharedMessages = [...sharedMessages, { type: 'bot', text: 'Hệ thống đang bảo trì, vui lòng đợi trong giây lát.' }];
        
        setIsConnected(false);
        setMessages([...sharedMessages]);
        
        channelRef.current?.postMessage({
          type: 'CONNECTION_STATUS',
          data: false
        });
        channelRef.current?.postMessage({
          type: 'NEW_MESSAGE',
          data: sharedMessages
        });
      };

      sharedConnection.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };
    }

    const heartbeat = setInterval(() => {
      if (isLeader.current) {
        localStorage.setItem(LEADER_KEY, Date.now().toString());
      }
    }, 1000);

    return () => clearInterval(heartbeat);
  }, []);

  // Kết nối WebSocket
  const connect = useCallback(() => {
    becomeLeader();
  }, [becomeLeader]);

  // Ngắt kết nối và reset toàn bộ state
  const disconnect = useCallback(() => {
    if (sharedConnection) {
      sharedConnection.close();
      sharedConnection = null;
    }
    
    sharedMessages = [];
    sharedConnected = false;
    isLeader.current = false;
    
    localStorage.removeItem(LEADER_KEY);
    
    channelRef.current?.postMessage({
      type: 'CONNECTION_STATUS',
      data: false
    });
    channelRef.current?.postMessage({
      type: 'NEW_MESSAGE',
      data: []
    });
    
    setIsConnected(false);
    setMessages([]);
  }, []);

  // Gửi tin nhắn và đồng bộ với các tab khác
  const sendMessage = useCallback((text: string) => {
    sharedMessages = [...sharedMessages, { type: 'user', text }];
    
    setMessages([...sharedMessages]);
    
    channelRef.current?.postMessage({
      type: 'NEW_MESSAGE',
      data: sharedMessages
    });

    if (sharedConnection?.readyState === WebSocket.OPEN) {
      sharedConnection.send(text);
    }
  }, []);

  return { messages, isConnected, sendMessage, disconnect, connect };
};