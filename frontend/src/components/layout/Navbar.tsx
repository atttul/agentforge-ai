import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md group-hover:scale-105 transition-transform">
            <Bot size={22} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AgentForge AI
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 tracking-widest font-mono uppercase">Platform</span>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-1.5 hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/30 text-purple-300 font-semibold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
              <span className="text-[10px] text-slate-400">{user?.email}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900 py-1 shadow-xl z-50 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-800 sm:hidden">
                <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <UserIcon size={14} />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
