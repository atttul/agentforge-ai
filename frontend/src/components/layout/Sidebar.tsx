import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FileText,
  MessageSquare,
  FolderKanban,
  User,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'AI Agents', path: '/agents', icon: <Bot size={18} /> },
    { label: 'Knowledge Base', path: '/documents', icon: <FileText size={18} /> },
    { label: 'Chat & Execution', path: '/conversations', icon: <MessageSquare size={18} /> },
    { label: 'Projects', path: '/projects', icon: <FolderKanban size={18} /> },
    { label: 'Account Profile', path: '/profile', icon: <User size={18} /> },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/50 p-4 hidden md:block min-h-[calc(100vh-4rem)]">
      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
        <p className="font-semibold text-slate-300 mb-1">Gemini AI & Pinecone</p>
        <p className="text-slate-500">Connected & Engine Active</p>
      </div>
    </aside>
  );
};
