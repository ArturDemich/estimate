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

export function compareUkrainian(strA: string, strB: string): number {
    const alphabet = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
    const getOrder = (c: string) => {
      const idx = alphabet.indexOf(c.toLowerCase());
      if (idx >= 0) return idx;
      return 1000 + c.charCodeAt(0); // не-українські символи в кінці
    };
    const len = Math.min(strA.length, strB.length);
    for (let i = 0; i < len; i++) {
      const oa = getOrder(strA[i]);
      const ob = getOrder(strB[i]);
      if (oa !== ob) return oa - ob;
    }
    return strA.length - strB.length;
  }