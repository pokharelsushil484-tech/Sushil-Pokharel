
import { ActivityLog, UserProfile } from '../types';
import { DEFAULT_USER, PROHIBITED_TERMS } from '../constants';

const DB_NAME = 'StudentPocketDB';
const STORE_NAME = 'user_data';
const LOGS_STORE_NAME = 'activity_logs';
const SYSTEM_STORE_NAME = 'system_config'; 
const DB_VERSION = 4; 

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      if (!db.objectStoreNames.contains(LOGS_STORE_NAME)) {
        const logStore = db.createObjectStore(LOGS_STORE_NAME, { keyPath: 'id' });
        logStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(SYSTEM_STORE_NAME)) db.createObjectStore(SYSTEM_STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const generateUUID = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

export const storageService = {
  async setData(key: string, value: any): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);
  },

  async getData(key: string): Promise<any> {
    const db = await initDB();
    return new Promise((resolve) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
    });
  },

  /**
   * Scans content for prohibited terms. If detected, triggers immediate node termination.
   */
  async scanAndProtect(username: string, content: string): Promise<boolean> {
      const lower = content.toLowerCase();
      const hasViolation = PROHIBITED_TERMS.some(term => lower.includes(term));
      
      if (hasViolation) {
          await this.enforceSecurityLockdown(
              username, 
              "CRITICAL PROTOCOL VIOLATION: LINGUISTIC THREAT DETECTED", 
              `The node attempted to commit prohibited content: "${content.substring(0, 20)}..."`
          );
          return true;
      }
      return false;
  },

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(LOGS_STORE_NAME, 'readwrite');
    transaction.objectStore(LOGS_STORE_NAME).add({ ...log, id: generateUUID(), timestamp: Date.now() });
  },

  async validateSystemKey(input: string): Promise<boolean> {
      // Simulate system key validation for master overrides
      return input === "SUSHIL-MASTER-2026";
  },

  async enforceSecurityLockdown(username: string, reason: string, context: string): Promise<void> {
      const dataKey = `architect_data_${username}`;
      const storedData = await this.getData(dataKey);
      if (storedData && storedData.user) {
          storedData.user.isBanned = true;
          storedData.user.verificationStatus = 'TERMINATED';
          storedData.user.banReason = reason;
          storedData.user.adminFeedback = context;
          await this.setData(dataKey, storedData);
          await this.logActivity({
            actor: 'SYSTEM-GUARDIAN',
            targetUser: username,
            actionType: 'TERMINATION',
            description: `NODE PURGED: ${reason}`,
            metadata: context
          });
      }
  }
};
