import React from 'react';
import { Flight } from '../types';
import { formatMinutesToHHmm, cn } from '../lib/utils';
import { Trash2, Plane, Calendar, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogListProps {
  flights: Flight[];
  onDelete: (id: string) => void;
}

export function LogList({ flights, onDelete }: LogListProps) {
  if (flights.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2b2e] rounded-3xl text-zinc-500">
        <Plane className="w-8 h-8 mb-4 opacity-20" />
        <p className="font-medium text-zinc-400">Your logbook is empty</p>
        <p className="text-sm mt-1">Start by adding your first flight record.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Aircraft ID</th>
              <th className="px-6 py-4">Route (Dep/Arr)</th>
              <th className="px-6 py-4 text-center">Condition</th>
              <th className="px-6 py-4">PIC Name</th>
              <th className="px-6 py-4 text-right">Duration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 font-medium font-sans">
            <AnimatePresence>
              {flights.map((flight) => (
                <motion.tr 
                  key={flight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="transition-colors hover:bg-white/[0.02] group"
                >
                  <td className="px-6 py-4 text-zinc-400 font-mono text-xs italic">
                    {new Date(flight.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-blue-400">
                    {flight.aircraftReg} <span className="text-[10px] text-zinc-600 font-bold ml-1">({flight.aircraftType})</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200">{flight.from}</span>
                      <span className="text-zinc-700 text-xs">→</span>
                      <span className="text-zinc-200">{flight.to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      flight.isSimulator ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {flight.isSimulator ? 'SIM' : 'VFR'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {flight.picName}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white text-base font-light tracking-tighter">
                    {formatMinutesToHHmm(flight.duration)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(flight.id)}
                      className="p-1.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
