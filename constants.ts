import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Your Personal Academic Companion";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "6.0.0 Stable Update";

export const COPYRIGHT_NOTICE = "© 2024 StudentPocket. All Rights Reserved.";
export const LEGAL_TERMS = "Terms and Conditions: This platform is for personal study organization. Please use it responsibly for your academic and personal development.";
export const FOOTER_SIGNATURE = "Created by Sushil Pokhrel";

export const WATERMARK = "STUDENTPOCKET • SUSHIL";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.io";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "studentpocket.io";
export const SYSTEM_UPGRADE_TOKEN = "SP-STU-2024-V3";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "sushil@studentpocket.io",
  phone: "9765226385",
  isVerified: true,
  isSuspicious: false,
  level: 1,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 15,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Organization", "Strategy", "Note Taking"],
  interests: ["Learning", "Growth", "Productivity"],
  authorizedDevices: ["Main Device"]
};