import React from 'react';
import { ArrowUpRight, Clock, MapPin, Calculator } from 'lucide-react';
import { PilotStats } from '../types';
import { formatMinutesToHHmm, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: PilotStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const cards = [
    { label: 'Total Flight Hours', value: stats.totalHours.toFixed(1), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Flights Logged', value: stats.totalFlights, icon: ArrowUpRight, color: 'text-zinc-300', bg: 'bg-zinc-800/10' },
    { label: 'Successful Landings', value: stats.landings, icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Simulator Sessions', value: '0.0', icon: Calculator, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Flight Operations</h1>
          <p className="text-sm text-zinc-500">Global flight telemetry synchronized from edge nodes.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Telemetry Live
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl group hover:border-zinc-700 transition-all cursor-default relative overflow-hidden"
          >
             <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity", card.color.replace('text-', 'bg-'))}>
               <card.icon className="w-full h-full p-4" />
             </div>
             
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner", card.bg)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{card.label}</label>
            </div>
            
            <div className="flex items-baseline gap-1">
              <h3 className="text-4xl font-light text-white tracking-tighter font-mono leading-none">{card.value}</h3>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{card.label.includes('Hours') ? 'HRS' : 'UNIT'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight uppercase text-[12px] opacity-80">Mission History</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
            </div>
          </div>
          
          <div className="space-y-4">
            {stats.totalFlights === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-950 flex items-center justify-center mb-4 border border-zinc-900 shadow-inner">
                  <Clock className="w-6 h-6 text-zinc-700" />
                </div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No active mission data found</p>
              </div>
            ) : (
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-12 w-full bg-zinc-800/20 rounded-xl border border-white/5 flex items-center px-4 justify-between group hover:bg-zinc-800/40 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse opacity-40"></div>
                     </div>
                     <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse opacity-40"></div>
                   </div>
                 ))}
                 <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-4">Telemetry Stream Partial</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-8 tracking-tight uppercase text-[12px] opacity-80">Currency Diagnostics</h3>
          <div className="space-y-10 flex-1 flex flex-col justify-center">
            <CurrencyItem label="90-Day Night Landing" current={0} goal={3} unit="night" />
            <CurrencyItem label="Instrument Proficiency" current={0} goal={6} unit="instr" />
            <CurrencyItem label="VFR Landing Recency" current={stats.landings} goal={3} unit="day" />
          </div>
          <div className="mt-10 pt-6 border-t border-zinc-800/50">
             <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
               <ArrowUpRight className="w-3 h-3" />
               Performance Optimal
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrencyItem({ label, current, goal, unit }: { label: string; current: number; goal: number; unit: string }) {
  const percent = Math.min((current / goal) * 100, 100);
  const color = percent >= 100 ? 'bg-emerald-500' : percent > 50 ? 'bg-blue-600' : 'bg-zinc-800';

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">{label}</span>
        <span className="text-sm font-mono font-bold text-white">{current}<span className="text-zinc-600 ml-1">/ {goal}</span></span>
      </div>
      <div className="h-1 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.02]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={cn("h-full transition-all duration-1000", color)}
        />
      </div>
    </div>
  );
}


