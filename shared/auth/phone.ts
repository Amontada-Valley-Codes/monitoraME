export function normalizeBrazilianPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  return digits;
}

export function isValidBrazilianPhone(value: string): boolean {
  return /^\d{10,11}$/.test(normalizeBrazilianPhone(value));
}

export function maskBrazilianPhone(value: string): string {
  const digits = normalizeBrazilianPhone(value).slice(0, 11);
  if (!digits) return '';
  const ddd = digits.slice(0, 2);
  const first = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const last = digits.length > 10 ? digits.slice(7) : digits.slice(6);
  return `(${ddd}${digits.length >= 2 ? ') ' : ''}${first}${last ? `-${last}` : ''}`;
}

