
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, status?: string): string {
  const suffix = status === 'rent' ? '/month' : '';

  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Crore${suffix}`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh${suffix}`;
  }

  return `₹${price.toLocaleString('en-IN')}${suffix}`;
}

export function formatArea(area?: number): string {
  if (!area) return 'N/A';
  return `${area.toLocaleString('en-IN')} sq ft`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );

  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
];

export const AMENITIES_LIST = [
  'Swimming Pool',
  'Gym',
  'Parking',
  'Garden',
  'Balcony',
  'Security',
  'Elevator',
  'Air Conditioning',
  'Heating',
  'Internet',
  'Laundry',
  'Pet Friendly',
  'Furnished',
  'Unfurnished',
  'Solar Panels',
  'Generator',
];

export const INDIAN_CITIES = [
  'Bengaluru',
  'Mumbai',
  'New Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Jaipur',
  'Ahmedabad',
  'Surat',
  'Lucknow',
  'Chandigarh',
  'Srinagar',
  'Jammu',
  'Indore',
  'Bhopal',
  'Kochi',
  'Mysuru',
  'Noida',
  'Gurugram',
];

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  read: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  replied: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};
