
import { UserProfile } from './types';

export const APP_VERSION = "15.2.0 (Architect Core)"; 
export const ADMIN_USERNAME = "admin"; 
export const ADMIN_SECRET = "Sushil@2025"; 
export const CREATOR_NAME = "Sushil Pokharel";

const now = new Date();
export const SYSTEM_UPGRADE_TOKEN = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_STORAGE_LIMIT_GB = 15; 

export const APP_NAME = "StudentPocket – By Sushil";
export const WATERMARK = "© Infrastructure Hub | Authored by Sushil Pokharel";
export const ADMIN_EMAIL = "sushil@workspace.local";
export const COPYRIGHT_NOTICE = "SECURE PROTOCOL: Developed by Sushil Pokharel. All nodes encrypted.";

export const DEFAULT_USER: UserProfile = {
  name: "New Student",
  profession: "Student Node",
  education: "Academic Segment",
  email: "",
  phone: "",
  personalStatement: "Student workspace under Sushil's infrastructure.",
  skills: [],
  interests: [],
  streak: 0,
  points: 0,
  isPro: false,
  verificationStatus: 'NONE',
  acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  twoFactorEnabled: false,
  backupCodes: [],
  authorizedDevices: []
};
