
import { UserProfile } from './types';

export const APP_VERSION = "2.0.0-UHD"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const APP_NAME = "8K Video Downloaders";
export const APP_TAGLINE = "Ultra High-Definition Social Media Media Extraction Hub";

export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const COPYRIGHT_NOTICE = "© 2026 8K VIDEO DOWNLOADERS BY SUSHIL POKHREL. ALL RIGHTS RESERVED.";
export const PRECISION_WATERMARK = "Engineered & Built by Sushil Pokharel";
export const WATERMARK = PRECISION_WATERMARK;

export const SYSTEM_DOMAIN = "8kdownloaders.com.np";

// Missing constants added for system security and administrative functions
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_UPGRADE_TOKEN = "v2.0.0-PRO-NODE";

export const DEFAULT_USER: UserProfile = {
  name: "Guest User",
  email: "guest@8kdownloaders.com.np",
  phone: "",
  isVerified: true,
  isSuspicious: false,
  level: 1,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 50,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: [],
  interests: [],
  authorizedDevices: ["PRO-Node"]
};