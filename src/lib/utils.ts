import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(1, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateDuration(dept: string, arr: string): number {
  if (!dept || !arr) return 0;
  const [h1, m1] = dept.split(':').map(Number);
  const [h2, m2] = arr.split(':').map(Number);
  
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60; // Overnight flight
  return diff;
}
