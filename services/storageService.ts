
import { ActivityLog, UserProfile, SanctionRecord } from '../types';
import { DEFAULT_USER, PROHIBITED_TERMS } from '../constants';

const DB_NAME = 'StudentPocketDB';
const STORE_NAME = 'user_data';
const LOGS_STORE_NAME = 'activity_logs';
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

  async scanAndProtect(username: string, content: string): Promise<boolean> {
      console.log(`[SHIELD] Scanning content for node: ${username}`);
      const lower = content.toLowerCase();
      const hasViolation = PROHIBITED_TERMS.some(term => lower.includes(term.toLowerCase()));
      
      if (hasViolation) {
          console.warn(`[SHIELD] Security violation detected in content.`);
          await this.recordViolation(username, 'LINGUISTIC', `Restricted term used: "${content.substring(0, 30)}..."`);
          return true;
      }
      return false;
  },

  async recordViolation(username: string, type: SanctionRecord['type'], context: string): Promise<void> {
      const dataKey = `architect_data_${username}`;
      const storedData = await this.getData(dataKey);
      if (storedData && storedData.user) {
          let deduction = 5;
          if (type === 'PIN_FAILURE') deduction = 10;
          if (type === 'LINGUISTIC') deduction = 25;

          const currentScore = storedData.user.integrityScore ?? 100;
          const newScore = Math.max(0, currentScore - deduction);

          const sanction: SanctionRecord = {
              id: generateUUID(),
              type,
              severity: deduction >= 20 ? 'HIGH' : 'LOW',
              timestamp: Date.now(),
              context
          };

          storedData.user.integrityScore = newScore;
          storedData.user.sanctions = [...(storedData.user.sanctions || []), sanction];
          
          if (newScore <= 0 || type === 'LINGUISTIC') {
              console.error(`[SECURITY] Automatic purge triggered for node: ${username}`);
              storedData.user.isBanned = true;
              storedData.user.banReason = "INTEGRITY_FAIL_OR_LINGUISTIC_SHIELD";
          }
          
          await this.setData(dataKey, storedData);

          await this.logActivity({
              actor: 'SYSTEM-GUARDIAN',
              targetUser: username,
              actionType: 'SANCTION',
              description: `Integrity Deducted: -${deduction}%`,
              metadata: context
          });
      }
  },

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(LOGS_STORE_NAME, 'readwrite');
    transaction.objectStore(LOGS_STORE_NAME).add({ ...log, id: generateUUID(), timestamp: Date.now() });
  },

  async validateSystemKey(input: string): Promise<boolean> {
      return input === "SUSHIL-GUARDIAN-2026";
  }
};
