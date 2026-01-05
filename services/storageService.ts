
import { ActivityLog, UserProfile } from '../types';
import { DEFAULT_USER } from '../constants';

/**
 * Persistence Engine: IndexedDB Wrapper
 * Handles heavy data blobs that exceed localStorage quota.
 */

const DB_NAME = 'StudentPocketDB';
const STORE_NAME = 'user_data';
const LOGS_STORE_NAME = 'activity_logs';
const SYSTEM_STORE_NAME = 'system_config'; // New store for global keys
const DB_VERSION = 3; // Incremented for system store

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
      if (!db.objectStoreNames.contains(SYSTEM_STORE_NAME)) {
        db.createObjectStore(SYSTEM_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// UUID Fallback for older environments
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface SystemKeyState {
    pin: string | null; // Shared 6-digit PIN
    msCode: string | null;
    admCode: string | null;
    tknCode: string | null; // Master Token
    status: 'ACTIVE' | 'COOLDOWN';
    timerStart: number;
    timerRemaining: number;
}

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
        id: generateUUID(),
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
  },

  /**
   * MASTER KEY / ADMISSION KEY / TOKEN ROTATION SYSTEM
   * Shared PIN logic: MS-[PIN], ADM-[PIN], TKN-[PIN]
   * 1 Minute Active -> 1 Minute Deleted (Cooldown) -> Regenerate
   */
  async getSystemKeys(): Promise<SystemKeyState> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SYSTEM_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(SYSTEM_STORE_NAME);
        const request = store.get('key_cycle_state');

        const DURATION = 60 * 1000; // 1 Minute

        request.onsuccess = () => {
            let data = request.result;
            const now = Date.now();

            // Initial Generation or Regeneration or Migration
            if (!data || !data.tknCode) {
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                data = { 
                    pin: pin,
                    msCode: `MS-${pin}`, 
                    admCode: `ADM-${pin}`,
                    tknCode: `TKN-${pin}`,
                    status: 'ACTIVE', 
                    timerStart: now 
                };
                store.put(data, 'key_cycle_state');
                resolve({ ...data, timerRemaining: Math.ceil(DURATION / 1000) });
                return;
            }

            const elapsed = now - data.timerStart;

            if (data.status === 'ACTIVE') {
                if (elapsed >= DURATION) {
                    // Switch to Cooldown (Delete Keys)
                    data.status = 'COOLDOWN';
                    data.pin = null;
                    data.msCode = null;
                    data.admCode = null;
                    data.tknCode = null;
                    data.timerStart = now;
                    store.put(data, 'key_cycle_state');
                    resolve({ ...data, timerRemaining: Math.ceil(DURATION / 1000) });
                } else {
                    // Still Active
                    resolve({ ...data, timerRemaining: Math.ceil((DURATION - elapsed) / 1000) });
                }
            } else {
                // Status is COOLDOWN
                if (elapsed >= DURATION) {
                    // Regenerate Keys
                    const pin = Math.floor(100000 + Math.random() * 900000).toString();
                    data.status = 'ACTIVE';
                    data.pin = pin;
                    data.msCode = `MS-${pin}`;
                    data.admCode = `ADM-${pin}`;
                    data.tknCode = `TKN-${pin}`;
                    data.timerStart = now;
                    store.put(data, 'key_cycle_state');
                    resolve({ ...data, timerRemaining: Math.ceil(DURATION / 1000) });
                } else {
                     // Still in Cooldown
                     resolve({ ...data, timerRemaining: Math.ceil((DURATION - elapsed) / 1000) });
                }
            }
        };
        request.onerror = () => reject(request.error);
    });
  },

  /**
   * Validate Input Key against current System Keys
   */
  async validateSystemKey(input: string): Promise<boolean> {
      const state = await this.getSystemKeys();
      if (state.status === 'ACTIVE') {
          // Input must match MS, ADM, or TKN format exactly
          return input === state.msCode || input === state.admCode || input === state.tknCode;
      }
      return false;
  },

  /**
   * SECURITY LOCKDOWN PROTOCOL
   * Immediately bans user, revokes verification, adds badges, and logs event.
   */
  async enforceSecurityLockdown(username: string, reason: string, context: string): Promise<void> {
      const dataKey = `architect_data_${username}`;
      const storedData = await this.getData(dataKey);
      
      if (storedData && storedData.user) {
          const updatedProfile: UserProfile = {
            ...storedData.user,
            isBanned: true,
            isSuspicious: true,
            isVerified: false,
            // Apply Mandatory Badges
            badges: Array.from(new Set([...(storedData.user.badges || []), 'DANGEROUS', 'SUSPICIOUS'])),
            banReason: reason
          };
          
          await this.setData(dataKey, { 
              ...storedData, 
              user: updatedProfile 
          });
          
          await this.logActivity({
            actor: username,
            targetUser: username,
            actionType: 'SECURITY',
            description: 'CRITICAL SECURITY LOCKDOWN: Suspicious activity detected.',
            metadata: `Context: ${context} | Reason: ${reason}`
          });
      }
  }
};
