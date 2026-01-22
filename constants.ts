import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Simplified Academic Management";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "8.0.1 Stable Release";

export const COPYRIGHT_NOTICE = "© 2024 StudentPocket. All Rights Reserved.";
export const LEGAL_TERMS = "Terms and Conditions: This platform is designed for professional academic organization. Please use resources ethically for study purposes. Unauthorized distribution of stored academic materials is prohibited.";
export const FOOTER_SIGNATURE = "Developed by Sushil Pokhrel";

export const WATERMARK = "STUDENTPOCKET • SUSHIL";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.app";
export const MIN_PASSWORD_LENGTH = 6;
export const SYSTEM_DOMAIN = "studentpocket.app";
export const SYSTEM_UPGRADE_TOKEN = "SP-STABLE-2024";

export const FOOTER_LINKS = {
  internal: [
    { label: "Academic Dashboard", view: "DASHBOARD" },
    { label: "Secure Vault Storage", view: "FILE_HUB" },
    { label: "Study Planner", view: "VERIFY_LINK" },
    { label: "Help & Support", view: "SUPPORT" }
  ],
  academic: [
    { label: "University Library", href: "#" },
    { label: "Registrar Office", href: "#" },
    { label: "Scholarship Portal", href: "#" },
    { label: "E-Learning Hub", href: "#" }
  ]
};

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokharel",
  email: "sushil@studentpocket.app",
  phone: "9800000000",
  isVerified: true,
  isSuspicious: false,
  level: 1,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 10,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Time Management", "Organization", "Research"],
  interests: ["Business Studies", "Productivity"],
  authorizedDevices: ["Main Mobile Hub"]
};