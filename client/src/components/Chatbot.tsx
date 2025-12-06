import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || '/api';

  const clientFallbackResponses: Record<string, string> = {
    evening: '🌙 Evening Safety Tips:\n• Stay on well-lit routes\n• Share location with a trusted contact\n• Keep phone charged and volume up\n• Prefer familiar paths and avoid shortcuts',
    emergency: '🆘 Emergency Help:\n• Call emergency services immediately\n• Use the SOS button in the app\n• Share your live location with contacts\n• Move to a lit, public spot if safe',
    area: '📍 Current Area Safety:\n• Check the safety map for alerts\n• Stay near populated, well-lit areas\n• Keep valuables hidden and stay alert',
    default: 'I can help with safety tips, routes, and emergency guidance. Ask me about evening safety, your current area, or how to prepare.'
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Safety Assistant. I can help you with safety tips, route planning, emergency contacts, and more. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    const intent = (() => {
      const m = userMessage.toLowerCase();
      if (m.includes('evening') || m.includes('night') || m.includes('dark')) return 'evening';
      if (m.includes('emergency') || m.includes('help') || m.includes('danger')) return 'emergency';
      if (m.includes('area') || m.includes('location') || m.includes('safe zone')) return 'area';
      return 'default';
    })();

    try {
      const response = await fetch(`${API_BASE}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'safety-zones-app',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || 'I couldn\'t process that. Please try again.';
    } catch (error) {
      console.error('Chatbot error:', error);
      return clientFallbackResponses[intent] || clientFallbackResponses.default;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botReply = await generateBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get bot response:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your AI Safety Assistant. I can help you with safety tips, route planning, emergency contacts, and more. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Safety Assistant"
      >
        <span className="chatbot-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" role="presentation" focusable="false">
            <defs>
              <linearGradient id="chatGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f6c343" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <path
              d="M6 6c0-1.105.895-2 2-2h16c1.105 0 2 .895 2 2v11c0 1.105-.895 2-2 2H13l-5 5v-5H8c-1.105 0-2-.895-2-2V6Z"
              fill="url(#chatGlow)"
              stroke="#0a0a0f"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="12" r="1.3" fill="#0a0a0f" />
            <circle cx="16" cy="12" r="1.3" fill="#0a0a0f" />
            <circle cx="21" cy="12" r="1.3" fill="#0a0a0f" />
          </svg>
        </span>
        {!isOpen && <span className="chatbot-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="bot-icon">🤖</span>
              <div>
                <h3>AI Safety Assistant</h3>
                <p>Your personal safety guide</p>
              </div>
            </div>
            <div className="chatbot-controls">
              <button
                className="chatbot-clear-btn"
                onClick={handleClearChat}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about safety..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="chatbot-send-btn"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="chatbot-quick-actions">
            <button onClick={() => setInput('Safety tips for evening travel')}>
              🌙 Evening Safety
            </button>
            <button onClick={() => setInput('What\'s in my current area?')}>
              📍 Current Area
            </button>
            <button onClick={() => setInput('Emergency contacts near me')}>
              🆘 Emergency Help
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
