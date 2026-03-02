'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { chatWithPaper, ChatMessage } from '@/lib/api';
import MarkdownRenderer from './MarkdownRenderer';

interface PaperChatProps {
  paperText: string;
}

export default function PaperChat({ paperText }: PaperChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await chatWithPaper(trimmed, paperText, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, something went wrong. ${err instanceof Error ? err.message : ''}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent hover:bg-accent-muted
            rounded-full shadow-lg shadow-accent/20 flex items-center justify-center
            transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-6 h-6 text-background" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] max-h-[80vh]
            bg-surface border border-border rounded-2xl shadow-2xl shadow-black/30
            flex flex-col overflow-hidden
            animate-fade-in-up"
          style={{ maxWidth: 'calc(100vw - 48px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Ask about this paper</p>
                <p className="text-xs text-text-secondary">Powered by Nemotron</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  Ask anything about this paper — concepts, methods, results, or anything you didn&apos;t understand.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Summarize the key findings', 'Explain the methodology', 'What are the limitations?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent
                        hover:bg-accent/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-background rounded-br-md'
                      : 'bg-background border border-border text-text-primary rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} className="chat-markdown" />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border bg-surface">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary
                  placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                  transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-accent hover:bg-accent-muted rounded-xl transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4 text-background" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
