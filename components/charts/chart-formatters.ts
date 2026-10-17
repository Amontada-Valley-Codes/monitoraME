export const shortDateFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  day: "numeric",
});

export const monthYearDateFmt = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function formatMonthYear(date: Date): string {
  const formatted = monthYearDateFmt.format(date);
  return formatted.charAt(0).toLocaleUpperCase("pt-BR") + formatted.slice(1);
}

export const hmsTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// `Intl.NumberFormat.prototype.format` is a bound getter — safe to extract.
export const intFmt = new Intl.NumberFormat("pt-BR").format;
