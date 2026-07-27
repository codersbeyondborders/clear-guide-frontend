'use client'

import { useRef, useEffect, useState } from 'react'
import { Bot, User } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { highContrast } = useAccessibility()
  const hc = highContrast
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${hc ? 'bg-yellow-400' : 'bg-primary-subtle'}`}
          aria-hidden="true"
        >
          <Bot className={`w-3.5 h-3.5 ${hc ? 'text-black' : 'text-primary'}`} />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed text-pretty ${
          isUser
            ? hc ? 'bg-yellow-400 text-black rounded-tr-none' : 'bg-primary text-white rounded-tr-none'
            : hc ? 'bg-gray-900 text-yellow-200 border border-yellow-400/40 rounded-tl-none' : 'bg-background-subtle text-foreground border border-border rounded-tl-none'
        }`}
        role="article"
        aria-label={`${isUser ? 'You' : 'AI assistant'}: ${message.content}`}
      >
        {message.content}
      </div>
      {isUser && (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${hc ? 'bg-yellow-600' : 'bg-background-subtle border border-border'}`}
          aria-hidden="true"
        >
          <User className={`w-3.5 h-3.5 ${hc ? 'text-black' : 'text-muted-foreground'}`} />
        </div>
      )}
    </div>
  )
}

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Ask a question...' }: ChatInputProps) {
  const { highContrast } = useAccessibility()
  const hc = highContrast
  const [value, setValue] = useState('')
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening'>('idle')
  const recognitionRef = useRef<any>(null)

  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
  }

  const handleMic = () => {
    if (voiceStatus === 'listening') {
      recognitionRef.current?.stop()
      setVoiceStatus('idle')
      return
    }
    if (!SpeechRecognition) return
    const r = new SpeechRecognition()
    r.lang = 'en-US'
    r.interimResults = false
    recognitionRef.current = r
    r.onstart = () => setVoiceStatus('listening')
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setValue(text)
      setVoiceStatus('idle')
    }
    r.onerror = () => setVoiceStatus('idle')
    r.onend = () => setVoiceStatus('idle')
    r.start()
  }

  const micActive = voiceStatus === 'listening'

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2" aria-label="Chat message input">
      {SpeechRecognition && (
        <button
          type="button"
          onClick={handleMic}
          disabled={disabled}
          aria-label={micActive ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={micActive}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 flex-shrink-0 ${
            micActive
              ? hc ? 'bg-yellow-400 text-black focus-visible:outline-yellow-400' : 'bg-red-500 text-white focus-visible:outline-red-500'
              : hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border border-border text-muted-foreground hover:text-primary hover:border-primary focus-visible:outline-primary'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      )}

      <label htmlFor="chat-input" className="sr-only">Type your message</label>
      <input
        id="chat-input"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={micActive ? 'Listening...' : placeholder}
        disabled={disabled || micActive}
        className={`flex-1 h-10 px-4 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 ${
          hc
            ? 'bg-black border border-yellow-400 text-yellow-400 placeholder:text-yellow-700 focus:ring-yellow-400'
            : 'bg-background-subtle border border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary'
        }`}
        aria-live="polite"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 flex-shrink-0 ${hc ? 'bg-yellow-400 text-black hover:bg-yellow-300 focus-visible:outline-yellow-400' : 'bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  )
}

interface ChatContainerProps {
  manualId: string
  productName?: string
}

export function ChatContainer({ manualId, productName }: ChatContainerProps) {
  const { highContrast, fontSizeClass } = useAccessibility()
  const hc = highContrast

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', content: `Hi! I'm your AI assistant for the ${productName ?? 'product'} manual. Ask me anything — setup, troubleshooting, maintenance, or general questions.` },
  ])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Build conversation history for context (last 10 turns)
    const history = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: m.content,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ message: text, manualId, history }),
      })

      if (!res.ok || !res.body) throw new Error('Bad response')

      const contentType = res.headers.get('content-type') ?? ''

      if (contentType.includes('text/event-stream')) {
        // SSE streaming path
        const aiId = (Date.now() + 1).toString()
        setMessages(prev => [...prev, { id: aiId, role: 'ai', content: '' }])
        setLoading(false)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

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
              setMessages(prev =>
                prev.map(m => m.id === aiId ? { ...m, content: m.content + token } : m)
              )
            } catch { /* skip malformed chunks */ }
          }
        }
      } else {
        // JSON fallback path
        const data = await res.json()
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: data.reply ?? "I'm sorry, I couldn't process that request.",
        }
        setMessages(prev => [...prev, aiMsg])
        setLoading(false)
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
      }])
      setLoading(false)
    }
  }

  // Suggested questions
  const suggestions = ['How do I set it up?', 'What if it\'s not working?', 'How do I clean it?']

  return (
    <div className={`flex flex-col h-full rounded-2xl border overflow-hidden ${hc ? 'bg-black border-yellow-400' : 'bg-card border-border'}`}>
      {/* Chat header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${hc ? 'bg-gray-900 border-yellow-400' : 'bg-primary border-border'}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${hc ? 'bg-yellow-400' : 'bg-white/20'}`} aria-hidden="true">
          <Bot className={`w-4 h-4 ${hc ? 'text-black' : 'text-white'}`} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${hc ? 'text-yellow-400' : 'text-white'}`}>AI Assistant</p>
          <p className={`text-xs ${hc ? 'text-yellow-600' : 'text-white/70'}`}>
            {productName ? `Expert on ${productName}` : 'Ask me anything'}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${fontSizeClass}`}
        aria-live="polite"
        aria-label="Chat conversation"
        role="log"
      >
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start" aria-live="assertive">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${hc ? 'bg-yellow-400' : 'bg-primary-subtle'}`} aria-hidden="true">
              <Bot className={`w-3.5 h-3.5 ${hc ? 'text-black' : 'text-primary'}`} />
            </div>
            <div className={`rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 ${hc ? 'bg-gray-900 border border-yellow-400/40' : 'bg-background-subtle border border-border'}`}>
              {[0, 150, 300].map(delay => (
                <span key={delay} className={`w-2 h-2 rounded-full animate-bounce block ${hc ? 'bg-yellow-400' : 'bg-primary'}`} style={{ animationDelay: `${delay}ms` }} />
              ))}
              <span className="sr-only">AI is typing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !loading && (
        <div className={`px-4 pb-2 flex flex-wrap gap-2 ${hc ? 'border-t border-yellow-400/40' : 'border-t border-border'}`}>
          <p className={`w-full text-xs mt-2 mb-1 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>Suggested questions:</p>
          {suggestions.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border text-muted-foreground hover:text-primary hover:border-primary focus-visible:outline-primary'}`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`p-4 border-t ${hc ? 'border-yellow-400 bg-gray-900' : 'border-border bg-card'}`}>
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  )
}
