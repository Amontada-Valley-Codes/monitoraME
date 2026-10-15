import { SavedSearchFilters } from "../domain/types";

export function parseFiltersFromName(name: string): SavedSearchFilters {
  const lower = name.toLowerCase();
  let query: string | undefined = undefined;
  let municipalities: string[] = [];
  let cnaes: string[] = [];
  let modalities: string[] = [];
  let minValue: number | undefined = undefined;
  let maxValue: number | undefined = undefined;

  const cnaeMatch = name.match(/(\d{4}[-]?\d[\/]?\d{2})/);
  if (cnaeMatch && cnaeMatch[1]) {
    let raw = cnaeMatch[1].replace(/\D/g, "");
    if (raw.length === 7) {
      cnaes.push(`${raw.slice(0, 4)}-${raw.slice(4, 5)}/${raw.slice(5)}`);
    } else {
      cnaes.push(cnaeMatch[1]);
    }
  } else if (lower.includes("informática") || lower.includes("informatica") || lower.includes("computador")) {
    cnaes.push("6201-5/01");
  } else if (lower.includes("consultoria em ti") || lower.includes("tecnologia da informação")) {
    cnaes.push("6204-0/00");
  }

  const abaixoMatch = name.match(/abaixo\s+de\s+(?:r\$\s*)?([\d.,]+)\s*(k)?/i);
  const acimaMatch = name.match(/acima\s+de\s+(?:r\$\s*)?([\d.,]+)\s*(k)?/i);

  if (abaixoMatch && abaixoMatch[1]) {
    const rawNum = parseFloat(abaixoMatch[1].replace(/\./g, "").replace(",", "."));
    maxValue = abaixoMatch[2] ? rawNum * 1000 : rawNum;
  } else if (acimaMatch && acimaMatch[1]) {
    const rawNum = parseFloat(acimaMatch[1].replace(/\./g, "").replace(",", "."));
    minValue = acimaMatch[2] ? rawNum * 1000 : rawNum;
  }

  if (lower.includes("pregão") || lower.includes("pregao")) {
    modalities.push("Pregão Eletrônico");
  }
  if (lower.includes("dispensa")) {
    modalities.push("Dispensa Eletrônica");
  }

  const munMatch = name.match(/(?:\bem\b|\bno\b|\bna\b)\s+([A-Za-zÀ-Úà-ú\s]+?)(?=\s+(?:acima|abaixo|de|\d)|$)/i);
  if (munMatch && munMatch[1]) {
    const candidate = munMatch[1].trim();
    if (!candidate.toLowerCase().includes("k") && candidate.length > 2) {
      const formattedMun = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
      municipalities.push(formattedMun);
    }
  }

  let cleanQuery = name;
  cleanQuery = cleanQuery.replace(/(?:acima|abaixo)\s+de\s+(?:r\$\s*)?[\d.,]+\s*(?:k)?/gi, "");
  cleanQuery = cleanQuery.replace(/\b(em|no|na)\s+[A-Za-zÀ-Úà-ú\s]+?(?=\s+(?:acima|abaixo)|\s*$)/gi, "");
  cleanQuery = cleanQuery.replace(/pregão\s+eletrônico|dispensa\s+eletrônica|pregões|dispensa/gi, "");
  cleanQuery = cleanQuery.replace(/\d{4}[-]?\d[\/]?\d{2}/gi, "");
  cleanQuery = cleanQuery.trim();

  if (cleanQuery.length > 2) {
    query = cleanQuery;
  } else if (!modalities.length && !minValue && !maxValue && !municipalities.length && !cnaes.length) {
    query = name;
  }

  return { query, municipalities, cnaes, modalities, minValue, maxValue };
}
