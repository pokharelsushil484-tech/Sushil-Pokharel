import { UserProfile } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Platinum Institutional Management Suite";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v11.0.0 Admin Enterprise";
export const BUILD_DATE = "2024 - 2026 Admin Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Systems. Multi-Node Architecture Active.";
export const LEGAL_TERMS = "Privacy Secured. Data nodes are isolated and encrypted per session.";
export const FOOTER_SIGNATURE = "Executive System Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-PLATINUM-SUSHIL-2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SP-PLATINUM-2026";

export const VERIFIED_LABEL = "Institutional Clearance Active";
export const MAX_LOGIN_ATTEMPTS = 3;

// 10 PRE-SEEDED USERS FOR STORAGE
export const PRE_SEEDED_USERS = Array.from({ length: 10 }, (_, i) => ({
  username: `user${i + 1}`,
  password: `hash${i + 1}`,
  name: `Storage Node ${i + 1}`,
  email: `node${i + 1}@${SYSTEM_DOMAIN}`
}));

export const FOOTER_LINKS = {
  internal: [
    { label: "Executive Terminal", view: "DASHBOARD" },
    { label: "Data Matrix Hub", view: "FILE_HUB" },
    { label: "Admin Comms", view: "SUPPORT" },
    { label: "System Config", view: "SETTINGS" }
  ],
  academic: [
    { label: "Institutional Archive", href: `https://www.${SYSTEM_DOMAIN}/archive` },
    { label: "Global Registrar", href: `https://www.${SYSTEM_DOMAIN}/registrar` },
    { label: "Research Node", href: `https://www.${SYSTEM_DOMAIN}/research` }
  ]
};

export const DEFAULT_USER: UserProfile = {
  name: "New Personnel",
  email: `user@${SYSTEM_DOMAIN}`,
  phone: "+977 0000000000",
  isVerified: false,
  isSuspicious: false,
  level: 0,
  verificationStatus: 'NONE',
  storageLimitGB: 100,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Institutional Access"],
  interests: ["Data Management"],
  authorizedDevices: ["Remote Node"],
  violationCount: 0,
  maxViolations: 3
};