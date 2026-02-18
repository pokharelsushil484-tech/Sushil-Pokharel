
import { UserProfile, View } from './types';

export const APP_NAME = "STUDENTPOCKET – BY SUSHIL";
export const APP_TAGLINE = "V22 PLATINUM QUANTUM EXECUTIVE";
export const CREATOR_NAME = "SUSHIL POKHAREL";
export const APP_VERSION = "V22.0.0 PLATINUM QUANTUM (OCT 2024)";
export const BUILD_DATE = "OCTOBER 2024 - 2029 QUANTUM CYCLE";

export const COPYRIGHT_NOTICE = "© 2024 - 2029 STUDENTPOCKET. ALL RIGHTS RESERVED.";
export const LEGAL_TERMS = "INSTITUTIONAL QUANTUM PROTOCOL V22 ACTIVE. MAXIMUM PROFESSIONAL CLEARANCE AUTHORIZED.";
export const FOOTER_SIGNATURE = "QUANTUM SYSTEMS BY SUSHIL POKHAREL";

export const WATERMARK = "STP-QUANTUM-V22-SUSHIL-2024";
export const ADMIN_USERNAME = "SUSHIL_ADMIN";
export const ADMIN_SECRET = "ADMIN123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "SUSHILPOKHAREL00.COM.NP";
export const SYSTEM_UPGRADE_TOKEN = "SP-QUANTUM-V22.0.0";

export const MAX_PROFESSIONAL_LEVEL = 100;
export const PROFESSIONAL_TIER = "QUANTUM MASTER";

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
  level: MAX_PROFESSIONAL_LEVEL,
  verificationStatus: 'NONE',
  storageLimitGB: 1000,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["QUANTUM EXECUTIVE ENTRY"],
  interests: ["DEEP MESH SYNC"],
  authorizedDevices: ["MASTER QUANTUM NODE"],
  violationCount: 0,
  maxViolations: 1,
  integrityScore: 100,
  sanctions: []
};

export const FOOTER_LINKS = {
  internal: [
    { label: 'QUANTUM CONTROL', view: View.DASHBOARD },
    { label: 'SECURITY HUB', view: View.SECURITY_HEARTBEAT },
    { label: 'ULTRA VAULT', view: View.FILE_HUB },
    { label: 'SECURE COMMMS', view: View.SUPPORT },
  ],
  academic: [
    { label: 'ELITE RESEARCH', href: 'https://scholar.google.com' },
    { label: 'QUANTUM LIBRARY', href: '#' },
    { label: 'ACADEMIC REPOSITORY', href: '#' }
  ]
};
