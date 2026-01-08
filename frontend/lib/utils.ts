import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEther as viemFormatEther, parseEther as viemParseEther } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(value: bigint): string {
  return viemFormatEther(value);
}

// Note: parseEther is already imported from viem in components
// This function is kept for backward compatibility but may not be needed
export function parseEther(value: string): bigint {
  return viemParseEther(value);
}

