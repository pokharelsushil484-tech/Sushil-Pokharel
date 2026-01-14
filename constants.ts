
import { UserProfile } from './types';

export const APP_VERSION = "26.5.0-SUSHIL"; 
export const CREATOR_NAME = "Sushil Pokharel";
export const APP_NAME = "StudentPocket – By Sushil";
export const STUDENT_IDENTITY = "Sushil Pokharel - Student";

export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const ADMIN_PHONE = "9765226385";
export const COPYRIGHT_NOTICE = "© 2026 SUSHIL POKHAREL. ALL RIGHTS RESERVED.";
export const PRECISION_WATERMARK = "Built with Precision by Sushil Pokharel";

export const WATERMARK = PRECISION_WATERMARK;
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SECURE-NODE-UPGRADE-2026";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "support@sushilpokharel00.com.np",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 3,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 10,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Market Research", "Innovation", "Business Management"],
  interests: ["AI Integration", "Computer Systems", "BBS Strategy"],
  authorizedDevices: ["Main Terminal"]
};
