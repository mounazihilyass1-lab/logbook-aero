import React, { useState } from 'react';
import { LayoutDashboard, Notebook, Settings, History, CheckCircle2, Plus, Trash2, X, FileText, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { PilotStats, PilotPaper, PilotProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: PilotStats;
  papers: PilotPaper[];
  onSavePaper: (paper: PilotPaper) => void;
  onDeletePaper: (id: string) => void;
  profile: PilotProfile | null;
}

export function Sidebar({ activeTab, setActiveTab, stats, papers, onSavePaper, onDeletePaper, profile }: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPaper, setNewPaper] = useState({ name: '', expiryDate: '' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Logbook', icon: Notebook },
    { id: 'papers', label: 'Papers', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (profile?.isAdmin) {
    menuItems.push({ id: 'admin', label: 'Terminal Control', icon: Shield });
  }

  const handleAdd = () => {
    if (newPaper.name && newPaper.expiryDate) {
      onSavePaper({
        id: Math.random().toString(36).substr(2, 9),
        ...newPaper
      });
      setNewPaper({ name: '', expiryDate: '' });
      setIsAdding(false);
    }
  };

  const getDaysRemaining = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-zinc-800 bg-[#070708] p-6 flex-col h-full overflow-y-auto">
      <div className="mb-10">
        <label className="mb-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Pilot in Command</label>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 p-px">
              <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-500 uppercase">{profile?.name.charAt(0) || 'I'}</span>
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white capitalize">{profile?.name || 'Pilot'}</p>
              <p className="text-[11px] font-mono text-zinc-500 uppercase">{profile?.isAdmin ? 'ADMINISTRATOR' : `ATP ID: ${profile?.licenseId || 'N/A'}`}</p>
            </div>
          </div>
      </div>

      <div className="space-y-8 flex-1">
        <div>
          <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Navigation</label>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm",
                  activeTab === item.id 
                    ? "bg-blue-600/10 text-blue-400 font-semibold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300")} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div>
          <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Flight Experience</label>
          <div className="space-y-4">
            <div className="group cursor-default">
              <div className="flex items-end justify-between">
                <span className="text-xs text-zinc-400 font-medium">Total Time</span>
                <span className="text-xl font-light tracking-tighter text-white font-mono">{`${Math.floor(stats.totalHours)}h ${Math.round((stats.totalHours % 1) * 60)}m`}</span>
              </div>
              <div className="mt-2 h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000"
                  style={{ width: `${Math.min((stats.totalHours / 1500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Night</p>
                <p className="text-sm font-medium text-zinc-300 font-mono">{`${Math.floor(stats.nightHours)}h ${Math.round((stats.nightHours % 1) * 60)}m`}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Landings</p>
                <p className="text-sm font-medium text-zinc-300 font-mono">{stats.landings}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
