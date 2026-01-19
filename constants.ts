
import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "The Professional Student Utility Suite";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "4.5.0 Premium";

export const COPYRIGHT_NOTICE = "© 2024 StudentPocket. All Rights Reserved.";
export const LEGAL_TERMS = "Terms and Conditions: This platform is provided for academic organizational purposes. Users agree to maintain data integrity and respect institutional privacy protocols.";
export const FOOTER_SIGNATURE = "Built by Sushil Pokhrel";

// Added missing system-wide constants required by various components
export const WATERMARK = "STUDENTPOCKET • SUSHIL";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "admin@studentpocket.io";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "studentpocket.io";
export const SYSTEM_UPGRADE_TOKEN = "SP-VER-2024-X";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "sushil@studentpocket.io",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 3,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 50,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Business Studies", "Strategic Planning"],
  interests: ["Technology", "Management"],
  authorizedDevices: ["Main Device"]
};
