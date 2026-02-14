
import { UserProfile, View } from './types';

export const APP_NAME = "STUDENTPOCKET – BY SUSHIL";
export const APP_TAGLINE = "PLATINUM SUPREME CORE PROTOCOL";
export const CREATOR_NAME = "SUSHIL POKHAREL";
export const APP_VERSION = "V18.0.0 PLATINUM SUPREME";
export const BUILD_DATE = "OCTOBER 2024 - 2026 CYCLE";

export const COPYRIGHT_NOTICE = "© 2024 - 2026 STUDENTPOCKET. ALL RIGHTS RESERVED.";
export const LEGAL_TERMS = "INSTITUTIONAL DATA PROTOCOL V18 ACTIVE. PRIVACY SECURED VIA PLATINUM SUPREME MESH INFRASTRUCTURE.";
export const FOOTER_SIGNATURE = "SYSTEM ARCHITECTURE BY SUSHIL POKHAREL";

export const WATERMARK = "STP-SUPREME-V18-SUSHIL";
export const ADMIN_USERNAME = "SUSHIL_ADMIN";
export const ADMIN_SECRET = "ADMIN123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "SUSHILPOKHAREL00.COM.NP";
export const SYSTEM_UPGRADE_TOKEN = "SP-SUPREME-V18.0.0";

export const PROHIBITED_TERMS = [
    "HATE", "KILL", "DIE", "ATTACK", "BOMB", "STUPID", "IDIOT", 
    "VIOLENCE", "BLOOD", "DEATH", "HACK", "CRACK", "DESTROY", 
    "BAD", "EVIL", "ENEMY", "SUICIDE", "TERROR", "CHEAT", "ABUSE",
    "SEX", "PORN", "FUCK", "SHIT", "ASS", "BASTARD"
];

export const DEFAULT_USER: UserProfile = {
  name: "PERSONNEL NODE",
  email: `USER@${SYSTEM_DOMAIN}`,
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
  skills: ["STANDARD ENTRY"],
  interests: ["DATA SYNC"],
  authorizedDevices: ["MASTER NODE"],
  violationCount: 0,
  maxViolations: 1,
  integrityScore: 100,
  sanctions: []
};

export const FOOTER_LINKS = {
  internal: [
    { label: 'CONTROL CENTER', view: View.DASHBOARD },
    { label: 'STRATEGIC MAP', view: View.VERIFY_LINK },
    { label: 'DATA FORTRESS', view: View.FILE_HUB },
    { label: 'COMMS RELAY', view: View.SUPPORT },
  ],
  academic: [
    { label: 'RESEARCH GATEWAY', href: 'https://scholar.google.com' },
    { label: 'INSTITUTIONAL LIBRARY', href: '#' },
    { label: 'ACADEMIC ARCHIVE', href: '#' }
  ]
};
