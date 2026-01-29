import { UserProfile } from './types';

export const APP_NAME = "StudentPocket";
export const APP_TAGLINE = "Platinum Institutional Ecosystem";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v13.5.0 Platinum Unified";
export const BUILD_DATE = "2024 - 2026 Enterprise Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Infrastructure. All Rights Reserved.";
export const LEGAL_TERMS = "Institutional Data Protocol Active. Unauthorized access prohibited.";
export const FOOTER_SIGNATURE = "System Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-PRO-SUSHIL-2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SP-PLATINUM-V13.5";

// Added missing VERIFIED_LABEL to satisfy import in views/Dashboard.tsx
export const VERIFIED_LABEL = "VERIFIED_INSTITUTIONAL_NODE";

export const FOOTER_LINKS = {
  internal: [
    { label: "Executive Dashboard", view: "DASHBOARD" },
    { label: "Secure Vault", view: "FILE_HUB" },
    { label: "Admin Comms", view: "SUPPORT" },
    { label: "System Config", view: "SETTINGS" }
  ],
  academic: [
    { label: "Digital Archive", href: `https://www.${SYSTEM_DOMAIN}/archive` },
    { label: "Registrar Node", href: `https://www.${SYSTEM_DOMAIN}/registrar` },
    { label: "Legal Matrix", href: `https://www.${SYSTEM_DOMAIN}/legal` }
  ]
};

export const DEFAULT_USER: UserProfile = {
  name: "Personnel Node",
  email: `user@${SYSTEM_DOMAIN}`,
  phone: "+977 0000000000",
  isVerified: false,
  isSuspicious: false,
  level: 1,
  verificationStatus: 'NONE',
  storageLimitGB: 100,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Standard Entry"],
  interests: ["Data Sync"],
  authorizedDevices: ["Master Node"],
  violationCount: 0,
  maxViolations: 3
};