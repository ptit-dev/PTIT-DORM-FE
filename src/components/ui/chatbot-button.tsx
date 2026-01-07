import { useState, useRef, useEffect } from 'react';
import { X, SendHorizonal, Minimize2, Maximize2 } from 'lucide-react';
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
    if (part === '\n') return <br key={index} />;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="text-yellow-600 font-bold">
          {part.slice(2, -2)}
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động thay đổi chiều cao ô nhập liệu
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const modalClasses = isMaximized
    ? `fixed bottom-24 right-4 bg-white border border-gray-200 shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-in-out w-[95vw] md:w-[600px] h-[60vh] md:max-h-[600px] z-[100]`
    : `absolute bottom-20 right-0 bg-white border border-gray-200 shadow-xl rounded-lg flex flex-col transition-all duration-300 ease-in-out w-96 h-96 z-[100]`;

  return (
    <div className="fixed bottom-6 right-6 z-[100]" ref={chatRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !isConnected) connect();
        }}
        className="rounded-full h-14 w-14 shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
      >
        <img alt="chatbot" src="https://slink.ptit.edu.vn/images/chatbot.png" className="h-full w-full object-cover" />
      </button>

      {isOpen && (
        <div className={modalClasses}>
          <div className="p-3 bg-red-700 text-white rounded-t-lg flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src="https://slink.ptit.edu.vn/images/chatbot.png" className="h-6 w-6 rounded-full animate-bounce" alt="icon" />
              <h3 className="font-bold text-lg">PTIT Dorm Chatbot</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot isConnected={isConnected} />
              <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)} className="text-white hover:bg-red-600 h-7 w-7">
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); disconnect(); }} className="text-white hover:bg-red-600 h-7 w-7">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-3 overflow-y-auto text-sm space-y-3 custom-scrollbar relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <img src="https://slink.ptit.edu.vn/images/chatbot.png" className="w-1/2" alt="watermark" />
            </div>
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}>
                {msg.type === 'bot' && (
                  <img src="https://slink.ptit.edu.vn/images/chatbot_ava.png" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" alt="bot" />
                )}
                {/* Sửa width: break-words giúp tin nhắn dài tự xuống dòng */}
                <div className={`max-w-[75%] px-3 py-2 rounded-xl break-words ${
                  msg.type === 'user'
                    ? 'bg-gray-100 text-gray-800 rounded-br-none border border-gray-200'
                    : 'bg-red-700 text-white rounded-tl-none text-justify'
                }`}>
                  {msg.type === 'bot' ? <FormattedMessage text={msg.text} /> : msg.text}
                </div>
                {msg.type === 'user' && (
                  <img src="https://res.cloudinary.com/drly2lfdz/image/upload/v1766835711/iconptit_gtkanp.png" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" alt="user" />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập liệu mới với Textarea tự co giãn */}
          <form onSubmit={handleSubmit} className="p-3 border-t flex items-end gap-2 flex-shrink-0 bg-white">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Hỏi về KTX PTIT..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
            />
            <Button type="submit" size="icon" disabled={!isConnected || !input.trim()} className="bg-red-600 hover:bg-red-700 text-white h-10 w-10 flex-shrink-0">
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;