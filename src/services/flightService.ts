import { Flight, PilotStats, PilotPaper, PilotProfile } from '../types';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const FLIGHTS_COLLECTION = 'flights';
const PAPERS_COLLECTION = 'papers';
const PROFILES_COLLECTION = 'profiles';

export const flightService = {
  getAllProfiles: async (): Promise<PilotProfile[]> => {
    try {
      const snapshot = await getDocs(collection(db, PROFILES_COLLECTION));
      return snapshot.docs.map(doc => doc.data() as PilotProfile);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  },

  deleteUserAccount: async (uid: string): Promise<void> => {
    try {
      // 1. Delete Profile
      await deleteDoc(doc(db, PROFILES_COLLECTION, uid));
      
      // 2. Delete Flights (Simple query)
      const flightSnap = await getDocs(query(collection(db, FLIGHTS_COLLECTION), where('userId', '==', uid)));
      for (const f of flightSnap.docs) {
        await deleteDoc(f.ref);
      }
      
      // 3. Delete Papers
      const paperSnap = await getDocs(query(collection(db, PAPERS_COLLECTION), where('userId', '==', uid)));
      for (const p of paperSnap.docs) {
        await deleteDoc(p.ref);
      }
    } catch (error) {
      console.error("Error deleting user account:", error);
    }
  },

  getProfile: async (userId: string): Promise<PilotProfile | null> => {
    if (!userId) return null;
    try {
      const docRef = doc(db, PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as PilotProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  },

  saveProfile: async (profile: PilotProfile): Promise<void> => {
    if (!profile.uid) return;
    try {
      const docRef = doc(db, PROFILES_COLLECTION, profile.uid);
      await setDoc(docRef, { ...profile, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  },

  getFlights: async (userId: string): Promise<Flight[]> => {
    if (!userId) return [];
    try {
      const q = query(collection(db, FLIGHTS_COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Flight);
    } catch (error) {
      console.error("Error fetching flights from Firestore:", error);
      return [];
    }
  },

  getPapers: async (userId: string): Promise<PilotPaper[]> => {
    if (!userId) return [];
    try {
      const q = query(collection(db, PAPERS_COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PilotPaper);
    } catch (error) {
      console.error("Error fetching papers from Firestore:", error);
      return [];
    }
  },

  savePaper: async (userId: string, paper: PilotPaper): Promise<void> => {
    if (!userId) return;
    try {
      const docRef = doc(db, PAPERS_COLLECTION, paper.id);
      await setDoc(docRef, { ...paper, userId });
    } catch (error) {
      console.error("Error saving paper to Firestore:", error);
    }
  },

  deletePaper: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, PAPERS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting paper from Firestore:", error);
    }
  },

  saveFlight: async (userId: string, flight: Flight): Promise<void> => {
    if (!userId) return;
    try {
      const docRef = doc(db, FLIGHTS_COLLECTION, flight.id);
      await setDoc(docRef, { 
        ...flight, 
        userId,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error saving flight to Firestore:", error);
    }
  },

  deleteFlight: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, FLIGHTS_COLLECTION, id));
    } catch (error) {
      console.error("Error deleting flight from Firestore:", error);
    }
  },

  getStats: (flights: Flight[]): PilotStats => {
    return flights.reduce((acc, f) => ({
      totalHours: acc.totalHours + (f.duration / 60),
      totalFlights: acc.totalFlights + 1,
      nightHours: acc.nightHours + (f.landingsNight > 0 ? f.duration / 60 : 0),
      instrumentHours: acc.instrumentHours + 0,
      landings: acc.landings + ((Number(f.landingsDay) || 0) + (Number(f.landingsNight) || 0)),
      totalDistance: acc.totalDistance + (Number(f.distance) || 0),
      simulatorSessions: acc.simulatorSessions + (f.isSimulator ? 1 : 0),
    }), {
      totalHours: 0,
      totalFlights: 0,
      nightHours: 0,
      instrumentHours: 0,
      landings: 0,
      totalDistance: 0,
      simulatorSessions: 0
    });
  }
};
