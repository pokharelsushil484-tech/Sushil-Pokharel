import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Elite Academic Management System";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "9.2.0 Enterprise Build";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Systems. All Rights Reserved.";
export const LEGAL_TERMS = "Institutional Access Only: This platform is designed for professional academic organization. Data encryption is active. Unauthorized distribution of stored materials is strictly prohibited under the 2026 Privacy Act.";
export const FOOTER_SIGNATURE = "Developed and Maintained by Sushil Pokhrel";

export const WATERMARK = "STUDENTPOCKET • SUSHIL POKHREL • 2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.app";
export const MIN_PASSWORD_LENGTH = 8;
export const SYSTEM_DOMAIN = "studentpocket.app";
export const SYSTEM_UPGRADE_TOKEN = "SP-QUANTUM-2026";

export const FOOTER_LINKS = {
  internal: [
    { label: "Executive Dashboard", view: "DASHBOARD" },
    { label: "Secure Data Vault", view: "FILE_HUB" },
    { label: "Strategic Planner", view: "VERIFY_LINK" },
    { label: "Protocol Support", view: "SUPPORT" }
  ],
  academic: [
    { label: "Global Research Library", href: "#" },
    { label: "Registrar Command", href: "#" },
    { label: "Grant & Scholarship Portal", href: "#" },
    { label: "E-Learning Infrastructure", href: "#" }
  ]
};

export const DEFAULT_USER: UserProfile = {
  name: "Sushil Pokhrel",
  email: "sushil@studentpocket.app",
  phone: "+977 9800000000",
  isVerified: true,
  isSuspicious: false,
  level: 3,
  verificationStatus: 'VERIFIED',
  storageLimitGB: 50,
  storageUsedBytes: 0,
  totpEnabled: true,
  skills: ["System Architecture", "Academic Strategy", "Data Management"],
  interests: ["Institutional Growth", "Machine Learning"],
  authorizedDevices: ["Master Hub Terminal"]
};