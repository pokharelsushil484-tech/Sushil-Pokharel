import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Institutional Academic Management Suite";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v9.2.5 Institutional Build [LATEST]";
export const BUILD_DATE = "2024 - 2026 Release Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Systems. Optimized for Professional Use.";
export const LEGAL_TERMS = "Authorized Personnel Only. System activity is logged and encrypted under the 2026 Global Academic Data Act.";
export const FOOTER_SIGNATURE = "Design & Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-SUSHIL-2026-X";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@studentpocket.app";
export const SYSTEM_DOMAIN = "studentpocket.app";
export const SYSTEM_UPGRADE_TOKEN = "SP-INSTITUTIONAL-2026";

export const FOOTER_LINKS = {
  internal: [
    { label: "Master Dashboard", view: "DASHBOARD" },
    { label: "Data Vault", view: "FILE_HUB" },
    { label: "Academic Roadmap", view: "VERIFY_LINK" },
    { label: "Admin Console", view: "SUPPORT" }
  ],
  academic: [
    { label: "Research Archive", href: "#" },
    { label: "Global Registrar", href: "#" },
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
  skills: ["Executive Strategy", "Systems Management"],
  interests: ["Data Security", "Global Education"],
  authorizedDevices: ["Master Node Alpha"]
};