
import { UserProfile } from './types';

export const APP_VERSION = "26.1.0-PRO"; 
export const ADMIN_USERNAME = "admin"; 
export const ADMIN_SECRET = "Sushil@Architect2026"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";

const now = new Date();
export const SYSTEM_UPGRADE_TOKEN = `2026-01`;

export const DEFAULT_STORAGE_LIMIT_GB = 10; 
export const MIN_PASSWORD_LENGTH = 8; 

export const APP_NAME = "StudentPocket – By Sushil";
export const WATERMARK = "© StudentPocket | Authored by Sushil Pokharel";
export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const ADMIN_PHONE = "9765226385";
export const ADMIN_EDUCATION = "Bachelor of Business Studies (BBS)";
export const COPYRIGHT_NOTICE = "SECURE PROTOCOL: Developed by Sushil Pokharel. Year: 2026.";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "support@sushilpokharel00.com.np",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 2,
  verificationStatus: 'VERIFIED',
  acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Market Research", "AI Strategy", "Business Analytics"],
  interests: ["Artificial Intelligence", "IT Integration", "Computer Hardware Updates"],
  authorizedDevices: ["Main Terminal"]
};
