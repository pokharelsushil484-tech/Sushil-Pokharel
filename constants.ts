import { UserProfile } from './types';

export const APP_NAME = "StudentPocket";
export const APP_TAGLINE = "Institutional Management Node";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v13.0.0 Platinum Build";
export const BUILD_DATE = "2024 - 2026 Management Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket Infrastructure. All Rights Reserved.";
export const LEGAL_TERMS = "Institutional Data Protocol Active. Zero-Exposure Residency strictly enforced.";
export const FOOTER_SIGNATURE = "Executive System Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-PRO-SUSHIL-2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "support@sushilpokharel00.com.np";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SP-PLATINUM-V13";

export const VERIFIED_LABEL = "Institutional Clearance Active";
export const MAX_LOGIN_ATTEMPTS = 3;

export const FOOTER_LINKS = {
  internal: [
    { label: "Command Center", view: "DASHBOARD" },
    { label: "Quantum Vault", view: "FILE_HUB" },
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
  storageLimitGB: 50,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["Institutional Access"],
  interests: ["Data Analytics"],
  authorizedDevices: ["Master Terminal"],
  violationCount: 0,
  maxViolations: 3
};