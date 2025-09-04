import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Image, Mic } from 'lucide-react';
import ChatHeader from '../components/ChatHeader';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  seen?: boolean;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState('last seen 2m ago');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setLastSeen('Parth is typing...');

    try {
      console.log('🔍 Sending message to backend...');
      const response = await fetch('http://localhost:3002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: 'user-' + Date.now()
        }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);

      if (data.success && data.response) {
        // Add assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format from backend');
      }

      // Mark user message as seen
      setMessages(prev => 
        prev.map(msg => 
          msg.role === 'user' && !msg.seen 
            ? { ...msg, seen: true }
            : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setLastSeen('last seen just now');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🤔', '👏', '🙏', '😎', '🚀', '💪', '🎯', '⭐'];

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] pt-16">
      <ChatHeader 
        isTyping={isTyping}
        lastSeen={lastSeen}
        messages={messages}
        profilePhoto="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdjM2FlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xMDAgMTIwIEMgNjAgMTIwLCA0MCAxNjAsIDQwIDIwMCBMIDE2MCAyMDAgQyAxNjAgMTYwLCAxNDAgMTIwLCAxMDAgMTIwIFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iOTAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzdjM2FlZCIvPgogIDxjaXJjbGUgY3g9IjExMCIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjN2MzYWVkIi8+CiAgPHBhdGggZD0iTSA4NSA5MCBRIDEwMCAxMDAsIDExNSA5MCIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0gNjUgNTAgUSAxMDAgMzAsIDEzNSA1MCBRIDEzMCA3MCwgMTAwIDYwIFEgNzAgNzAsIDY1IDUwIFoiIGZpbGw9IiMxZjI5MzciLz4KICA8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3NSIgcng9IjEyIiByeT0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iNzUiIHJ4PSIxMiIgcnk9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMiIgeTE9Ijc1IiB4Mj0iOTgiIHkyPSI3NSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAiIGN5PSIxNzAiIHI9IjgiIGZpbGw9IiNlZjQ0NDQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iOCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo="
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            content={message.content}
            role={message.role}
            seen={message.seen}
            timestamp={message.timestamp}
            profilePhoto="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzdjM2FlZDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI1Y2Y2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik0xMDAgMTIwIEMgNjAgMTIwLCA0MCAxNjAsIDQwIDIwMCBMIDE2MCAyMDAgQyAxNjAgMTYwLCAxNDAgMTIwLCAxMDAgMTIwIFoiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iOTAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzdjM2FlZCIvPgogIDxjaXJjbGUgY3g9IjExMCIgY3k9Ijc1IiByPSI0IiBmaWxsPSIjN2MzYWVkIi8+CiAgPHBhdGggZD0iTSA4NSA5MCBRIDEwMCAxMDAsIDExNSA5MCIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0gNjUgNTAgUSAxMDAgMzAsIDEzNSA1MCBRIDEzMCA3MCwgMTAwIDYwIFEgNzAgNzAsIDY1IDUwIFoiIGZpbGw9IiMxZjI5MzciLz4KICA8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3NSIgcng9IjEyIiByeT0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8ZWxsaXBzZSBjeD0iMTEwIiBjeT0iNzUiIHJ4PSIxMiIgcnk9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdjM2FlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGxpbmUgeDE9IjEwMiIgeTE9Ijc1IiB4Mj0iOTgiIHkyPSI3NSIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI4IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC44Ii8+CiAgPGNpcmNsZSBjeD0iMzAiIGN5PSIxNzAiIHI9IjgiIGZpbGw9IiNlZjQ0NDQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE3MCIgcj0iOCIgZmlsbD0iIzNiODJmNiIgb3BhY2l0eT0iMC44Ii8+Cjwvc3ZnPgo="
          />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] glass">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
            <div className="grid grid-cols-8 gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="p-2 text-xl hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <button 
            className="p-2.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          {/* Image Button */}
          <button 
            className="p-2.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
            title="Send image"
          >
            <Image className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          {/* Input Area */}
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 pr-20 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-2xl resize-none border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isTyping}
            />
            
            {/* Emoji Button */}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 bottom-2 p-1.5 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
          
          {/* Voice Message Button */}
          <button 
            className="p-2.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
            title="Voice message"
          >
            <Mic className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              inputValue.trim() && !isTyping
                ? 'bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white shadow-lg'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
