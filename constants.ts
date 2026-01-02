
import { UserProfile } from './types';

export const APP_VERSION = "25.2.0-ELITE (Infrastructure Tier)"; 
export const ADMIN_USERNAME = "admin"; 
export const ADMIN_SECRET = "Sushil@Architect2025"; 
export const CREATOR_NAME = "Sushil Pokharel";

const now = new Date();
export const SYSTEM_UPGRADE_TOKEN = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_STORAGE_LIMIT_GB = 10; 
export const MIN_PASSWORD_LENGTH = 16;

export const APP_NAME = "Infrastructure Terminal – By Sushil";
export const WATERMARK = "© Professional Infrastructure Hub | Authored by Sushil Pokharel";
export const ADMIN_EMAIL = "architect@workspace.local";
export const COPYRIGHT_NOTICE = "SECURE PROTOCOL: Developed by Sushil Pokharel. Legal Entity: Pokharel Infrastructure Partners.";

export const DEFAULT_USER: UserProfile = {
  name: "Guest Identity",
  email: "",
  phone: "",
  isVerified: false,
  verificationStatus: 'NONE',
  acceptedTermsVersion: SYSTEM_UPGRADE_TOKEN,
  storageLimitGB: DEFAULT_STORAGE_LIMIT_GB,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: [],
  interests: [],
  authorizedDevices: ["Remote Terminal Node"]
};
