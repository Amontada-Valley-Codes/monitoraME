import { removeMask } from './removeMask';

export function formatZipCode(value: string): string {
  const digits = removeMask(value);
  return digits
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}
