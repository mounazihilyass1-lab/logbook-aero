import { Flight, PilotStats } from '../types';

const STORAGE_KEY = 'aerolog_flights';

export const flightService = {
  getFlights: (): Flight[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveFlight: (flight: Flight): Flight => {
    const flights = flightService.getFlights();
    const updated = [flight, ...flights];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return flight;
  },

  deleteFlight: (id: string): void => {
    const flights = flightService.getFlights();
    const filtered = flights.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getStats: (): PilotStats => {
    const flights = flightService.getFlights();
    return flights.reduce((acc, f) => ({
      totalHours: acc.totalHours + (f.duration / 60),
      totalFlights: acc.totalFlights + 1,
      nightHours: acc.nightHours + (f.landingsNight > 0 ? f.duration / 60 : 0), // Simple heuristic for now
      instrumentHours: acc.instrumentHours + 0, // Mock for now
      landings: acc.landings + f.landingsDay + f.landingsNight,
    }), {
      totalHours: 0,
      totalFlights: 0,
      nightHours: 0,
      instrumentHours: 0,
      landings: 0
    });
  }
};
