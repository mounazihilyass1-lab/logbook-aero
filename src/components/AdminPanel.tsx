import React from 'react';
import { Users, Trash2, Mail, Shield, User, X, Notebook, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PilotProfile } from '../types';

interface AdminPanelProps {
  profiles: PilotProfile[];
  onDeleteUser: (uid: string) => Promise<void>;
  onViewPilotLogbook: (uid: string, name: string) => void;
}

export function AdminPanel({ profiles, onDeleteUser, onViewPilotLogbook }: AdminPanelProps) {
  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Terminal Control</h2>
          <p className="text-zinc-500 mt-1">Manage pilot access and system terminals.</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden">

        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/20">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Pilot Registry</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pilot</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">License</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UID Reference</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Access Control</th>
              </tr>
            </thead>
            <tbody>
              {profiles.filter(p => !p.isAdmin).map((pilot) => (
                <tr key={pilot.uid} className="border-b border-zinc-800/30 group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-zinc-700">
                        {pilot.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{pilot.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">PILOT-IN-COMMAND</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">
                      {pilot.licenseId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-mono text-zinc-600 truncate max-w-[120px]">{pilot.uid}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onViewPilotLogbook(pilot.uid, pilot.name)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="View Logbook"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm(`Are you sure you want to PERMANENTLY delete account "${pilot.name}"? This will erase all their flight logs.`)) {
                            onDeleteUser(pilot.uid);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Decommission Terminal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.filter(p => !p.isAdmin).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-xs text-zinc-600 uppercase tracking-widest">No active pilot terminals registered</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <p className="text-sm font-bold text-emerald-500 uppercase tracking-tight">Administrative Privileges Active</p>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl font-medium">
          As the system administrator, you have complete authority over the Logbook Pro registry. 
          Decommissioning a terminal will permanently erase all associated flight hours, medical papers, and pilot metadata from the encryption cluster.
        </p>
      </div>
    </div>
  );
}
