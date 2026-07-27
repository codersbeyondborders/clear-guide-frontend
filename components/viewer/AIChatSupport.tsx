"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface AIChatSupportProps {
  manualId: string;
  highContrast?: boolean;
  audioEnabled?: boolean;
}

export function AIChatSupport({ manualId, highContrast = false, audioEnabled = false }: AIChatSupportProps) {
  const hc = highContrast;
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: "Hi! I'm your AI Support Assistant. Type a question or tap the mic to speak." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tts, setTts] = useState(audioEnabled);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition = (window as any)?.SpeechRecognition || (window as any)?.webkitSpeechRecognition;
  const micSupported = !!SpeechRecognition;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: m.content,
    }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ message: text, manualId, history }),
      });

      const contentType = response.headers.get('content-type') ?? ''

      if (contentType.includes('text/event-stream') && response.body) {
        const aiId = (Date.now() + 1).toString()
        setMessages(prev => [...prev, { id: aiId, role: 'ai', content: '' }])
        setIsLoading(false)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullReply = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const token = JSON.parse(data) as string
              fullReply += token
              setMessages(prev =>
                prev.map(m => m.id === aiId ? { ...m, content: m.content + token } : m)
              )
            } catch { /* skip malformed */ }
          }
        }

        if (tts && fullReply && typeof window !== 'undefined') {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(fullReply));
        }
      } else {
        const data = await response.json();
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: data.reply };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false)
        if (tts && typeof window !== 'undefined') {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply));
        }
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
      setIsLoading(false)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleMic = () => {
    if (voiceStatus === 'listening') {
      recognitionRef.current?.stop();
      setVoiceStatus('idle');
      return;
    }
    if (!micSupported) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setVoiceStatus('listening');
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setVoiceStatus('thinking');
      sendMessage(text).then(() => setVoiceStatus('idle'));
    };
    recognition.onerror = () => setVoiceStatus('idle');
    recognition.onend = () => setVoiceStatus('idle');
    recognition.start();
  };

  const micActive = voiceStatus === 'listening';
  const micBtn = micActive
    ? hc ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'
    : hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary';

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border overflow-hidden ${hc ? 'bg-black border-yellow-400' : 'shadow-sm'}`}
      style={hc ? undefined : { backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      role="region"
      aria-label="AI Support Chat"
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 border-b ${hc ? 'border-yellow-400 bg-gray-900' : ''}`}
        style={hc ? undefined : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-primary)' }}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hc ? 'bg-yellow-400' : 'bg-white/20'}`}>
          <Bot className={`w-4 h-4 ${hc ? 'text-black' : 'text-white'}`} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className={`font-semibold text-sm ${hc ? 'text-yellow-400' : 'text-white'}`}>AI Chat</h2>
          <p className={`text-xs ${hc ? 'text-yellow-600' : 'text-emerald-100'}`}>
            {voiceStatus === 'listening' ? '🎙 Listening...' : voiceStatus === 'thinking' ? '⏳ Processing...' : 'Type or speak your question'}
          </p>
        </div>
        <button
          onClick={() => { setTts(p => !p); typeof window !== 'undefined' && window.speechSynthesis.cancel(); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            tts
              ? hc ? 'bg-yellow-400 text-black' : 'bg-white/30 text-white'
              : hc ? 'border border-yellow-600 text-yellow-600' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
          aria-label={tts ? 'Mute AI responses' : 'Speak AI responses aloud'}
          aria-pressed={tts}
          title={tts ? 'Audio on' : 'Audio off'}
        >
          {tts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${hc ? 'bg-yellow-400' : 'bg-emerald-100'}`} aria-hidden="true">
                <Bot className={`w-3.5 h-3.5 ${hc ? 'text-black' : 'text-emerald-600'}`} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? hc ? 'bg-yellow-400 text-black rounded-tr-none' : 'rounded-tr-none'
                  : hc ? 'bg-gray-900 text-yellow-300 border border-yellow-400 rounded-tl-none' : 'rounded-tl-none border'
              }`}
              style={!hc ? {
                backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-background-subtle)',
                color: msg.role === 'user' ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                borderColor: msg.role === 'ai' ? 'var(--color-border)' : undefined,
              } : undefined}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${hc ? 'bg-yellow-600' : ''}`}
                style={!hc ? { backgroundColor: 'var(--color-border)' } : undefined}
                aria-hidden="true"
              >
                <User
                  className={`w-3.5 h-3.5 ${hc ? 'text-black' : ''}`}
                  style={!hc ? { color: 'var(--color-muted-foreground)' } : undefined}
                />
              </div>
            )}
          </div>
        ))}

        {(isLoading || voiceStatus === 'thinking') && (
          <div className="flex gap-2.5 justify-start">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${hc ? 'bg-yellow-400' : 'bg-emerald-100'}`}>
              <Bot className={`w-3.5 h-3.5 ${hc ? 'text-black' : 'text-emerald-600'}`} />
            </div>
            <div
              className={`rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 ${hc ? 'bg-gray-900 border border-yellow-400' : 'border'}`}
              style={!hc ? { backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' } : undefined}
            >
              {[0, 150, 300].map((delay) => (
                <div key={delay} className={`w-2 h-2 rounded-full animate-bounce ${hc ? 'bg-yellow-400' : 'bg-emerald-400'}`} style={{ animationDelay: `${delay}ms` }} />
              ))}
              <span className="sr-only">AI is typing...</span>
            </div>
          </div>
        )}

        {voiceStatus === 'listening' && (
          <div className="flex justify-center py-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${hc ? 'bg-yellow-400 text-black' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${hc ? 'bg-black' : 'bg-red-500'}`} />
              Listening — tap mic to stop
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div
        className={`p-4 border-t ${hc ? 'border-yellow-400 bg-gray-900' : ''}`}
        style={!hc ? { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' } : undefined}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          {micSupported && (
            <button
              type="button"
              onClick={handleMic}
              disabled={isLoading || voiceStatus === 'thinking'}
              aria-label={micActive ? 'Stop listening' : 'Start voice input'}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 ${micBtn}`}
            >
              {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={micActive ? 'Listening...' : 'Ask a question...'}
            disabled={isLoading || voiceStatus !== 'idle'}
            aria-label="Type your message"
            className={`flex-1 h-10 px-4 rounded-full text-sm focus:outline-none focus:ring-2 transition border ${
              hc
                ? 'bg-black border-yellow-400 text-yellow-400 placeholder:text-yellow-700 focus:ring-yellow-400'
                : 'focus:border-transparent'
            }`}
            style={!hc ? {
              backgroundColor: 'var(--color-background-subtle)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
            } : undefined}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || voiceStatus !== 'idle'}
            aria-label="Send message"
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 ${
              hc ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
