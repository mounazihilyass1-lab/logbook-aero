import React, { useState, useEffect } from 'react';
import { Flight } from '../types';
import { calculateDuration } from '../lib/utils';
import { X, Save, Plane, Calendar, MapPin, Clock, User, MessageSquare, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getAirportByIcao } from 'airport-data-js';

interface LogEntryFormProps {
  onSave: (flight: Flight) => void;
  onClose: () => void;
  initialFlight?: Flight;
}

export function LogEntryForm({ onSave, onClose, initialFlight }: LogEntryFormProps) {
  const [formData, setFormData] = useState<Partial<Flight>>(initialFlight || {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    aircraftReg: '',
    aircraftType: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    duration: 0,
    distance: 0,
    landingsDay: 1,
    landingsNight: 0,
    picName: 'SELF',
    remarks: '',
    isSimulator: false,
  });

  useEffect(() => {
    async function updateDistance() {
      if (formData.from?.length === 4 && formData.to?.length === 4) {
        try {
          const fetchAirport = async (icao: string) => {
            if (icao === 'GMMT') {
              return [{ latitude: 33.5583, longitude: -7.4731, name: "Tit Mellil" }];
            }
            return await getAirportByIcao(icao);
          };

          const [fromAirports, toAirports] = await Promise.all([
            fetchAirport(formData.from),
            fetchAirport(formData.to)
          ]);

          if (fromAirports?.length > 0 && toAirports?.length > 0) {
            const lat1 = Number(fromAirports[0].latitude);
            const lon1 = Number(fromAirports[0].longitude);
            const lat2 = Number(toAirports[0].latitude);
            const lon2 = Number(toAirports[0].longitude);

            if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
              const R = 3440.065; // Radius of Earth in Nautical Miles
              const dLat = (lat2 - lat1) * Math.PI / 180;
              const dLon = (lon2 - lon1) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const calculatedDist = Math.round(R * c);

              setFormData(prev => ({ ...prev, distance: calculatedDist }));
            }
          }
        } catch(e) {
          console.error('Failed to calculate distance automatically', e);
        }
      }
    }
    
    // Only auto-update if they are adding a new flight or actively changing the airports
    updateDistance();
  }, [formData.from, formData.to]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let val: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Automatic Uppercase for Aviation Identifiers
    const uppercaseFields = ['aircraftReg', 'aircraftType', 'from', 'to'];
    if (typeof val === 'string' && uppercaseFields.includes(name)) {
      val = val.toUpperCase();
    }
    // ensure number types
    if (type === 'number') {
      val = Number(val);
    }
    
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
        className="bg-background border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)]"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <PlusCircle className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{initialFlight ? 'Update Flight Record' : 'Log New Flight'}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto max-h-[85vh]">
          {/* Main Info */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
          <section className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-900 shadow-inner space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <InputGroup label="From" name="from" placeholder="GMMN" value={formData.from} onChange={handleChange} icon={MapPin} />
              <InputGroup label="To" name="to" placeholder="GMMX" value={formData.to} onChange={handleChange} icon={MapPin} />
            </div>
            <div className="col-span-2">
              <InputGroup label="Number of Landings" name="landingsDay" type="number" value={formData.landingsDay} onChange={handleChange} icon={Plane} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 items-end">
              <InputGroup label="Departure (UTC)" name="departure" type="time" value={formData.departure} onChange={handleChange} icon={Clock} />
              <InputGroup label="Arrival (UTC)" name="arrival" type="time" value={formData.arrival} onChange={handleChange} icon={Clock} />
              <div className="bg-zinc-900/50 border border-zinc-800 h-[46px] rounded-xl flex items-center px-4 justify-between">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Total Time</span>
                <span className="text-white font-mono font-bold text-sm">
                  {Math.floor((formData.duration || 0) / 60)}h {((formData.duration || 0) % 60).toString().padStart(2, '0')}m
                </span>
              </div>
              <div className="flex items-center h-[46px]">
                <label className="flex items-center gap-2 cursor-pointer group w-full p-2 hover:bg-zinc-900 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    name="isSimulator"
                    checked={formData.isSimulator}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-950"
                  />
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-white uppercase tracking-widest">Simulator Session</span>
                </label>
              </div>
            </div>
          </section>

          <InputGroup label="Remarks" name="remarks" type="textarea" placeholder="Mission details..." value={formData.remarks} onChange={handleChange} icon={MessageSquare} />

          <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 pt-6 border-t border-zinc-800/50">
            <button 
              type="button" 
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-white text-zinc-950 font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 order-1 sm:order-2"
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#070708] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none text-sm placeholder:text-zinc-700"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#070708] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-mono placeholder:text-zinc-700"
          />
        )}
      </div>
    </div>
  );
}

import { ArrowUpRight } from 'lucide-react';
