
import { UserProfile, View } from './types';

export const APP_NAME = "STUDENTPOCKET – BY SUSHIL";
export const APP_TAGLINE = "V21 PLATINUM ULTRA EXECUTIVE PLUS";
export const CREATOR_NAME = "SUSHIL POKHAREL";
export const APP_VERSION = "V21.0.0 PLATINUM ULTRA PLUS (RELEASE OCT 2024)";
export const BUILD_DATE = "OCTOBER 2024 - 2028 SUPREME CYCLE";

export const COPYRIGHT_NOTICE = "© 2024 - 2028 STUDENTPOCKET. ALL RIGHTS RESERVED.";
export const LEGAL_TERMS = "INSTITUTIONAL DATA PROTOCOL V21 ACTIVE. MAXIMUM PROFESSIONAL CLEARANCE ENABLED.";
export const FOOTER_SIGNATURE = "SYSTEM ARCHITECTURE BY SUSHIL POKHAREL";

export const WATERMARK = "STP-ULTRA-V21-SUSHIL-2024";
export const ADMIN_USERNAME = "SUSHIL_ADMIN";
export const ADMIN_SECRET = "ADMIN123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "SUSHILPOKHAREL00.COM.NP";
export const SYSTEM_UPGRADE_TOKEN = "SP-ULTRA-V21.0.0-PLUS";

// Maximum Professional Level Constant
export const MAX_PROFESSIONAL_LEVEL = 100;
export const PROFESSIONAL_TIER = "EXECUTIVE PLUS";

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
  level: MAX_PROFESSIONAL_LEVEL, // Set to Maximum Professional Level
  verificationStatus: 'NONE',
  storageLimitGB: 500,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["ULTRA EXECUTIVE ENTRY"],
  interests: ["QUANTUM DATA SYNC"],
  authorizedDevices: ["MASTER ULTRA NODE V21"],
  violationCount: 0,
  maxViolations: 1,
  integrityScore: 100,
  sanctions: []
};

export const FOOTER_LINKS = {
  internal: [
    { label: 'ULTRA COMMAND', view: View.DASHBOARD },
    { label: 'STRATEGIC GRID', view: View.VERIFY_LINK },
    { label: 'DATA FORTRESS V21', view: View.FILE_HUB },
    { label: 'SECURE COMMMS', view: View.SUPPORT },
  ],
  academic: [
    { label: 'QUANTUM RESEARCH', href: 'https://scholar.google.com' },
    { label: 'ULTRA ARCHIVE', href: '#' },
    { label: 'ACADEMIC REPOSITORY', href: '#' }
  ]
};
