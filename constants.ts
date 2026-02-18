
import { UserProfile, View } from './types';

export const APP_NAME = "STUDENTPOCKET – BY SUSHIL";
export const APP_TAGLINE = "V20 PLATINUM ULTRA EXECUTIVE";
export const CREATOR_NAME = "SUSHIL POKHAREL";
export const APP_VERSION = "V20.0.0 PLATINUM ULTRA (BUILD 2024.Q4)";
export const BUILD_DATE = "OCTOBER 2024 - 2027 ULTRA CYCLE";

export const COPYRIGHT_NOTICE = "© 2024 - 2027 STUDENTPOCKET. ALL RIGHTS RESERVED.";
export const LEGAL_TERMS = "INSTITUTIONAL DATA PROTOCOL V20 ACTIVE. ACCESS SECURED VIA ULTRA MESH ENCRYPTION.";
export const FOOTER_SIGNATURE = "SYSTEM ARCHITECTURE BY SUSHIL POKHAREL";

export const WATERMARK = "STP-ULTRA-V20-SUSHIL-2024";
export const ADMIN_USERNAME = "SUSHIL_ADMIN";
export const ADMIN_SECRET = "ADMIN123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "SUSHILPOKHAREL00.COM.NP";
export const SYSTEM_UPGRADE_TOKEN = "SP-ULTRA-V20.0.0";

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
  storageLimitGB: 250,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["EXECUTIVE ENTRY"],
  interests: ["ULTRA DATA SYNC"],
  authorizedDevices: ["MASTER ULTRA NODE"],
  violationCount: 0,
  maxViolations: 1,
  integrityScore: 100,
  sanctions: []
};

export const FOOTER_LINKS = {
  internal: [
    { label: 'ULTRA CONTROL', view: View.DASHBOARD },
    { label: 'STRATEGIC MAP', view: View.VERIFY_LINK },
    { label: 'DATA FORTRESS', view: View.FILE_HUB },
    { label: 'SECURE RELAY', view: View.SUPPORT },
  ],
  academic: [
    { label: 'ELITE RESEARCH', href: 'https://scholar.google.com' },
    { label: 'ULTRA LIBRARY', href: '#' },
    { label: 'ACADEMIC ARCHIVE', href: '#' }
  ]
};
