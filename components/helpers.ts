import { format } from "date-fns/format";

export function getUkrainianPart(name: string): string {
    const parts = name.split(",").map(p => p.trim());
  
    const hasCyrillic = (s: string) => /[а-яА-ЯіІїЇєЄґҐ]/.test(s);
    const isOnlyNumber = (s: string) => /^\d+$/.test(s);
    let index = parts.findIndex(p => hasCyrillic(p));
  
    if (index === -1) {
      index = parts.findIndex(p => !isOnlyNumber(p));
    }
  
    if (index === -1) return name;
  
    const base = parts[index];
    const next = parts[index + 1];
  
    if (next && isOnlyNumber(next)) {
      return `${base},${next}`;
    }
  
    return base;
  }
  

export const formatDate = (timestamp: string): string => { 
    return format(timestamp, 'dd.MM.y - HH:mm');
}