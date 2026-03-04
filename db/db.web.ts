/**
 * Web implementation of the app database using sql.js + IndexedDB persistence.
 * Same API as db.native.ts so the rest of the app can import from @/db/db.
 */
import { PlantItemRespons } from "@/redux/stateServiceTypes";
import { newSIZE, nullID, UploadStatus } from "@/types/typesScreen";
import { format } from "date-fns/format";

const INDEXED_DB_NAME = "PlantStockDB";
const INDEXED_DB_STORE = "sqlite";
const DB_KEY = "app.db";

type SqlJsDatabase = import("sql.js").Database;

let dbInstance: SqlJsDatabase | null = null;
let initPromise: Promise<SqlJsDatabase> | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXED_DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE);
      }
    };
  });
}

function loadDbFromIndexedDB(): Promise<ArrayBuffer | null> {
  return openIndexedDB().then(
    (idb) =>
      new Promise<ArrayBuffer | null>((resolve, reject) => {
        const tx = idb.transaction(INDEXED_DB_STORE, "readonly");
        const store = tx.objectStore(INDEXED_DB_STORE);
        const req = store.get(DB_KEY);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
        idb.close();
      })
  );
}

function saveDbToIndexedDB(data: Uint8Array): Promise<void> {
  return openIndexedDB().then(
    (idb) =>
      new Promise((resolve, reject) => {
        const tx = idb.transaction(INDEXED_DB_STORE, "readwrite");
        const store = tx.objectStore(INDEXED_DB_STORE);
        store.put(data, DB_KEY);
        tx.oncomplete = () => {
          idb.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      })
  );
}

async function initSqlJs(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });

    const saved = await loadDbFromIndexedDB();
    if (saved && saved.byteLength > 0) {
      dbInstance = new SQL.Database(new Uint8Array(saved));
    } else {
      dbInstance = new SQL.Database();
    }
    return dbInstance;
  })();

  return initPromise;
}

async function persist(): Promise<void> {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    await saveDbToIndexedDB(data);
  } catch (e) {
    console.warn("Failed to persist DB to IndexedDB:", e);
  }
}

export interface WebDbAdapter {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
}

function getAdapter(db: SqlJsDatabase): WebDbAdapter {
  return {
    execAsync(sql: string): Promise<void> {
      return new Promise((resolve, reject) => {
        try {
          db.run(sql);
          persist().then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    },

    runAsync(sql: string, ...params: any[]): Promise<{ lastInsertRowId: number; changes: number }> {
      return new Promise((resolve, reject) => {
        try {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          db.run(sql, flatParams);
          const lastInsertRowId = Number(db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] ?? 0);
          const changes = db.getRowsModified();
          persist().then(() => resolve({ lastInsertRowId, changes })).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    },

    getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]> {
      return new Promise((resolve, reject) => {
        try {
          const flatParams = params ?? [];
          const stmt = db.prepare(sql);
          stmt.bind(flatParams);
          const rows: T[] = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject() as T);
          }
          stmt.free();
          resolve(rows);
        } catch (e) {
          reject(e);
        }
      });
    },

    getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null> {
      return getAdapter(db).getAllAsync<T>(sql, params).then((rows) => rows[0] ?? null);
    },
  };
}

let adapterInstance: WebDbAdapter | null = null;

export async function openDB(): Promise<WebDbAdapter> {
  const db = await initSqlJs();
  if (!adapterInstance) adapterInstance = getAdapter(db);
  return adapterInstance;
}

const requiredSchema: Record<string, { [column: string]: string }> = {
  documents: {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    number: "TEXT NOT NULL DEFAULT ''",
    storage_id: "TEXT NOT NULL DEFAULT ''",
    storage_name: "TEXT NOT NULL DEFAULT ''",
    comment: "TEXT NOT NULL DEFAULT ''",
    is_sent: "INTEGER DEFAULT 0",
    created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  },
  plants: {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    document_id: "INTEGER NOT NULL",
    product_id: "TEXT NOT NULL",
    product_name: "TEXT NOT NULL",
    created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  },
  plant_characteristics: {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    plant_id: "INTEGER NOT NULL",
    characteristic_id: "TEXT NOT NULL",
    characteristic_name: "TEXT NOT NULL",
    unit_id: "TEXT NOT NULL",
    unit_name: "TEXT NOT NULL",
    barcode: "TEXT NOT NULL",
    quantity: "INTEGER NOT NULL DEFAULT 0",
    currentQty: "INTEGER NOT NULL DEFAULT 0",
    freeQty: "INTEGER NOT NULL DEFAULT 0",
    plantComment: "TEXT NOT NULL DEFAULT ''",
    created_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
    updated_at: "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP",
  },
};

export async function initializeDB(): Promise<void> {
  const db = await openDB();
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("PRAGMA journal_mode = WAL;");
    /* no explicit transaction - sql.js run() can cause "no transaction is active" with BEGIN/COMMIT */

    for (const [tableName, columns] of Object.entries(requiredSchema)) {
      const tableExists = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?;",
        [tableName]
      );

      if (tableExists.length === 0) {
        const columnsSQL = Object.entries(columns)
          .map(([colName, colType]) => `${colName} ${colType}`)
          .join(",\n  ");
        const foreignKeys =
          tableName === "plants"
            ? ",\n  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE"
            : tableName === "plant_characteristics"
              ? ",\n  FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE"
              : "";
        const createTableSQL = `CREATE TABLE ${tableName} (\n  ${columnsSQL}${foreignKeys}\n);`;
        await db.execAsync(createTableSQL);
      } else {
        const existingCols = await db.getAllAsync<{ name: string }>(
          `PRAGMA table_info(${tableName});`
        );
        const existingColNames = existingCols.map((r) => r.name);
        for (const [colName, colType] of Object.entries(columns)) {
          if (!existingColNames.includes(colName)) {
            await db.execAsync(
              `ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType};`
            );
          }
        }
      }
    }

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

    await persist();
  } catch (error: any) {
    console.error("Error initializing database:", error);
    if (typeof window !== "undefined") window.alert("Error initializing database: " + error?.message);
  }
}

export async function addDocument(nameStore: string, storeId: string): Promise<number | null> {
  const db = await openDB();
  const createdAt = new Date().toISOString();
  try {
    const result = await db.runAsync(
      "INSERT INTO documents (storage_name, storage_id, comment, is_sent, created_at) VALUES (?, ?, ?, 0, ?)",
      nameStore,
      storeId,
      "",
      createdAt
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
}

export async function addPlant(
  documentId: number,
  product: { id: string; name: string }
): Promise<number | null> {
  const db = await openDB();
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
    const result = await db.runAsync(
      `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      plantDBId,
      plantItem.characteristic.id ?? "null",
      plantItem.characteristic.name ?? "null",
      plantItem.unit.id ?? "null",
      plantItem.unit.name ?? "null",
      plantItem.barcode ? String(plantItem.barcode) : "0",
      plantItem.qty ?? 0
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding plant characteristic:", error);
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
  const plantIdSet = new Set<string>();
  try {
    for (let i = 0; i < serverData.length; i++) {
      const item = serverData[i];
      const productId = item.product.id;
      if (plantIdSet.has(productId)) continue;
      plantIdSet.add(productId);

      const existing = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM plants WHERE document_id = ? AND product_id = ?",
        [documentId, productId]
      );
      if (!existing) {
        await db.runAsync(
          "INSERT INTO plants (document_id, product_id, product_name) VALUES (?, ?, ?)",
          documentId,
          productId,
          item.product.name
        );
      }
      if (progressCallback) progressCallback(i + 1, serverData.length);
    }
    await db.execAsync("COMMIT");
    await persist();
  } catch (error) {
    try {
      await db.execAsync("ROLLBACK");
    } catch (_) {
      /* ignore */
    }
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
    for (let i = 0; i < detailData.length; i++) {
      const item = detailData[i];
      await db.runAsync(
        `INSERT INTO plant_characteristics 
       (plant_id, characteristic_id, characteristic_name, unit_id, unit_name, barcode, quantity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        palntDBId,
        item.characteristic.id ?? "null",
        item.characteristic.name ?? "null",
        item.unit.id ?? "null",
        item.unit.name ?? "null",
        item.barcode ? String(item.barcode) : "0",
        item.qty ?? 0
      );
      if (progressCallback) progressCallback(i + 1, detailData.length);
    }
    await db.execAsync("COMMIT");
    await persist();
  } catch (error) {
    try {
      await db.execAsync("ROLLBACK");
    } catch (_) {
      /* ignore */
    }
    console.error("Transaction failed:", error);
    throw error;
  }
}

export async function fetchDocuments(): Promise<any[]> {
  const db = await openDB();
  try {
    return await db.getAllAsync("SELECT * FROM documents ORDER BY created_at DESC");
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function fetchPlants(documentId: number): Promise<any[]> {
  const db = await openDB();
  try {
    return await db.getAllAsync(
      `SELECT p.*, COUNT(pc.id) AS count_items,
        SUM(COALESCE(pc.currentQty, 0)) AS total_qty,
        SUM(COALESCE(pc.freeQty, 0)) AS sale_qty
       FROM plants p
       LEFT JOIN plant_characteristics pc ON p.id = pc.plant_id
       WHERE p.document_id = ?
       GROUP BY p.id ORDER BY p.created_at DESC`,
      [documentId]
    );
  } catch (error) {
    console.error("Error fetching plants:", error);
    return [];
  }
}

export async function fetchCharacteristics(plantId: number, docId: number): Promise<any[]> {
  const db = await openDB();
  try {
    return await db.getAllAsync(
      `SELECT pc.* FROM plant_characteristics pc
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
  const db = await openDB();
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

export async function updateCharacteristic(
  DbCharacteristicId: number,
  currentQty: number
): Promise<boolean> {
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
    console.error("Error updating freeQty:", error);
    return false;
  }
}

export async function updateDBPlantComment(
  DbCharacteristicId: number,
  value: string
): Promise<boolean> {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE plant_characteristics SET plantComment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [value, DbCharacteristicId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating plantComment:", error);
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
    console.error("Error updating comment:", error);
    return false;
  }
}

export const markDocumentAsSent = async (docId: number, status: UploadStatus): Promise<boolean> => {
  const db = await openDB();
  try {
    const result = await db.runAsync(
      "UPDATE documents SET is_sent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, docId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error("Error updating is_sent:", error);
    return false;
  }
};

// Types for getDocumentWithDetails (same as db.native)
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
  characteristic: { id: string; name: string };
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
  product: { id: string; name: string };
  characteristic: { id: string; name: string };
  unit: { id: string; name: string };
  qty: number;
  saleQty: number;
  plantComment: string;
}

export async function getDocumentWithDetails(docId: number): Promise<DocumentResult | null> {
  const db = await openDB();
  try {
    const docResult = await db.getFirstAsync<{
      id: number;
      storage_id: string | null;
      storage_name: string | null;
      comment: string | null;
      date: string | null;
      number: string | null;
    }>(
      `SELECT id, storage_id, storage_name, comment, number, created_at AS date FROM documents WHERE id = ?`,
      [docId]
    );
    if (!docResult) return null;

    const plantResults = await db.getAllAsync<PlantResult>(
      `SELECT p.product_id AS productId, p.product_name AS productName,
        c.characteristic_id AS characteristicId, c.characteristic_name AS characteristicName,
        c.unit_id AS unitId, c.unit_name AS unitName, c.currentQty AS qty,
        c.freeQty AS saleQty, c.plantComment AS plantComment
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
          product: { id: row.productId ?? "", name: row.productName ?? "" },
          characteristic: { id: nullID, name: row.characteristicName ?? "" },
          qty: row.qty ?? 0,
          saleQty: row.saleQty ?? 0,
          plantComment: row.plantComment ?? "",
        });
      } else if (!row.characteristicId || !row.characteristicName) {
        // skip
      } else {
        products.push({
          product: { id: row.productId ?? "", name: row.productName ?? "" },
          characteristic: { id: row.characteristicId ?? "", name: row.characteristicName ?? "" },
          unit: { id: row.unitId ?? "", name: row.unitName ?? "" },
          qty: row.qty ?? 0,
          saleQty: row.saleQty ?? 0,
          plantComment: row.plantComment ?? "",
        });
      }
    }

    return {
      id: nullID,
      date: docResult.date ? format(docResult.date, "yyyy-dd-MM HH-mm-ss") : "",
      number: format(new Date(), "MddHHmmss"),
      comment: docResult.comment ?? "",
      storage: { id: docResult.storage_id ?? "", name: docResult.storage_name ?? "" },
      products,
      newproducts,
    };
  } catch (error) {
    console.error("Error getDocumentWithDetails:", error);
    throw new Error("Не вдалося отримати дані з бази");
  }
}

export const deleteDatabase = async (): Promise<void> => {
  try {
    const idb = await openIndexedDB();
    const tx = idb.transaction(INDEXED_DB_STORE, "readwrite");
    tx.objectStore(INDEXED_DB_STORE).delete(DB_KEY);
    idb.close();
    dbInstance = null;
    adapterInstance = null;
    initPromise = null;
    console.log("Database cleared from IndexedDB.");
  } catch (error) {
    console.error("Error clearing database:", error);
  }
};

export const checkDatabaseSchema = async (): Promise<void> => {
  const db = await openDB();
  try {
    const resultSet = await db.getAllAsync<{ name: string }>("PRAGMA table_info(documents);");
    const columns = resultSet.map((r) => r.name);
    const requiredColumns = ["storage_id", "storage_name", "comment"];
    const missing = requiredColumns.filter((c) => !columns.includes(c));
    if (missing.length > 0) {
      console.log("Missing columns:", missing.join(", "));
    }
  } catch (error) {
    console.error("Error checking schema:", error);
  }
};

export const listDatabases = async (): Promise<void> => {
  console.log("Web DB: single store in IndexedDB, key:", DB_KEY);
};
