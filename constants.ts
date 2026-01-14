
import { UserProfile } from './types';

export const APP_VERSION = "26.3.0-PORTFOLIO"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const APP_NAME = "Sushil Pokharel | Portfolio";
export const STUDENT_IDENTITY = "Sushil Pokharel - Student";

export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const ADMIN_PHONE = "9765226385";
export const COPYRIGHT_NOTICE = "© 2026 SUSHIL POKHAREL. ALL RIGHTS RESERVED.";
export const PRECISION_WATERMARK = "Built with Precision by Sushil Pokharel";

/**
 * Administrative and System Constants
 */
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "9765226385"; 
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_UPGRADE_TOKEN = "v26.3.0-UPGRADE";
export const WATERMARK = PRECISION_WATERMARK;

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "support@sushilpokharel00.com.np",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 2,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 10,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Market Research", "AI Strategy", "Business Analytics"],
  interests: ["Artificial Intelligence", "IT Integration", "Computer Hardware Updates"],
  authorizedDevices: ["Main Terminal"]
};
