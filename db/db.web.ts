// src/db/db.web.ts
console.warn("expo-sqlite is not supported on the web; using dummy DB functions.");

export async function openDB(): Promise<null> {
  return null;
}

export async function initializeDB(): Promise<void> {
  console.warn("initializeDB: No operation on web.");
}

export async function addDocument(name: string): Promise<number | null> {
  console.warn("addDocument: No operation on web.");
  return null;
}

export async function fetchDocuments(): Promise<any[]> {
  console.warn("fetchDocuments: No operation on web.");
  return [];
}

export async function addPlant(
  documentId: number,
  name: string,
  size: string
): Promise<number | null> {
  console.warn("addPlant: No operation on web.");
  return null;
}

export async function fetchPlants(documentId: number): Promise<any[]> {
  console.warn("fetchPlants: No operation on web.");
  return [];
}
