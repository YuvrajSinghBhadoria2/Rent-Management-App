import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return '—';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | Timestamp | null | undefined): string {
  if (!date) return '—';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'dd MMM yyyy, hh:mm a');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
