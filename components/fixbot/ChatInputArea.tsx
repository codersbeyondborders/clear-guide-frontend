import { useState, useRef } from 'react';
import { Plus, Mic, ArrowUp, X } from 'lucide-react';

export function ChatInputArea({ onSendMessage }: { onSendMessage: (msg: string, file?: File) => void }) {
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || attachedFile) {
      onSendMessage(message, attachedFile || undefined);
      setMessage('');
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      <div className="relative bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col p-2 transition-shadow focus-within:shadow-md focus-within:border-emerald-300 focus-within:ring-1 focus-within:ring-emerald-200">
        
        {/* File Attachment Preview */}
        {attachedFile && (
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm text-emerald-800">
              <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
              <button 
                onClick={removeFile}
                className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 p-0.5 rounded-full transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message... Try uploading a manual or snapping a photo of your issue."
          className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 py-3 px-3 min-h-[60px] outline-none"
          rows={2}
        />
        
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,image/*" 
              onChange={handleFileChange}
            />
            <button 
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center gap-1 group relative"
              onClick={() => fileInputRef.current?.click()}
              title="Upload PDF Manual or Image"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-full transition-colors ${(message.trim() || attachedFile) ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300'}`}
              onClick={handleSend}
              disabled={!message.trim() && !attachedFile}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
