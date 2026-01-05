
import { UserProfile } from './types';

export const APP_VERSION = "25.4.1-SECURE"; 
export const ADMIN_USERNAME = "admin"; 
export const ADMIN_SECRET = "a"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";

const now = new Date();
export const SYSTEM_UPGRADE_TOKEN = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_STORAGE_LIMIT_GB = 10; 
export const MIN_PASSWORD_LENGTH = 8; // Adjusted for usability while maintaining logic

export const APP_NAME = "StudentPocket";
export const WATERMARK = "© StudentPocket Hub | Authored by Sushil Pokharel";
export const ADMIN_EMAIL = "admin@sushilpokharel00.com.np";
export const COPYRIGHT_NOTICE = "SECURE PROTOCOL: Developed by Sushil Pokharel. Legal Entity: Sushil Tech.";

export const DEFAULT_USER: UserProfile = {
  name: "Office Node",
  email: "",
  phone: "",
  isVerified: false,
  level: 0,
  verificationStatus: 'NONE',
  acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: [],
  interests: [],
  authorizedDevices: ["Main Terminal"]
};
