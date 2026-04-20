import React, { useState } from 'react';
import { Settings, Shield, User, Bell, Database, Trash2, Globe, Moon, Save, Edit, X } from 'lucide-react';
import { motion } from 'motion/react';

import { Flight, PilotProfile } from '../types';
import { exportToPDF } from '../lib/exportUtils';
import { FileDown } from 'lucide-react';

interface SettingsViewProps {
  flights: Flight[];
  profile: PilotProfile | null;
  onSaveProfile: (profile: PilotProfile) => Promise<void>;
}

export function SettingsView({ flights, profile, onSaveProfile }: SettingsViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editLicense, setEditLicense] = useState(profile?.licenseId || '');

  const handleSave = async () => {
    if (!profile) return;
    await onSaveProfile({
      ...profile,
      name: editName,
      licenseId: editLicense,
    });
    setIsEditingProfile(false);
  };

  const sections = [
    {
      title: "Navigation & Display",
      icon: Globe,
      items: [
        { label: "Default Projection", value: "Mercator", type: "select" },
        { label: "Interface Theme", value: "Elegant Dark", type: "badge" },
        { label: "Unit System", value: "Imperial (Knots/Feet)", type: "badge" },
      ]
    },
    {
      title: "System & Safety",
      icon: Shield,
      items: [
        { label: "Automatic Cloud Backup", value: "Active", type: "toggle", active: true },
        { label: "Security Protocol", value: "Standard RSA", type: "badge" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-zinc-500 mt-1">Configure your flight deck and personal preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Pilot Profile Section - Dynamic & Editable */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Pilot Profile</h3>
            </div>
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleSave}
                  className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Profile Name</p>
                <p className="text-xs text-zinc-500">Pilot identification name</p>
              </div>
              <div className="flex items-center gap-3">
                {isEditingProfile ? (
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {profile?.name || 'Loading...'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">ATP License ID</p>
                <p className="text-xs text-zinc-500">Official license credentials</p>
              </div>
              <div className="flex items-center gap-3">
                {isEditingProfile ? (
                  <input 
                    type="text"
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {profile?.licenseId || 'N/A'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/20">
              <section.icon className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">{section.title}</h3>
            </div>
            <div className="p-6 space-y-6">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.label}</p>
                    <p className="text-xs text-zinc-500">System identification property</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.type === 'text' && (
                      <span className="text-sm font-mono text-zinc-400 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                        {item.value}
                      </span>
                    )}
                    {item.type === 'badge' && (
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        {item.value}
                      </span>
                    )}
                    {item.type === 'toggle' && (
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${item.active ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                        <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${item.active ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="pt-8 space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Logbook Operations</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-sm font-bold text-white uppercase tracking-tight">Generate Official Report</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Aviation standard PDF export • Full flight history</p>
            </div>
            <button 
              onClick={() => exportToPDF(flights, profile?.name || 'Pilot')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              <FileDown className="w-4 h-4" />
              Download Logbook PDF
            </button>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <h3 className="text-xs font-bold text-rose-500 uppercase tracking-[0.2em] ml-1">Danger Zone</h3>
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-sm font-bold text-rose-500">Wipe Local Database</p>
              <p className="text-xs text-rose-900/60 uppercase font-bold tracking-widest">Permanent extraction • Irreversible operation</p>
            </div>
            <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/20">
              <Trash2 className="w-4 h-4" />
              Purge All Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
