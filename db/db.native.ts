import { PlantItemRespons } from "@/redux/stateServiceTypes";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDB(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (!dbInstance) {
      console.log("Database WAS NOT opened successfully", dbInstance);
      dbInstance = await SQLite.openDatabaseAsync("app.db");
    }
    console.log("Database opened successfully");
    return dbInstance;
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
        name TEXT NOT NULL DEFAULT '',
        comment TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS plants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
        currentQty INTEGER NOT NULL DEFAULT 0, 
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
      );
    `);
    await db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_plants_timestamp
      AFTER UPDATE ON plant_characteristics
      FOR EACH ROW
      BEGIN
        UPDATE plants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.plant_id;
      END;
    `);

    await db.execAsync(`
      CREATE TRIGGER IF NOT EXISTS update_documents_timestamp
      AFTER UPDATE ON plants
      FOR EACH ROW
      BEGIN
        UPDATE documents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.document_id;
      END;
    `);
    await db.execAsync("COMMIT;");
    console.log("Database initialized successfully");
  } catch (error: any) {
    await db.execAsync("ROLLBACK;");
    console.log("Error initializing database:", error);
    Alert.alert("Error initializing database: ", error)
  }
}


export async function addDocument(name: string): Promise<number | null> {
  const db = await openDB();
  const createdAt = new Date().toISOString();
  try {
    const result = await db.runAsync(
      "INSERT INTO documents (name, comment, created_at) VALUES (?, ?, ?)",
      [name, '', createdAt]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
}


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

export async function addCharacteristic(
  plantId: number,
  plantItem: PlantItemRespons
): Promise<number | null> {
  const db = await openDB();
  try {
    console.log('addCharacteristic___', plantId, plantItem.barcode)
    const result = await db.runAsync(
      `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plantId,
        plantItem.characteristic.id ? plantItem.characteristic.id : 'null',
        plantItem.characteristic.name ? plantItem.characteristic.name : 'null',
        plantItem.unit.id ? plantItem.unit.id : 'null',
        plantItem.unit.name ? plantItem.unit.name : 'null',
        plantItem.barcode ? plantItem.barcode : 0,
        plantItem.quantity ? plantItem.quantity : 0,
      ]
    );

    return result.lastInsertRowId;
  } catch (error) {
    Alert.alert("Error adding plant characteristic to doc: ", plantItem.product.name)
    console.log("Error adding plant characteristic:", error);
    return null;
  }
}


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

export async function fetchPlants(documentId: number): Promise<any[]> {
  const db = await openDB();
  console.log('fetchPlants__', documentId)
  try {
    const rows = await db.getAllAsync(
      "SELECT * FROM plants WHERE document_id = ? ORDER BY created_at DESC",
      documentId
    );
    return rows;
  } catch (error) {
    console.error("Error fetching plants:", error);
    return [];
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
       WHERE pc.plant_id = ? AND p.document_id = ? ORDER BY created_at DESC`,
      [plantId, docId]
    );
  } catch (error) {
    console.error("Error fetching plant characteristics:", error);
    return [];
  }
}


export async function deleteDocument(documentId: number): Promise<boolean> {
  console.log("1Database WAS NOT opened successfully", dbInstance);
  const db = await openDB();
  console.log('deleteDocument', documentId, db)
  try {
    const result = await db.runAsync("DELETE FROM documents WHERE id = ?", documentId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
}

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


export async function updateCharacteristic(DbCharacteristicId: number, currentQty: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plant_characteristics SET currentQty = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [currentQty, DbCharacteristicId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating currentQty:", error);
    return false;
  }
}

export async function updateDocComment(DbDocumentId: number, newComment: string): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE documents SET comment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newComment, DbDocumentId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating currentQty:", error);
    return false;
  }
}











