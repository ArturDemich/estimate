// src/db/db.native.ts
import * as SQLite from "expo-sqlite";

// Open or create the database asynchronously
export async function openDB(): Promise<SQLite.SQLiteDatabase> {
  // openDatabaseAsync returns a Promise that resolves to the database instance.
  const db = await SQLite.openDatabaseAsync("app.db");
  return db;
}

/**
 * Initializes the database by setting the journal mode and creating the tables.
 */
export async function initializeDB(): Promise<void> {
  const db = await openDB();
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER,
        name TEXT NOT NULL,
        size TEXT NOT NULL,
        FOREIGN KEY(document_id) REFERENCES documents(id)
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

/**
 * Adds a new document and returns the new document's ID.
 */
export async function addDocument(name: string): Promise<number | null> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "INSERT INTO documents (name) VALUES (?)",
      name
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
}

/**
 * Fetches all documents from the database.
 */
export async function fetchDocuments(): Promise<any[]> {
  const db = await openDB();
  try {
    const rows = await db.getAllAsync("SELECT * FROM documents");
    return rows;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Adds a new plant for a specific document and returns the new plant's ID.
 */
export async function addPlant(
  documentId: number,
  name: string,
  size: string
): Promise<number | null> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "INSERT INTO plants (document_id, name, size) VALUES (?, ?, ?)",
      documentId,
      name,
      size
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding plant:", error);
    return null;
  }
}

/**
 * Fetches all plants for a given document.
 */
export async function fetchPlants(documentId: number): Promise<any[]> {
  const db = await openDB();
  try {
    const rows = await db.getAllAsync(
      "SELECT * FROM plants WHERE document_id = ?",
      documentId
    );
    return rows;
  } catch (error) {
    console.error("Error fetching plants:", error);
    return [];
  }
}
