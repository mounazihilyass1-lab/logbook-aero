/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LogList } from './components/LogList';
import { LogEntryForm } from './components/LogEntryForm';
import { flightService } from './services/flightService';
import { Flight, PilotStats } from './types';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState<PilotStats>({
    totalHours: 0,
    totalFlights: 0,
    nightHours: 0,
    instrumentHours: 0,
    landings: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    let loadedFlights = flightService.getFlights();
    if (loadedFlights.length === 0) {
      const sample: Flight = {
        id: 'sample-1',
        date: new Date().toISOString().split('T')[0],
        aircraftReg: 'N172SP',
        aircraftType: 'C172',
        from: 'KLAX',
        to: 'KSFO',
        departure: '09:00',
        arrival: '10:30',
        duration: 90,
        landingsDay: 1,
        landingsNight: 0,
        picName: 'SELF',
        remarks: 'Local training flight. Smooth conditions.',
        isSimulator: false,
      };
      flightService.saveFlight(sample);
      loadedFlights = [sample];
    }
    setFlights(loadedFlights);
    setStats(flightService.getStats());
  }, []);

  const handleSaveFlight = (flight: Flight) => {
    const saved = flightService.saveFlight(flight);
    const updatedFlights = [saved, ...flights];
    setFlights(updatedFlights);
    setStats(flightService.getStats());
    setIsFormOpen(false);
  };

  const handleDeleteFlight = (id: string) => {
    flightService.deleteFlight(id);
    const updatedFlights = flights.filter(f => f.id !== id);
    setFlights(updatedFlights);
    setStats(flightService.getStats());
  };

  return (
    <div className="flex flex-col bg-[#09090b] min-h-screen text-zinc-300 antialiased font-sans">
      {/* Top Navigation */}
      <nav className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20">A</div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">AeroLog</span>
            <span className="ml-2 text-xs font-medium text-zinc-500">v2.8-prod</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
            LOCAL STORAGE ACTIVE
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="opacity-40">branch:</span>
              <span className="text-zinc-200">main</span>
            </div>
            <div className="h-3 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-40">deploy:</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-200">production</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
        
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Dashboard stats={stats} />
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Logbook</h2>
                  <p className="text-zinc-500 mt-1">Detailed history of all your flights.</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-white hover:bg-zinc-200 text-zinc-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-white/5 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Log Flight
                </button>
              </div>
              <LogList flights={flights} onDelete={handleDeleteFlight} />
            </motion.div>
          )}

          {(activeTab === 'history' || activeTab === 'settings') && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600">
                <Plus className="w-8 h-8 rotate-45" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Module Coming Soon</h3>
                <p className="text-zinc-500 max-w-xs mx-auto mt-2">
                  We are working hard to bring more analytics and settings to AeroLog.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <LogEntryForm 
            onSave={handleSaveFlight} 
            onClose={() => setIsFormOpen(false)} 
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

