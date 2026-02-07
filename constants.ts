
import { UserProfile, View } from './types';

export const APP_NAME = "StudentPocket – By Sushil";
export const APP_TAGLINE = "Supreme Guardian Protocol";
export const CREATOR_NAME = "Sushil Pokharel";
export const APP_VERSION = "v16.4.0 Supreme Guardian";
export const BUILD_DATE = "2024 - 2026 Admin Cycle";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 StudentPocket. All Rights Reserved.";
export const LEGAL_TERMS = "Institutional Data Protocol Active. Privacy Secured via Sushil Pokharel's Platinum Mesh.";
export const FOOTER_SIGNATURE = "System Architecture by Sushil Pokharel";

export const WATERMARK = "STP-PLATINUM-SUSHIL-2026";
export const ADMIN_USERNAME = "Sushil_Admin";
export const ADMIN_SECRET = "admin123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "sushilpokharel.com.np";
export const SYSTEM_UPGRADE_TOKEN = "SP-GUARDIAN-V16.4";

export const PROHIBITED_TERMS = [
    "hate", "kill", "die", "attack", "bomb", "stupid", "idiot", 
    "violence", "blood", "death", "hack", "crack", "destroy", 
    "bad", "evil", "enemy", "suicide", "terror", "cheat", "abuse"
];

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
  maxViolations: 1 // Now set to 1 for immediate termination on bad word detection
};

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
