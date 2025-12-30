
import { UserProfile } from './types';

export const APP_VERSION = "14.0.1 (Quantum Core)"; 
export const ADMIN_USERNAME = "admin"; 
export const ADMIN_SECRET = "Sushil@2025"; // Primary Admin Credential
export const CREATOR_NAME = "Sushil Pokharel";

const now = new Date();
export const SYSTEM_UPGRADE_TOKEN = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_STORAGE_LIMIT_GB = 15; 

export const APP_NAME = "Sushil’s Workspace";
export const WATERMARK = "© Workspace Hub | Authored by Sushil Pokharel";
export const ADMIN_EMAIL = "sushil@workspace.local";
export const COPYRIGHT_NOTICE = "SECURE PROTOCOL: Developed by Sushil Pokharel. All nodes encrypted.";

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  profession: "Lead Architect",
  education: "System Master",
  email: "sushil@workspace.local",
  phone: "+977-9800000000",
  personalStatement: "Administrator of the Digital Sovereignty Hub.",
  skills: ["Quantum Encryption", "Cloud Architecture", "Identity Management"],
  interests: ["Cyber Security", "AI Integration"],
  streak: 7,
  points: 1250,
  isPro: true,
  verificationStatus: 'VERIFIED',
  acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  twoFactorEnabled: false,
  backupCodes: [],
  authorizedDevices: ['PRIMARY_WORKSTATION']
};

export const MOTIVATIONAL_QUOTES = [
  "Privacy is not a feature, it's a foundation.",
  "Sushil: Architecting your digital future.",
  "Secure Node Alpha: Status Online.",
  "15GB Personal Cloud: Synchronized."
];
