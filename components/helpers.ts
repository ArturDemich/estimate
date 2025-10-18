import { format } from "date-fns/format";

export function getUkrainianPart(name: string): string {
    const parts = name.split(",");
    return parts.length > 1 ? parts[1].trim() : name;
};

export const formatDate = (timestamp: string): string => { 
    return format(timestamp, 'dd.MM.y - HH:mm');
}