import { removeMask } from './removeMask';

export function formatPhone(value: string): string {
  const digits = removeMask(value);
  if (digits.length > 10) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  }
  return digits.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
}
