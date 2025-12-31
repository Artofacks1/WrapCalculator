/**
 * Utility function for conditional className merging
 * Filters out falsy values and joins remaining classes with spaces
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

