
// Fix: Import View enum to support FOOTER_LINKS definition
import { UserProfile, View } from './types';

export const APP_NAME = "StudentPocket";
export const APP_TAGLINE = "Titanium Privacy Infrastructure";
export const CREATOR_NAME = "Sushil Pokhrel";
export const APP_VERSION = "v16.2.0 Secure Pulse";
export const BUILD_DATE = "Daily Update: October 2024 Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket. All Rights Reserved.";
export const LEGAL_TERMS = "Institutional Data Protocol Active. Privacy Secured via Titanium Mesh.";
export const FOOTER_SIGNATURE = "System Architecture by Sushil Pokhrel";

export const WATERMARK = "STP-TITANIUM-SUSHIL-2026";
export const ADMIN_USERNAME = "admin";
export const ADMIN_SECRET = "admin123";
// Authorized Administrative Recipient
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const SYSTEM_DOMAIN = "sushilpokharel00.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SP-TITANIUM-V16.2";

export const FOOTER_LINKS = {
  internal: [
    { label: 'CONTROL CENTER', view: View.DASHBOARD },
    { label: 'STRATEGIC MAP', view: View.VERIFY_LINK },
    { label: 'DATA FORTRESS', view: View.FILE_HUB },
    { label: 'COMMS RELAY', view: View.SUPPORT },
  ],
  academic: [
    { label: 'Research Gateway', href: 'https://scholar.google.com' },
    { label: 'Institutional Library', href: '#' },
    { label: 'Academic Archive', href: '#' }
  ]
};

export const DEFAULT_USER: UserProfile = {
  name: "Personnel Node",
  email: `user@${SYSTEM_DOMAIN}`,
  phone: "+977 0000000000",
  isVerified: false,
  emailVerified: false,
  twoFactorEnabled: true,
  privacyLevel: 'STANDARD',
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
