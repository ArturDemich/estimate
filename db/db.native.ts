import { PlantItemRespons } from "@/redux/stateServiceTypes";
import * as SQLite from "expo-sqlite";

export async function openDB(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db = await SQLite.openDatabaseAsync("app.db");
    console.log("Database opened successfully");
    return db;
  } catch (error) {
    console.error("Error opening database:", error);
    throw error; // Stop execution if DB fails to open
  }
}

/**
 * Initializes the database by setting the journal mode and creating the tables.
 */
export async function initializeDB(): Promise<void> {
  const db = await openDB();
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("BEGIN TRANSACTION;");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS plant_characteristics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id INTEGER NOT NULL,
        characteristic_id TEXT NOT NULL,
        characteristic_name TEXT NOT NULL,
        unit_id TEXT NOT NULL,
        unit_name TEXT NOT NULL,
        barcode TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
      );
    `);
    await db.execAsync("COMMIT;");
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

/**
 * Adds a new document with the current date and time.
 */
export async function addDocument(name: string): Promise<number | null> {
  const db = await openDB();
  const createdAt = new Date().toISOString();
  try {
    const result = await db.runAsync(
      "INSERT INTO documents (name, created_at) VALUES (?, ?)",
      name,
      createdAt
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
}

/**
 * Deletes a document by ID.
 */
export async function deleteDocument(documentId: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync("DELETE FROM documents WHERE id = ?", documentId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
}

/**
 * Fetches all documents from the database.
 */
export async function fetchDocuments(): Promise<any[]> {
  const db = await openDB();
  
  try {
    const rows = await db.getAllAsync("SELECT * FROM documents ORDER BY created_at DESC");
    console.log('fetchDocuments__', rows)
    return rows;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Adds a new plant for a specific document.
 */
export async function addPlant(documentId: number, product: { id: string; name: string }): Promise<number | null> {
  const db = await openDB();
  console.log('addPlant__', documentId, product)
  try {
    const result = await db.runAsync(
      "INSERT INTO plants (document_id, product_id, product_name) VALUES (?, ?, ?)",
      documentId,
      product.id,
      product.name
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
  console.log('fetchPlants__', documentId)
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

/**
 * Updates a plant's details.
 */
export async function updatePlant(
  plantId: number,
  quantity: number
): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plants SET quantity = ? WHERE id = ?",
      quantity,
      plantId
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating plant:", error);
    return false;
  }
}

/**
 * Deletes a plant by ID.
 */
export async function deletePlant(documentId: number, plantNameId: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "DELETE FROM plants WHERE id = ? AND document_id = ?",
      [plantNameId, documentId]
    );
    console.log(`Delete result:`, result);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting plant:", error);
    return false;
  }
}

export async function addCharacteristic(
  plantId: number,
  plantItem: PlantItemRespons
): Promise<number | null> {
  const db = await openDB();
  try {
    // Step 1: Verify that the plant belongs to the given document
    /* const plant = await db.getFirstAsync(
      "SELECT id FROM plants WHERE id = ? AND document_id = ?",
      [plantId, documentId]
    );

    if (!plant) {
      console.error("Error: Plant does not belong to the specified document.");
      return null;
    } */

    // Step 2: Insert the characteristic
    console.log('addCharacteristic___', plantId, plantItem)
    const result = await db.runAsync(
      `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plantId,
        plantItem.characteristic.id,
        plantItem.characteristic.name,
        plantItem.unit.id,
        plantItem.unit.name,
        plantItem.barcode,
        plantItem.quantity ? plantItem.quantity : 0,
      ]
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding plant characteristic:", error);
    return null;
  }
}




export async function fetchCharacteristics(plantId: number, docId: number): Promise<any[]> {
  const db = await openDB();
  console.log('fetchCharacteristics__', plantId, docId)
  try {
    return await db.getAllAsync(
      `SELECT pc.*
       FROM plant_characteristics pc
       JOIN plants p ON pc.plant_id = p.id
       WHERE pc.plant_id = ? AND p.document_id = ?`,
      [plantId, docId]
    );
  } catch (error) {
    console.error("Error fetching plant characteristics:", error);
    return [];
  }
}

export async function updateCharacteristic(plantCharacteristicId: number, quantity: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plant_characteristics SET quantity = ? WHERE id = ?",
      quantity,
      plantCharacteristicId
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating quantity:", error);
    return false;
  }
}

export async function deleteCharacteristic(characteristicId: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync("DELETE FROM plant_characteristics WHERE id = ?", characteristicId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting characteristic:", error);
    return false;
  }
}

const d = [
  {
    "document_id": 1, 
    "id": 10, 
    "product_id": "12476ae5-0f98-11ec-82fc-00c12700489e", 
    "product_name": "Thuja occidentalis 'Golden Smaragd' Form, Туя західна 'Голден Смарагд' Формована"}, 
    {"document_id": 1, "id": 15, "product_id": "12476ae5-0f98-11ec-82fc-00c12700489e", "product_name": "Thuja occidentalis 'Golden Smaragd' Form, Туя західна 'Голден Смарагд' Формована"}]