
import { UserProfile } from './types';

export const APP_VERSION = "27.0.0-PRO"; 
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_NAME = "Sushil Pokhrel Portfolio";
export const STUDENT_IDENTITY = "Sushil Pokhrel - BBS Candidate";

export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const ADMIN_PHONE = "9765226385";
export const COPYRIGHT_NOTICE = "© 2026 SUSHIL POKHREL. ALL RIGHTS RESERVED.";
export const PRECISION_WATERMARK = "Built with Precision by Sushil Pokhrel";

export const WATERMARK = PRECISION_WATERMARK;
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SECURE-PRO-NODE-2026";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokhrel",
  email: "support@sushilpokharel00.com.np",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 3,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 10,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Strategic Management", "Financial Analysis", "Tech Integration"],
  interests: ["Artificial Intelligence", "Business Law", "Modern Computing"],
  authorizedDevices: ["Main Terminal"]
};
