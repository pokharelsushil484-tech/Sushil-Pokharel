
import { UserProfile } from './types';

export const APP_VERSION = "10.0.1 (Stable Core)"; 
export const ADMIN_USERNAME = "admin"; 
export const CREATOR_NAME = "Sushil";

const now = new Date();
export const CURRENT_TERMS_VERSION = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_STORAGE_LIMIT_GB = 10; // Generous 10GB default limit

export const DEFAULT_USER: UserProfile = {
  name: "New Student",
  profession: "Learner",
  education: "Primary Core",
  email: "",
  phone: "",
  personalStatement: "My personal digital workspace.",
  skills: ["Organization"],
  interests: ["Learning"],
  streak: 0,
  points: 0,
  isPro: true,
  verificationStatus: 'VERIFIED',
  acceptedTermsVersion: CURRENT_TERMS_VERSION,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  twoFactorEnabled: false,
  backupCodes: [],
  authorizedDevices: []
};

export const APP_NAME = "StudentPocket – By Sushil";
export const WATERMARK = "© StudentPocket | Created by Sushil";
export const ADMIN_EMAIL = "sushil@studentpocket.local";

export const COPYRIGHT_NOTICE = "PROPRIETARY SYSTEM: Created by Sushil. All data nodes are encrypted locally.";

export const MOTIVATIONAL_QUOTES = [
  "Knowledge is power.",
  "Sushil: Simplifying student life.",
  "Stay organized, stay ahead.",
  "Your digital life, in your pocket."
];
