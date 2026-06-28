import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString('ru-RU');
}

export function formatTimestampShort(ms: number): string {
  return new Date(ms).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins}м назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}ч назад`;
  const days = Math.floor(hours / 24);
  return `${days}д назад`;
}

export function truncateMiddle(str: string, maxLen: number = 16): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor(maxLen / 2) - 1;
  return str.slice(0, half) + '...' + str.slice(-half);
}
