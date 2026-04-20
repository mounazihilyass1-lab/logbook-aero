import React, { useState } from 'react';
import { Flight } from '../types';
import { calculateDuration } from '../lib/utils';
import { X, Save, Plane, Calendar, MapPin, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LogEntryFormProps {
  onSave: (flight: Flight) => void;
  onClose: () => void;
}

export function LogEntryForm({ onSave, onClose }: LogEntryFormProps) {
  const [formData, setFormData] = useState<Partial<Flight>>({
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    aircraftReg: '',
    aircraftType: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    duration: 0,
    landingsDay: 1,
    landingsNight: 0,
    picName: 'SELF',
    remarks: '',
    isSimulator: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'departure' || name === 'arrival') {
        next.duration = calculateDuration(next.departure || '', next.arrival || '');
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Flight);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#09090b] border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)]"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <PlusCircle className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Log New Flight</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* Main Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup 
              label="Date" 
              name="date" 
              type="date" 
              value={formData.date} 
              onChange={handleChange} 
              icon={Calendar} 
            />
            <InputGroup 
              label="Aircraft Reg" 
              name="aircraftReg" 
              placeholder="N742XP" 
              value={formData.aircraftReg} 
              onChange={handleChange} 
              icon={Plane} 
            />
            <InputGroup 
              label="Aircraft Type" 
              name="aircraftType" 
              placeholder="C172" 
              value={formData.aircraftType} 
              onChange={handleChange} 
              icon={Plane} 
            />
            <InputGroup 
              label="PIC Name" 
              name="picName" 
              value={formData.picName} 
              onChange={handleChange} 
              icon={User} 
            />
          </section>

          {/* Route & Times */}
          <section className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-inner space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <InputGroup label="From" name="from" placeholder="KSEA" value={formData.from} onChange={handleChange} icon={MapPin} />
              <InputGroup label="To" name="to" placeholder="KPDX" value={formData.to} onChange={handleChange} icon={MapPin} />
            </div>
            <div className="grid grid-cols-3 gap-6 items-end">
              <InputGroup label="Departure (UTC)" name="departure" type="time" value={formData.departure} onChange={handleChange} icon={Clock} />
              <InputGroup label="Arrival (UTC)" name="arrival" type="time" value={formData.arrival} onChange={handleChange} icon={Clock} />
              <div className="bg-zinc-900/50 border border-zinc-800 h-[46px] rounded-xl flex items-center px-4 justify-between">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Total</span>
                <span className="text-white font-mono font-bold text-sm">
                  {Math.floor((formData.duration || 0) / 60)}h {((formData.duration || 0) % 60).toString().padStart(2, '0')}m
                </span>
              </div>
            </div>
          </section>

          <InputGroup label="Remarks" name="remarks" type="textarea" placeholder="Mission details, flight rules, meteorological conditions..." value={formData.remarks} onChange={handleChange} icon={MessageSquare} />

          <div className="flex justify-end gap-6 pt-6 border-t border-zinc-800/50">
            <button 
              type="button" 
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function InputGroup({ label, name, type = 'text', value, onChange, icon: Icon, placeholder }: any) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-orange-500 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#151619] border border-[#2a2b2e] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all min-h-[100px] resize-none"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#151619] border border-[#2a2b2e] rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
        )}
      </div>
    </div>
  );
}

import { ArrowUpRight } from 'lucide-react';
