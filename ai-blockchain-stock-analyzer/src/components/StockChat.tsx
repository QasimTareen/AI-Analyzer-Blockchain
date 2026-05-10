import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Trash2, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function StockChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "GEMINI_READY: I am your AI Market Strategist powered by Google. I can analyze stock trends, market sentiments, and technical indicators with multi-modal reasoning. How can I assist your portfolio today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = "You are the AI Stock Analyzer, a specialized financial assistant. Your expertise is in stock prices, market trends, and technical analysis. Provide high-density, technical market insights. Keep responses concise and professional.";
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const resultText = response.text || "I was unable to generate a response. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: resultText }]);
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `AI_OFFLINE: ${error.message || 'The neural link was interrupted.'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: "MEMORY_WIPED: Ready for new market analysis." 
    }]);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-4 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
                    height: isMinimized ? '80px' : (window.innerWidth < 640 ? 'calc(100vh - 12rem)' : '600px'),
                    width: window.innerWidth < 640 ? 'calc(100vw - 2rem)' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[var(--surface-color)] border border-[var(--border-alpha)] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-alpha)] flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-color)]/10 flex items-center justify-center border border-[var(--accent-color)]/20">
                  <Sparkles className="w-4 h-4 text-[var(--accent-color)]" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic tracking-tighter uppercase">GEMINI_3_FLASH</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-mono opacity-40 uppercase">Neural Link Established</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/5 rounded-lg opacity-40 hover:opacity-100 transition-all"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg opacity-40 hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border",
                        msg.role === 'user' ? "bg-white/5 border-white/10" : "bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20"
                      )}>
                        {msg.role === 'user' ? <User className="w-4 h-4 opacity-40" /> : <Bot className="w-4 h-4 text-[var(--accent-color)]" />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-[12px] leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-[var(--accent-color)] text-[var(--bg-color)] font-bold rounded-tr-none" 
                          : "bg-white/5 border border-white/5 rounded-tl-none font-medium opacity-90"
                      )}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/10 flex items-center justify-center border border-[var(--accent-color)]/20">
                        <Bot className="w-4 h-4 text-[var(--accent-color)] animate-pulse" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none">
                        <div className="flex gap-1">
                          <span className="w-1 h-1 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-[var(--accent-color)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Input */}
                <div className="p-4 sm:p-6 border-t border-[var(--border-alpha)] bg-white/5">
                  <form onSubmit={handleSend} className="relative flex items-center gap-2 sm:gap-3">
                    <button 
                      type="button"
                      onClick={clearChat}
                      className="p-3 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl opacity-20 hover:opacity-100 transition-all border border-transparent hover:border-rose-500/20"
                      title="Clear History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <input 
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Gemini..."
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 sm:px-5 py-3 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]/50 transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-3 bg-[var(--accent-color)] text-[var(--bg-color)] rounded-xl disabled:opacity-50 hover:shadow-glow transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] opacity-20 mt-4 text-center font-black">
                    Gemini Intelligence // Advanced Reasoning Core
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl transition-all border group relative",
          isOpen 
            ? "bg-[var(--surface-color)] border-[var(--border-alpha)] text-[var(--accent-color)]" 
            : "bg-[var(--accent-color)] border-transparent text-[var(--bg-color)] shadow-glow"
        )}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white border-2 border-[var(--accent-color)] rounded-full flex items-center justify-center">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[var(--accent-color)] rounded-full animate-ping" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
