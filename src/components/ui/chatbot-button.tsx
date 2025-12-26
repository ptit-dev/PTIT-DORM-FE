import { useState, useRef, useEffect } from 'react';
import { MessageSquareText, X, SendHorizonal, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbotVisibility } from '@/hooks/use-chatbot-visibility';
import { useWebSocketChat } from '@/hooks/use-websocket-chat';

const StatusDot = ({ isConnected }: { isConnected: boolean }) => (
  <span
    className={`inline-block w-3 h-3 rounded-full mr-2 ${
      isConnected ? 'bg-green-500 shadow-green-500/50' : 'bg-yellow-500 shadow-yellow-500/50'
    } shadow-lg animate-pulse`}
  ></span>
);

const FormattedMessage = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*|\n)/g).map((part, index) => {
    if (part === '\n') {
      return <br key={index} />;
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <strong key={index} className="text-red-600 font-bold">
          {content}
        </strong>
      );
    }
    return part;
  });

  return <>{parts}</>;
};

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const isVisible = useChatbotVisibility();
  const { messages, isConnected, sendMessage, connect, disconnect } = useWebSocketChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Đóng khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const normalWidth = 'w-80';
  const normalHeight = 'h-96';

  const maximizedWidth = 'w-[95vw] md:w-[600px]';
  const maximizedHeight = 'h-[60vh] md:max-h-[600px]';

  const modalClasses = isMaximized
    ? `fixed bottom-24 right-4 bg-white border border-gray-200 shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-in-out ${maximizedWidth} ${maximizedHeight} z-[100]`
    : `absolute bottom-0 right-0 bg-white border border-gray-200 shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-in-out ${normalWidth} ${normalHeight} mb-20`;

  return (
    <div className="fixed bottom-6 right-6 z-[100]" ref={chatRef}>
      {/* Nút bật tắt */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !isConnected) connect();
        }}
        className="rounded-full h-14 w-14 bg-red-700 hover:bg-red-800 shadow-lg transition-transform hover:scale-105 active:scale-95"
        title={isOpen ? 'Đóng Chatbot' : 'Mở Chatbot'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className={modalClasses}>
          {/* Header */}
          <div className="p-3 bg-red-700 text-white rounded-t-lg flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg">Chatbot Ký túc xá PTIT</h3>
            <div className="flex items-center gap-2">
              <StatusDot isConnected={isConnected} />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-white hover:bg-red-600 h-7 w-7"
                title={isMaximized ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  disconnect();
                }}
                className="text-white hover:bg-red-600 h-7 w-7"
                title="Đóng chatbot"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-sm space-y-3 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl whitespace-pre-wrap ${
                    msg.type === 'user'
                      ? 'bg-red-700 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200 w-full text-justify'
                  }`}
                >
                  {msg.type === 'bot' ? <FormattedMessage text={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Hỏi về KTX PTIT..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isConnected}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!isConnected || !input.trim()}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-10 w-10"
            >
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;
