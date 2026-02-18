/**
 * Tailwind CSS utility functions.
 * @module utils
 * @internal
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * @param {...any} inputs
 * @internal
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
