export function getUkrainianPart(name: string): string {
    const parts = name.split(",");
    return parts.length > 1 ? parts[1].trim() : name;
};