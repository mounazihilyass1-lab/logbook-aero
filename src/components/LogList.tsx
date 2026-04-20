import React, { useState, useMemo } from 'react';
import { Flight } from '../types';
import { formatMinutesToHHmm, cn } from '../lib/utils';
import { Trash2, Edit2, Plane, Calendar, MapPin, Clock, FileDown, Printer, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToPDF, printLogbook } from '../lib/exportUtils';

interface LogListProps {
  flights: Flight[];
  onDelete?: (id: string) => void;
  onEdit?: (flight: Flight) => void;
  pilotName: string;
}

export function LogList({ flights, onDelete, onEdit, pilotName }: LogListProps) {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAirport, setFilterAirport] = useState('');
  
  const filteredFlights = useMemo(() => {
    const result = flights.filter(f => {
      const startOk = filterStartDate ? new Date(f.date) >= new Date(filterStartDate) : true;
      const endOk = filterEndDate ? new Date(f.date) <= new Date(filterEndDate) : true;
      const airportOk = filterAirport ? (f.from.toLowerCase().includes(filterAirport.toLowerCase()) || f.to.toLowerCase().includes(filterAirport.toLowerCase())) : true;
      return startOk && endOk && airportOk;
    });

    // Sort flights from newest to oldest
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [flights, filterStartDate, filterEndDate, filterAirport]);

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Archive Records</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => exportToPDF(filteredFlights, pilotName)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-blue-600 hover:text-white text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-zinc-700/50"
          >
            <FileDown className="w-3.5 h-3.5" />
            PDF Export
          </button>
          <button 
            onClick={printLogbook}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-zinc-700/50"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Log
          </button>
        </div>
      </div>
      
      {/* Filtering */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-zinc-500">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Filter</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="date" 
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            title="Start Date"
          />
          <span className="text-zinc-600">—</span>
          <input 
            type="date" 
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            title="End Date"
          />
        </div>
        <div className="w-full sm:w-auto">
          <input 
             type="text" 
             placeholder="Airport Code (e.g. GMMN)" 
             value={filterAirport}
             onChange={(e) => setFilterAirport(e.target.value)}
             className="w-full sm:w-auto bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 uppercase"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Aircraft ID</th>
                <th className="px-6 py-4">Route (Dep/Arr)</th>
                <th className="px-6 py-4 text-center">Condition</th>
                <th className="px-6 py-4 text-center">Distance</th>
                <th className="px-6 py-4 text-right">Duration</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-medium font-sans">
              <AnimatePresence>
                {filteredFlights.map((flight) => (
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
                        {flight.isSimulator ? 'SIM' : 'FLIGHT'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">
                      {flight.distance || 0} NM
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white text-base font-light tracking-tighter">
                      {formatMinutesToHHmm(flight.duration)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {onEdit && onDelete && (
                        <div className="flex justify-end gap-2 p-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => onEdit(flight)}
                            className="p-1.5 text-zinc-700 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDelete(flight.id)}
                            className="p-1.5 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredFlights.length === 0 && flights.length > 0 && (
             <div className="py-12 text-center text-zinc-500 text-sm">No flights found matching criteria.</div>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {filteredFlights.map((flight) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{new Date(flight.date).toLocaleDateString()}</p>
                  <h3 className="text-blue-400 font-mono font-bold">{flight.aircraftReg} <span className="text-zinc-600">({flight.aircraftType})</span></h3>
                </div>
                {onEdit && onDelete && (
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(flight)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 active:bg-blue-500/20 active:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(flight.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 active:bg-rose-500/20 active:text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-zinc-800/50">
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">Route</p>
                  <div className="flex items-center gap-3 text-white font-bold">
                    <span>{flight.from}</span>
                    <span className="text-zinc-700">→</span>
                    <span>{flight.to}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">Duration</p>
                  <p className="text-xl font-mono text-white tracking-tighter">{formatMinutesToHHmm(flight.duration)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest",
                    flight.isSimulator ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {flight.isSimulator ? 'Sim Session' : 'Flight'}
                  </span>
                  {flight.distance ? (
                    <span className="text-[10px] text-zinc-400 font-mono">{flight.distance} NM</span>
                  ) : null}
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">PIC: {flight.picName}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
