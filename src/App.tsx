/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LogList } from './components/LogList';
import { LogEntryForm } from './components/LogEntryForm';
import { RouteMap } from './components/RouteMap';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AdminPanel } from './components/AdminPanel';
import { PapersView } from './components/PapersView';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from './lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword as createSecondaryUser, updateProfile as updateSecondaryProfile } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { flightService } from './services/flightService';
import { Flight, PilotStats, PilotPaper, PilotProfile } from './types';
import { Plus, Lock, LogIn, Plane as PlaneIcon, LogOut, LayoutDashboard, Notebook, History, Settings, User, FileText, Shield, ArrowUpRight } from 'lucide-react';

import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function MobileNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'logs', label: 'Logs', icon: Notebook },
    { id: 'papers', label: 'Papers', icon: FileText },
    { id: 'history', label: 'Chart', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl h-16 rounded-2xl flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === item.id ? "text-blue-500 scale-110" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [papers, setPapers] = useState<PilotPaper[]>([]);
  const [profile, setProfile] = useState<PilotProfile | null>(null);
  const [stats, setStats] = useState<PilotStats>({
    totalHours: 0,
    totalFlights: 0,
    nightHours: 0,
    instrumentHours: 0,
    landings: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | undefined>(undefined);
  const [allProfiles, setAllProfiles] = useState<PilotProfile[]>([]);

  // Admin Viewing
  const [viewingPilotId, setViewingPilotId] = useState<string | null>(null);
  const [viewingPilotName, setViewingPilotName] = useState<string>('');
  const [viewingPilotFlights, setViewingPilotFlights] = useState<Flight[]>([]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [pilotName, setPilotName] = useState('');
  const [authError, setAuthError] = useState('');

  // Theme support
  const [theme, setTheme] = useState('default');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Suffix to make simple logins work with Firebase Email Auth
  const LOGIN_SUFFIX = '@logbookpro.local';
  const getInternalEmail = (id: string) => id.includes('@') ? id : `${id.toLowerCase().trim()}${LOGIN_SUFFIX}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const loadedFlights = await flightService.getFlights(currentUser.uid);
        const loadedPapers = await flightService.getPapers(currentUser.uid);
        const loadedProfile = await flightService.getProfile(currentUser.uid);
        
        let currentProfile = loadedProfile;
        if (loadedProfile) {
          setProfile(loadedProfile);
        } else {
          const isDevAdmin = currentUser.email === `admin${LOGIN_SUFFIX}`;
          const initialProfile: PilotProfile = { 
            uid: currentUser.uid, 
            name: currentUser.displayName || (isDevAdmin ? 'System Admin' : 'Ilyasse'), 
            licenseId: isDevAdmin ? 'ATP-ADMIN-01' : '492031-B',
            isAdmin: isDevAdmin
          };
          await flightService.saveProfile(initialProfile);
          setProfile(initialProfile);
          currentProfile = initialProfile;
        }
        
        setFlights(loadedFlights);
        setPapers(loadedPapers);
        setStats(flightService.getStats(loadedFlights));

        if (currentProfile?.isAdmin || currentUser.email === `admin${LOGIN_SUFFIX}`) {
          const profiles = await flightService.getAllProfiles();
          setAllProfiles(profiles);
          setActiveTab('admin');
        } else {
          setActiveTab('dashboard');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const internalEmail = getInternalEmail(login);
    try {
      if (isRegistering) {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, internalEmail, password);
        await updateProfile(newUser, { displayName: pilotName || login });
      } else {
        try {
          await signInWithEmailAndPassword(auth, internalEmail, password);
        } catch (error: any) {
          if (login.toLowerCase() === 'admin' && password === 'admin123') {
            try {
              try {
                await signInWithEmailAndPassword(auth, internalEmail, 'admin');
              } catch (innerError: any) {
                if (innerError.code?.includes('not-found') || innerError.code?.includes('invalid-credential')) {
                  const { user: newAdmin } = await createUserWithEmailAndPassword(auth, internalEmail, password);
                  await updateProfile(newAdmin, { displayName: 'System Admin' });
                } else {
                  throw innerError;
                }
              }
            } catch (fallbackError) {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDeleteUser = async (uid: string) => {
    await flightService.deleteUserAccount(uid);
    const updated = await flightService.getAllProfiles();
    setAllProfiles(updated);
  };

  const handleViewPilotLogbook = async (uid: string, name: string) => {
    setViewingPilotId(uid);
    setViewingPilotName(name);
    const pilotFlights = await flightService.getFlights(uid);
    setViewingPilotFlights(pilotFlights);
    setActiveTab('admin_view_pilot');
  };

  const handleSaveProfile = async (updatedProfile: PilotProfile) => {
    if (!user) return;
    await flightService.saveProfile(updatedProfile);
    setProfile(updatedProfile);
    if (user.displayName !== updatedProfile.name) {
      await updateProfile(user, { displayName: updatedProfile.name });
    }
  };

  const handleEditFlight = (flight: Flight) => {
    setEditingFlight(flight);
    setIsFormOpen(true);
  };

  const handleSaveFlight = async (flight: Flight) => {
    if (!user) return;
    await flightService.saveFlight(user.uid, flight);
    const loaded = await flightService.getFlights(user.uid);
    setFlights(loaded);
    setStats(flightService.getStats(loaded));
    setIsFormOpen(false);
    setEditingFlight(undefined);
  };

  const handleDeleteFlight = async (id: string) => {
    if (!user) return;
    await flightService.deleteFlight(id);
    const updated = flights.filter(f => f.id !== id);
    setFlights(updated);
    setStats(flightService.getStats(updated));
  };

  const handleSavePaper = async (paper: PilotPaper) => {
    if (!user) return;
    await flightService.savePaper(user.uid, paper);
    const updated = await flightService.getPapers(user.uid);
    setPapers(updated);
  };

  const handleDeletePaper = async (id: string) => {
    if (!user) return;
    await flightService.deletePaper(id);
    const updated = papers.filter(p => p.id !== id);
    setPapers(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Initializing Secure Link...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 antialiased font-sans">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xl shadow-blue-900/20">
              <PlaneIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white uppercase italic">Logbook Pro</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
            
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight text-center">Pilot Credentials</h2>
            <p className="text-zinc-500 text-xs mb-8 text-center uppercase tracking-widest">{isRegistering ? 'Commission new flight terminal' : 'Secure deck access only'}</p>
            
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Pilot Name</label>
                  <input
                    type="text"
                    required
                    value={pilotName}
                    onChange={(e) => setPilotName(e.target.value)}
                    placeholder="Capt. Ilyasse"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-sans"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Pilot ID (Login)</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="E.g., ilyasse2026"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 leading-relaxed text-center">
                  ERR: {authError.includes('auth/') ? authError.split('/')[1].replace(/-/g, ' ') : authError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-2 group"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{isRegistering ? 'Inaugurate Account' : 'Authenticate Entry'}</span>
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </form>

            <div className="mt-8 text-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-3">Terminal Access</p>
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError('');
                }}
                className="text-xs font-bold text-blue-500 hover:text-blue-400 underline underline-offset-8 decoration-blue-500/30 transition-all"
              >
                {isRegistering ? 'Already registered? Pilot Login' : 'New User? Register for Pilot ID'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background min-h-screen text-zinc-300 antialiased font-sans">
      {/* Top Navigation */}
      <nav className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 md:px-6 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white shadow-lg shadow-blue-900/20 text-xs md:text-base">A</div>
          <div>
            <span className="text-base md:text-lg font-bold tracking-tight text-white">Logbook Pro</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-[10px] uppercase font-bold tracking-widest rounded-md px-2 py-1 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="default">Default</option>
              <option value="funny">Funny</option>
              <option value="cozy">Cozy</option>
              <option value="military">Military</option>
              <option value="moroccan">Moroccan</option>
              <option value="attractive">Attractive</option>
            </select>
          </div>
          <div className="hidden xs:flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 md:px-3 py-1 text-[9px] md:text-[11px] font-mono font-medium text-blue-400">
            <span className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
            <span className="hidden md:inline">CLOUDSYNC ACTIVE</span>
            <span className="md:hidden">SYNCED</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-xs font-mono text-zinc-400">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="opacity-40">pilot:</span>
              <span className="text-zinc-200 truncate max-w-[80px]">{user.displayName || user.email?.split('@')[0]}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors bg-zinc-800/50 px-2 py-1 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          stats={stats} 
          papers={papers}
          onSavePaper={handleSavePaper}
          onDeletePaper={handleDeletePaper}
          profile={profile}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <Dashboard stats={stats} papers={papers} flights={flights} />
              <RouteMap flights={flights} />
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
              <LogList 
                flights={flights} 
                onDelete={handleDeleteFlight} 
                onEdit={handleEditFlight} 
                pilotName={profile?.name || user?.displayName || 'Unknown Pilot'}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HistoryView flights={flights} />
            </motion.div>
          )}

          {activeTab === 'papers' && (
            <motion.div
              key="papers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PapersView 
                papers={papers} 
                onSavePaper={handleSavePaper} 
                onDeletePaper={handleDeletePaper} 
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SettingsView 
                flights={flights} 
                profile={profile}
                onSaveProfile={handleSaveProfile}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && profile?.isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminPanel 
                 profiles={allProfiles} 
                 onDeleteUser={handleDeleteUser} 
                 onViewPilotLogbook={handleViewPilotLogbook}
              />
            </motion.div>
          )}

          {activeTab === 'admin_view_pilot' && profile?.isAdmin && (
            <motion.div
              key="admin_view_pilot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  ← Back to Terminal
                </button>
                <h2 className="text-2xl font-bold text-white tracking-tight">Viewing Logbook: {viewingPilotName}</h2>
              </div>
              <LogList 
                flights={viewingPilotFlights} 
                pilotName={viewingPilotName}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence>
        {isFormOpen && (
          <LogEntryForm 
            onSave={handleSaveFlight} 
            onClose={() => {
              setIsFormOpen(false);
              setEditingFlight(undefined);
            }} 
            initialFlight={editingFlight}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

