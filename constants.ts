import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Platinum Institutional Management Suite";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v9.3.0 Platinum Build [STABLE]";
export const BUILD_DATE = "2024 - 2026 Enterprise Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Systems. Engineered for Academic Excellence.";
export const LEGAL_TERMS = "Secure Institutional Link Active. Protocol STP-2026-X encryption enforced for all data nodes.";
export const FOOTER_SIGNATURE = "Executive System Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-PLATINUM-SUSHIL-2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.app";
export const SYSTEM_DOMAIN = "studentpocket.app";
export const SYSTEM_UPGRADE_TOKEN = "SP-PLATINUM-2026";

export const FOOTER_LINKS = {
  internal: [
    { label: "Executive Terminal", view: "DASHBOARD" },
    { label: "Data Matrix Hub", view: "FILE_HUB" },
    { label: "Academic Roadmap", view: "VERIFY_LINK" },
    { label: "System Config", view: "SETTINGS" }
  ],
  academic: [
    { label: "Institutional Archive", href: "#" },
    { label: "Global Registrar", href: "#" },
    { label: "Research Node", href: "#" }
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
  skills: ["Executive Leadership", "Strategic Management"],
  interests: ["Data Sovereignty", "Institutional Growth"],
  authorizedDevices: ["Platinum Node 01"]
};