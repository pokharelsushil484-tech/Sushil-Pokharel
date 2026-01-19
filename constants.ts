
import { UserProfile } from './types';

export const APP_VERSION = "3.0.0-PRO"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const APP_NAME = "8K Video Downloaders";
export const APP_TAGLINE = "High-Performance Multi-Quality Video Extraction";

export const COPYRIGHT_NOTICE = "© 2026 8K VIDEO DOWNLOADERS BY SUSHIL POKHREL.";
export const PRECISION_WATERMARK = "Designed & Engineered by Sushil Pokharel";
export const WATERMARK = PRECISION_WATERMARK;

// Added missing administrative and security constants
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "admin@sushilpokharel.com.np";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "sushilpokharel.com.np";
export const SYSTEM_UPGRADE_TOKEN = "V3-UPGRADE-2026";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "admin@sushilpokharel.com.np",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 3,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 100,
  storageUsedBytes: 0,
  totpEnabled: true,
  skills: ["Innovation", "UHD Extraction"],
  interests: ["8K Technology"],
  authorizedDevices: ["Main Server"]
};
