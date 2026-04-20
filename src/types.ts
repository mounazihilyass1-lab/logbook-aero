export type FlightType = 'SE' | 'ME' | 'Night' | 'Instrument' | 'CrossCountry';

export interface Flight {
  id: string;
  date: string;
  aircraftReg: string;
  aircraftType: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: number; // in minutes
  distance: number; // in nautical miles
  landingsDay: number;
  landingsNight: number;
  picName: string;
  remarks: string;
  isSimulator: boolean;
}

export interface PilotStats {
  totalHours: number;
  totalFlights: number;
  nightHours: number;
  instrumentHours: number;
  landings: number;
  totalDistance: number;
  simulatorSessions: number;
}

export interface PilotPaper {
  id: string;
  name: string;
  expiryDate: string;
}

export interface PilotProfile {
  uid: string;
  name: string;
  licenseId: string;
  isAdmin?: boolean;
}
