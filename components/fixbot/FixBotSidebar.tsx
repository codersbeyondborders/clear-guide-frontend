import Link from 'next/link';
import { Bot, Folder, MessageSquare, MoreHorizontal, PenSquare, LayoutDashboard } from 'lucide-react';

export function FixBotSidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  return (
    <aside
      className={`fixed md:relative z-20 flex flex-col w-72 h-full bg-slate-50 border-r border-slate-200 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/tools/how-to-fix" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">FixBot</span>
        </Link>
        <button className="md:hidden p-2 text-slate-400 hover:text-slate-600" onClick={toggleSidebar}>
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
            <span>Folders</span>
            <button className="text-slate-300 hover:text-slate-500">+</button>
          </div>
          <div className="space-y-1">
            <div className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer flex items-center gap-2">
              <Folder className="w-4 h-4 text-slate-400" />
              Kitchen Appliances
            </div>
            <div className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer flex items-center gap-2">
              <Folder className="w-4 h-4 text-slate-400" />
              Electronics
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Today
          </div>
          <div className="space-y-1">
            <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium cursor-pointer flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Fixing a Fridge Ice Maker
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 mt-auto bg-white">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">Abdul Wajid Parray</p>
            <p className="text-xs text-slate-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
