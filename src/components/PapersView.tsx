import React, { useState } from 'react';
import { FileText, Plus, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PilotPaper } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PapersViewProps {
  papers: PilotPaper[];
  onSavePaper: (paper: PilotPaper) => void;
  onDeletePaper: (id: string) => void;
}

export function PapersView({ papers, onSavePaper, onDeletePaper }: PapersViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPaper, setNewPaper] = useState({ name: '', expiryDate: '' });

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight text-[24px]">Pilot Papers</h2>
          <p className="text-zinc-500 mt-1">Manage your licenses, medicals, and endorsements.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add Paper'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900 border border-blue-500/30 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Document Name</label>
                <input 
                  type="text" 
                  placeholder="E.g., Class 1 Medical" 
                  value={newPaper.name}
                  onChange={e => setNewPaper({...newPaper, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Expiration Date</label>
                <input 
                  type="date" 
                  value={newPaper.expiryDate}
                  onChange={e => setNewPaper({...newPaper, expiryDate: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="bg-white text-zinc-950 px-8 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all mb-[1px]"
              >
                Confirm Decommission
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper, i) => {
          const days = getDaysRemaining(paper.expiryDate);
          const isExpired = days < 0;
          const isUrgent = days < 30;

          return (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "group relative p-6 rounded-2xl border transition-all",
                isExpired ? "border-rose-500/20 bg-rose-500/5" :
                isUrgent ? "border-amber-500/20 bg-amber-500/5" :
                "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              )}
            >
              <button 
                onClick={() => onDeletePaper(paper.id)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "p-3 rounded-xl border",
                  isExpired ? "bg-rose-500/10 border-rose-500/20" :
                  isUrgent ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-blue-500/10 border-blue-500/20"
                )}>
                  <FileText className={cn("w-6 h-6", isExpired ? "text-rose-500" : isUrgent ? "text-amber-500" : "text-blue-500")} />
                </div>
                <div>
                  <h4 className="font-bold text-white">{paper.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Certification Cluster</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Temporal Validity</p>
                    <p className={cn(
                      "text-sm font-mono font-bold",
                      isExpired ? "text-rose-500" : "text-zinc-200"
                    )}>
                      {isExpired ? `EXPIRED ${Math.abs(days)} DAYS AGO` : `${days} DAYS REMAINING`}
                    </p>
                  </div>
                  {isExpired ? (
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  ) : isUrgent ? (
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  )}
                </div>

                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, Math.min(100, (days / 365) * 100))}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isExpired ? "bg-rose-500" : isUrgent ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
                
                <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <span>Issued</span>
                  <span>{paper.expiryDate}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {papers.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl">
             <FileText className="w-12 h-12 text-zinc-800 mb-4" />
             <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] text-xs transition-opacity">Void Terminal: No documentation found</p>
          </div>
        )}
      </div>
    </div>
  );
}
