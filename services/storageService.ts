
import { ActivityLog } from '../types';

/**
 * Persistence Engine: IndexedDB Wrapper
 * Handles heavy data blobs that exceed localStorage quota.
 */

const DB_NAME = 'StudentPocketDB';
const STORE_NAME = 'user_data';
const LOGS_STORE_NAME = 'activity_logs';
const DB_VERSION = 2; // Incremented for logs store

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(LOGS_STORE_NAME)) {
        const logStore = db.createObjectStore(LOGS_STORE_NAME, { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const storageService = {
  /**
   * Commits data to the high-capacity node.
   */
  async setData(key: string, value: any): Promise<void> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('CRITICAL_STORAGE_FAILURE:', error);
      throw error;
    }
  },

  /**
   * Retrieves data from the high-capacity node.
   */
  async getData(key: string): Promise<any> {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('STORAGE_RETRIEVAL_FAILURE:', error);
      return null;
    }
  },

  /**
   * Purges a data node.
   */
  async deleteData(key: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Appends an entry to the system activity log.
   */
  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOGS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(LOGS_STORE_NAME);
      
      const entry: ActivityLog = {
        ...log,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      const request = store.add(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Retrieves all activity logs sorted by newest first.
   */
  async getLogs(): Promise<ActivityLog[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LOGS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(LOGS_STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const results: ActivityLog[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
};
