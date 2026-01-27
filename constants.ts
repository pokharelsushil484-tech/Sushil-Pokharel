import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Elite Institutional Management Suite";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v9.2.6 Elite Build [STABLE]";
export const BUILD_DATE = "2024 - 2026 Academic Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Systems. Professional Enterprise Edition.";
export const LEGAL_TERMS = "Institutional Access Encrypted. All data nodes are synchronized under the 2026 Data Protection Protocol.";
export const FOOTER_SIGNATURE = "Architected & Managed by Sushil Pokhrel";

export const WATERMARK = "STP-SUSHIL-2026-X-ELITE";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.app";
export const SYSTEM_DOMAIN = "studentpocket.app";
export const SYSTEM_UPGRADE_TOKEN = "SP-ELITE-2026";

export const FOOTER_LINKS = {
  internal: [
    { label: "Executive Dashboard", view: "DASHBOARD" },
    { label: "Quantum Vault", view: "FILE_HUB" },
    { label: "Strategic Planner", view: "VERIFY_LINK" },
    { label: "System Settings", view: "SETTINGS" }
  ],
  academic: [
    { label: "Global Archive", href: "#" },
    { label: "Registrar Hub", href: "#" },
    { label: "Scholarship Node", href: "#" }
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
  storageLimitGB: 100,
  storageUsedBytes: 0,
  totpEnabled: true,
  skills: ["Systems Architecture", "Academic Strategy"],
  interests: ["Data Integrity", "Future Technologies"],
  authorizedDevices: ["Master Hub 01"]
};