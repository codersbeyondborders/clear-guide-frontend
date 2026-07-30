import { Bot } from 'lucide-react';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
};

export function MessageBubble({ role, content }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full max-w-3xl mx-auto gap-4 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-emerald-100 text-emerald-600'}`}>
        {isUser ? 'U' : <Bot className="w-5 h-5" />}
      </div>
      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-slate-100 text-slate-900 rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}
