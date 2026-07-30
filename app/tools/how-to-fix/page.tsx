'use client';

import { useState } from 'react';
import { Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ChatInputArea } from '../../../components/fixbot/ChatInputArea';
import { SuggestionCards } from '../../../components/fixbot/SuggestionCards';
import { MessageBubble } from '../../../components/fixbot/MessageBubble';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function FixBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string, file?: File) => {
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text || (file ? `[Attached File: ${file.name}]` : '') };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let body;
      let headers: HeadersInit = { 'Content-Type': 'application/json' };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (file) {
        // 1. Get Signed URL
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
        const uploadHeaders: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;

        const signRes = await fetch(`${apiUrl}/api/upload/diagnostic-signed-url`, {
          method: 'POST',
          headers: uploadHeaders,
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });
        
        if (!signRes.ok) {
          throw new Error('Failed to get upload URL');
        }
        
        const { signedUrl, publicUrl } = await signRes.json();
        
        // 2. Upload file to GCS
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file');
        }

        // 3. Send message with fileUrl
        body = JSON.stringify({ message: text, fileUrl: publicUrl, mimeType: file.type });
      } else {
        body = JSON.stringify({ message: text });
      }

      // Backend call to the proxy route
      const res = await fetch(`${apiUrl}/api/fixbot/chat`, {
        method: 'POST',
        headers,
        body,
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Error: ${data.error || 'Failed to get response'}` }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Network error communicating with FixBot.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative w-full max-w-5xl mx-auto">
        {/* Top Header */}
        <header className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-4 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md flex items-center gap-1.5">
            ✨ Go Enthusiast!
          </button>
        </header>

        {/* Chat Messages / Empty State Area */}
        <div className="flex-1 overflow-y-auto pt-24 pb-8 px-4 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full opacity-50 scale-150"></div>
                <img src="/fixbot-illustration.svg" alt="FixBot" className="w-32 h-32 relative z-10 hidden" />
                <div className="w-32 h-32 relative z-10 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl shadow-blue-500/10">
                  <Bot className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">How can we help?</h1>
              <SuggestionCards onSelect={handleSuggestionSelect} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col pb-4 w-full">
              {messages.map(msg => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex w-full max-w-3xl mx-auto gap-4 mb-6 flex-row">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col max-w-[80%] items-start">
                    <div className="px-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area Sticky Bottom */}
        <div className="w-full bg-gradient-to-t from-white via-white to-transparent pt-4 pb-6 px-4">
          <ChatInputArea onSendMessage={handleSendMessage} />
          <p className="text-center text-xs text-slate-400 mt-4 font-medium">
            Answers grounded in <span className="text-emerald-600 font-bold">iFixit</span>'s library of community-verified guides, OEM service manuals, and 20+ years of real repair knowledge.
          </p>
        </div>
      </main>
    </div>
  );
}
