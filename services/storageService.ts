import { ActivityLog, UserProfile } from '../types';
import { DEFAULT_USER } from '../constants';

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
    pin: string | null;
    msCode: string | null;
    admCode: string | null;
    tknCode: string | null;
    status: 'ACTIVE' | 'COOLDOWN';
    timerStart: number;
    timerRemaining: number;
}

export const storageService = {
  async setData(key: string, value: any): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getData(key: string): Promise<any> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteData(key: string): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);
  },

  async logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction(LOGS_STORE_NAME, 'readwrite');
    const entry: ActivityLog = { ...log, id: generateUUID(), timestamp: Date.now() };
    transaction.objectStore(LOGS_STORE_NAME).add(entry);
  },

  async getSystemKeys(): Promise<SystemKeyState> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SYSTEM_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(SYSTEM_STORE_NAME);
        const request = store.get('key_cycle_state');
        const ACTIVE_DURATION = 5 * 60 * 1000;
        const COOLDOWN_DURATION = 1 * 60 * 1000;

        request.onsuccess = () => {
            let data = request.result;
            const now = Date.now();
            if (!data) {
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                data = { pin, msCode: `MS-${pin}`, admCode: `ADM-${pin}`, tknCode: `TKN-${pin}`, status: 'ACTIVE', timerStart: now };
                store.put(data, 'key_cycle_state');
                resolve({ ...data, timerRemaining: Math.ceil(ACTIVE_DURATION / 1000) });
                return;
            }
            const elapsed = now - data.timerStart;
            if (data.status === 'ACTIVE' && elapsed >= ACTIVE_DURATION) {
                data.status = 'COOLDOWN';
                data.msCode = data.admCode = data.tknCode = null;
                data.timerStart = now;
                store.put(data, 'key_cycle_state');
            } else if (data.status === 'COOLDOWN' && elapsed >= COOLDOWN_DURATION) {
                const pin = Math.floor(100000 + Math.random() * 900000).toString();
                data = { pin, msCode: `MS-${pin}`, admCode: `ADM-${pin}`, tknCode: `TKN-${pin}`, status: 'ACTIVE', timerStart: now };
                store.put(data, 'key_cycle_state');
            }
            const remaining = data.status === 'ACTIVE' ? (ACTIVE_DURATION - elapsed) : (COOLDOWN_DURATION - elapsed);
            resolve({ ...data, timerRemaining: Math.ceil(remaining / 1000) });
        };
        request.onerror = () => reject(request.error);
    });
  },

  async validateSystemKey(input: string): Promise<boolean> {
      const state = await this.getSystemKeys();
      return state.status === 'ACTIVE' && (input === state.msCode || input === state.admCode || input === state.tknCode);
  },

  async recordViolation(username: string, reason: string): Promise<void> {
    const dataKey = `architect_data_${username}`;
    const storedData = await this.getData(dataKey);
    if (storedData && storedData.user) {
        const user = storedData.user as UserProfile;
        user.violationCount = (user.violationCount || 0) + 1;
        
        if (user.violationCount >= (user.maxViolations || 3)) {
            await this.enforceSecurityLockdown(username, `CRITICAL TERMINATION: ${reason} (Strike ${user.violationCount})`, "Multiple strikes reached.");
        } else {
            await this.setData(dataKey, storedData);
            await this.logActivity({
                actor: 'SYSTEM-PUNISHMENT',
                targetUser: username,
                actionType: 'SECURITY',
                description: `STRIKE ISSUED: ${reason}`,
                metadata: `Current strikes: ${user.violationCount}`
            });
        }
    }
  },

  async enforceSecurityLockdown(username: string, reason: string, context: string): Promise<void> {
      const dataKey = `architect_data_${username}`;
      const storedData = await this.getData(dataKey);
      if (storedData && storedData.user) {
          storedData.user.isBanned = true;
          storedData.user.isSuspicious = true;
          storedData.user.verificationStatus = 'NONE';
          storedData.user.level = 0;
          storedData.user.banReason = reason;
          storedData.user.badges = Array.from(new Set([...(storedData.user.badges || []), 'TERMINATED', 'BANNED', 'PUNISHED']));
          await this.setData(dataKey, storedData);
          await this.logActivity({
            actor: 'SYSTEM-PUNISHMENT',
            targetUser: username,
            actionType: 'SECURITY',
            description: `PERMANENT BAN ENFORCED: ${reason}`,
            metadata: context
          });
      }
  },

  async recordFailedLogin(username: string): Promise<number> {
      const key = `penalty_count_${username}`;
      const count = parseInt(localStorage.getItem(key) || '0') + 1;
      localStorage.setItem(key, count.toString());
      if (count >= 3) {
          await this.enforceSecurityLockdown(username, "Brute force attempt detected. Excessive login failures.", "Attempt recorded at " + new Date().toISOString());
      }
      return count;
  }
};