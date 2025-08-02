import { PlantItemRespons } from "@/redux/stateServiceTypes";
import * as SQLite from "expo-sqlite";
import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { newSIZE, nullID, UploadStatus } from "@/types/typesScreen";
import { format } from "date-fns/format";

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

    // Define expected schema
    const requiredSchema: Record<string, { [column: string]: string }> = {
      documents: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        number: "TEXT NOT NULL DEFAULT ''",
        storage_id: "TEXT NOT NULL DEFAULT ''",
        storage_name: "TEXT NOT NULL DEFAULT ''",
        comment: "TEXT NOT NULL DEFAULT ''",
        is_sent: "INTEGER DEFAULT 0",
        created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
        updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
      },
      plants: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        document_id: 'INTEGER NOT NULL',
        product_id: 'TEXT NOT NULL',
        product_name: 'TEXT NOT NULL',
        created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
        updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
      },
      plant_characteristics: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        plant_id: 'INTEGER NOT NULL',
        characteristic_id: 'TEXT NOT NULL',
        characteristic_name: 'TEXT NOT NULL',
        unit_id: 'TEXT NOT NULL',
        unit_name: 'TEXT NOT NULL',
        barcode: 'TEXT NOT NULL',
        quantity: 'INTEGER NOT NULL DEFAULT 0',
        currentQty: 'INTEGER NOT NULL DEFAULT 0',
        freeQty: 'INTEGER NOT NULL DEFAULT 0',
        plantComment: "TEXT NOT NULL DEFAULT ''",
        created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
        updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
      }
    };

    // Loop over each table in the schema
    for (const [tableName, columns] of Object.entries(requiredSchema)) {
      const tableExists = await db.getAllAsync(`
        SELECT name FROM sqlite_master WHERE type='table' AND name=?;
      `, tableName);

      if (tableExists.length === 0) {
        // Create full table
        const columnsSQL = Object.entries(columns)
          .map(([colName, colType]) => `${colName} ${colType}`)
          .join(',\n  ');
        const foreignKeys =
          tableName === 'plants'
            ? ',\n  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE'
            : tableName === 'plant_characteristics'
              ? ',\n  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE'
              : '';
        const createTableSQL = `CREATE TABLE ${tableName} (\n  ${columnsSQL}${foreignKeys}\n);`;
        await db.execAsync(createTableSQL);
        console.log(`Created table: ${tableName}`);
      } else {
        // Check and add missing columns
        const existingCols = await db.getAllAsync(`PRAGMA table_info(${tableName});`);
        const existingColNames = existingCols.map((col: any) => col.name);

        for (const [colName, colType] of Object.entries(columns)) {
          if (!existingColNames.includes(colName)) {
            const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType};`;
            await db.execAsync(alterSQL);
            console.log(`Added column '${colName}' to table '${tableName}'`);
          }
        }
      }
    }

    // Triggers
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
    console.log("Database initialized and schema verified.");
  } catch (error: any) {
    await db.execAsync("ROLLBACK;");
    console.error("Error initializing database:", error);
    Alert.alert("Error initializing database", error.message);
  }
}


export async function addDocument(nameStore: string, storeId: string): Promise<number | null> {
  const db = await openDB();
  const createdAt = new Date().toISOString();
  try {
    const result = await db.runAsync(
      "INSERT INTO documents (storage_name, storage_id, comment, is_sent, created_at) VALUES (?, ?, ?, 0, ?)",
      [nameStore, storeId, '', createdAt]
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
  plantDBId: number,
  plantItem: PlantItemRespons
): Promise<number | null> {
  const db = await openDB();
  try {
    console.log('addCharacteristic___', plantDBId, plantItem.barcode)
    const result = await db.runAsync(
      `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plantDBId,
        plantItem.characteristic.id ? plantItem.characteristic.id : 'null',
        plantItem.characteristic.name ? plantItem.characteristic.name : 'null',
        plantItem.unit.id ? plantItem.unit.id : 'null',
        plantItem.unit.name ? plantItem.unit.name : 'null',
        plantItem.barcode ? plantItem.barcode : 0,
        plantItem.qty ? plantItem.qty : 0,
      ]
    );

    return result.lastInsertRowId;
  } catch (error) {
    Alert.alert("Error adding plant characteristic to doc: ", plantItem.product.name)
    console.log("Error adding plant characteristic:", error);
    return null;
  }
}

export async function addAllPlantToDB(
  documentId: number,
  serverData: PlantItemRespons[],
  progressCallback?: (current: number, total: number) => void
): Promise<void> {
  const db = await openDB();

  await db.execAsync("BEGIN TRANSACTION");

  try {
    const plantIdSet = new Set<string>(); // Запам'ятовуємо, які вже обробляли тут
    let inserted = 0;

    for (let i = 0; i < serverData.length; i++) {
      const item = serverData[i];
      const productId = item.product.id;

      // Пропускаємо, якщо вже перевіряли цей productId у цій сесії
      if (plantIdSet.has(productId)) {
        continue;
      }

      plantIdSet.add(productId);

      // Перевірка чи існує вже в базі
      const existing = await db.getFirstAsync(
        "SELECT id FROM plants WHERE document_id = ? AND product_id = ?",
        [documentId, productId]
      );

      if (!existing) {
        await db.runAsync(
          "INSERT INTO plants (document_id, product_id, product_name) VALUES (?, ?, ?)",
          [documentId, productId, item.product.name]
        );
      }

      inserted++;
      if (progressCallback) {
        progressCallback(inserted, serverData.length);
      }
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Transaction failed:", error);
    throw error;
  }
}


export async function addAllCharToDB(
  palntDBId: number,
  detailData: PlantItemRespons[],
  progressCallback?: (current: number, total: number) => void
): Promise<void> {
  const db = await openDB();
  await db.execAsync("BEGIN TRANSACTION");

  try {
    let inserted = 0;

    for (let i = 0; i < detailData.length; i++) {
      const item = detailData[i];
      await db.runAsync(
        `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          palntDBId,
          item.characteristic.id ? item.characteristic.id : 'null',
          item.characteristic.name ? item.characteristic.name : 'null',
          item.unit.id ? item.unit.id : 'null',
          item.unit.name ? item.unit.name : 'null',
          item.barcode ? item.barcode : 0,
          item.qty ? item.qty : 0,
        ]
      );
      inserted++;
      if (progressCallback) {
        progressCallback(inserted, detailData.length);
      }
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Transaction failed:", error);
    throw error;
  }
}


export async function fetchDocuments(): Promise<any[]> {
  const db = await openDB();

  try {
    const rows = await db.getAllAsync("SELECT * FROM documents ORDER BY created_at DESC");
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
      `
      SELECT 
        p.*,
        COUNT(pc.id) AS count_items,
        SUM(COALESCE(pc.currentQty, 0)) AS total_qty,
        SUM(COALESCE(pc.freeQty, 0)) AS sale_qty
      FROM plants p
      LEFT JOIN plant_characteristics pc ON p.id = pc.plant_id
      WHERE p.document_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      `,
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
  console.log('deleteDocument', documentId,)
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
  console.log('DB deleteCharacteristic', characteristicId)
  try {
    const result = await db.runAsync("DELETE FROM plant_characteristics WHERE id = ?", characteristicId);
    console.log('DB deleteCharacteristic result', result)
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

export async function updateDBFreeQty(DbCharacteristicId: number, freeQty: number): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plant_characteristics SET freeQty = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [freeQty, DbCharacteristicId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating currentQty:", error);
    return false;
  }
}

export async function updateDBPlantComment(DbCharacteristicId: number, value: string): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plant_characteristics SET plantComment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [value, DbCharacteristicId]
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

export const markDocumentAsSent = async (docId: number, status: UploadStatus) => {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE documents SET is_sent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, docId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating currentQty:", error);
    return false;
  }
};

interface StorageInfo {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface NewProduct {
  product: Product;
  characteristic: {
    id: string;
    name: string;
  };
  qty: number;
  saleQty: number;
  plantComment: string;
}

export interface DocumentResult {
  id: string;
  date: string;
  number: string;
  comment: string;
  storage: StorageInfo;
  products: ProductItem[];
  newproducts: NewProduct[];
}

interface PlantResult {
  productId: string | null;
  productName: string | null;
  characteristicId: string | null;
  characteristicName: string | null;
  unitId: string | null;
  unitName: string | null;
  qty: number | null;
  saleQty: number | null;
  plantComment: string | null;
}

interface ProductItem {
  product: {
    id: string;
    name: string;
  };
  characteristic: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    name: string;
  };
  qty: number;
  saleQty: number;
  plantComment: string;
};


export async function getDocumentWithDetails(docId: number): Promise<DocumentResult | null> {
  const db = await openDB();

  try {
    const docResult = await db.getFirstAsync<{
      id: string;
      storage_id: string | null;
      storage_name: string | null;
      comment: string | null;
      date: string | null;
      number: string | null;
    }>(
      `SELECT id, storage_id, storage_name, comment, number, created_at AS date 
         FROM documents WHERE id = ?`,
      [docId]
    );

    if (!docResult) return null;

    const plantResults = await db.getAllAsync<PlantResult>(
      `SELECT 
            p.product_id AS productId, 
            p.product_name AS productName, 
            c.characteristic_id AS characteristicId, 
            c.characteristic_name AS characteristicName, 
            c.unit_id AS unitId, 
            c.unit_name AS unitName, 
            c.currentQty AS qty,
            c.freeQty AS saleQty,
            c.plantComment AS plantComment
         FROM plants p
         LEFT JOIN plant_characteristics c ON p.id = c.plant_id
         WHERE p.document_id = ?`,
      [docId]
    );

    const products: ProductItem[] = [];
    const newproducts: NewProduct[] = [];

    for (const row of plantResults) {
      if (row.characteristicId === newSIZE) {
        newproducts.push({
          product: {
            id: row.productId || "",
            name: row.productName || ""
          },
          characteristic: {
            id: nullID,
            name: row.characteristicName || ""
          },
          qty: row.qty ?? 0,
          saleQty: row.saleQty ?? 0,
          plantComment: row.plantComment || ""
        });
      } else if (!row.characteristicId || !row.characteristicName) {
        console.log('getDocumentWithDetails: empty characteristicId, characteristicName')
      } else {
        products.push({
          product: {
            id: row.productId || "",
            name: row.productName || ""
          },
          characteristic: {
            id: row.characteristicId || "",
            name: row.characteristicName || ""
          },
          unit: {
            id: row.unitId || "",
            name: row.unitName || ""
          },
          qty: row.qty ?? 0,
          saleQty: row.saleQty ?? 0,
          plantComment: row.plantComment || ""
        });
      }
    }

    return {
      id: nullID,
      date: docResult.date ? format(docResult.date, "yyyy-dd-MM HH-mm-ss") : '', //"YYYY-DD-MM HH-mm-ss"
      number: format(new Date(), "MddHHmmss"),
      comment: docResult.comment || "",
      storage: {
        id: docResult.storage_id || "",
        name: docResult.storage_name || ""
      },
      products: products,
      newproducts: newproducts
    };

  } catch (error) {
    console.error("Помилка отримання документа:", error);
    throw new Error("Не вдалося отримати дані з бази");
  }
}




const DB_NAME = 'app.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
export const deleteDatabase = async () => {
  const dbDirectory = FileSystem.documentDirectory + 'SQLite/';
  try {
    const dbInfo = await FileSystem.getInfoAsync(DB_PATH);
    if (dbInfo.exists) {
      await FileSystem.deleteAsync(dbDirectory + 'app.db', { idempotent: true });
      await FileSystem.deleteAsync(dbDirectory + 'app.db-shm', { idempotent: true });
      await FileSystem.deleteAsync(dbDirectory + 'app.db-wal', { idempotent: true });
      console.log('База даних видалена успішно.');
    } else {
      console.log('База даних не знайдена.');
    }
  } catch (error) {
    console.error('Помилка при видаленні бази даних:', error);
  }
};

export const checkDatabaseSchema = async () => {
  const db = await openDB();
  try {
    const resultSet: any = await db.getAllAsync("PRAGMA table_info(documents);");
    console.log("resultSet____", resultSet);
    const columns = resultSet.map((row: any) => row.name);
    const requiredColumns = ["storage_id", "storage_name", "comment"];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));

    if (missingColumns.length > 0) {
      //await deleteDatabase();
      console.log(`Базу даних потрібно було перезапустити. Відсутні колонки: ${missingColumns.join(", ")}`);
    } else {
      console.log("Усі необхідні колонки присутні.");
    }
  } catch (error) {
    console.error("Помилка перевірки схеми:", error);
  }
};

export const listDatabases = async () => {
  const dbDir = FileSystem.documentDirectory + 'SQLite/';
  console.log('Databases dbDir:', dbDir);
  const files = await FileSystem.readDirectoryAsync(dbDir);
  console.log('Databases:', files);
};












