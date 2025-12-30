
import { UserProfile } from './types';

export const APP_VERSION = "11.0.1 (System Core)"; 
export const ADMIN_USERNAME = "admin"; 
export const CREATOR_NAME = "Sushil";

const now = new Date();
export const CURRENT_TERMS_VERSION = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
export const CURRENT_MONTH_KEY = `${now.getFullYear()}-${now.getMonth()}`;

export const DEFAULT_STORAGE_LIMIT_GB = 15; 

export const DEFAULT_USER: UserProfile = {
  name: "User Node",
  profession: "System Architect",
  education: "Master Core",
  email: "",
  phone: "",
  personalStatement: "Personal Digital Workspace.",
  skills: ["Digital Sovereignty"],
  interests: ["Data Architecture"],
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

export const APP_NAME = "Sushil’s Workspace";
export const WATERMARK = "© Workspace | Created by Sushil";
export const ADMIN_EMAIL = "sushil@workspace.local";

export const COPYRIGHT_NOTICE = "PROPRIETARY SYSTEM: Created by Sushil. All nodes encrypted.";

export const MOTIVATIONAL_QUOTES = [
  "Privacy is a right.",
  "Sushil: Architecting your digital life.",
  "Data sovereignty starts here.",
  "Encrypted. Secure. Yours."
];
