import React from 'react';
import { Flight } from '../types';
import { motion } from 'motion/react';
import { Calendar, MapPin, Plane, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { formatMinutesToHHmm } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface HistoryViewProps {
  flights: Flight[];
}

export function HistoryView({ flights }: HistoryViewProps) {
  // Aggregate data for charts
  const monthlyData = flights.reduce((acc: any[], flight) => {
    const d = new Date(flight.date);
    const monthYear = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
    const existing = acc.find(item => item.name === monthYear);
    if (existing) {
      existing.hours += flight.duration / 60;
      existing.flights += 1;
      existing.distance += Number(flight.distance) || 0;
    } else {
      acc.push({ name: monthYear, hours: flight.duration / 60, flights: 1, distance: Number(flight.distance) || 0 });
    }
    return acc;
  }, []).reverse();

  const aircraftStats = flights.reduce((acc: any[], flight) => {
    const existing = acc.find(d => d.type === flight.aircraftType);
    if (existing) {
      existing.hours += flight.duration / 60;
    } else {
      acc.push({ type: flight.aircraftType, hours: flight.duration / 60 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Mission History</h2>
        <p className="text-zinc-500 mt-1">Comprehensive analytics and flight trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Hours Chart */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Flight Hours</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}h`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distance Trend */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distance Covered (NM)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="distance" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT HIGHLIGHTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Fleet Utilization</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aircraftStats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.type}</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{stat.hours.toFixed(1)}<span className="text-xs text-zinc-500 ml-1">HRS</span></p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
