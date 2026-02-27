
import { UserProfile, View, SubscriptionTier, UpgradeTask } from './types';

export const APP_NAME = "STUDENTPOCKET – BY SUSHIL";
export const APP_TAGLINE = "V2.0 QUANTUM ELITE II";
export const CREATOR_NAME = "SUSHIL POKHAREL";
export const APP_VERSION = "V2.1.0 QUANTUM ELITE II (FEB 2026)";
export const VERSION_BETA = "V2.1.0-BETA";
export const VERSION_PRO = "V2.1.0-PRO-FULL";
export const BUILD_DATE = "FEBRUARY 2026 - 2030 ELITE CYCLE";

export const COPYRIGHT_NOTICE = "© 2024 - 2030 STUDENTPOCKET. ALL RIGHTS RESERVED.";
export const LEGAL_TERMS = "INSTITUTIONAL QUANTUM PROTOCOL V23 ACTIVE. DEEP IDENTITY RESTORATION AUTHORIZED.";
export const FOOTER_SIGNATURE = "ELITE ARCHITECTURE BY SUSHIL POKHAREL";

export const WATERMARK = "STP-ELITE-V23-SUSHIL-2024";
export const ADMIN_USERNAME = "SUSHIL_ADMIN";
export const ADMIN_SECRET = "ADMIN123";
export const ADMIN_EMAIL = "pokharelsushil242@gmail.com";
export const ADMIN_PHONE = "9765226385";
export const SYSTEM_DOMAIN = "SUSHILPOKHAREL00.COM.NP";
export const SYSTEM_UPGRADE_TOKEN = "SP-ELITE-V23.0.0";

export const MAX_PROFESSIONAL_LEVEL = 100;
export const PROFESSIONAL_TIER = "QUANTUM ELITE";

export const PROHIBITED_TERMS = [
    "HATE", "KILL", "DIE", "ATTACK", "BOMB", "STUPID", "IDIOT", 
    "VIOLENCE", "BLOOD", "DEATH", "HACK", "CRACK", "DESTROY", 
    "BAD", "EVIL", "ENEMY", "SUICIDE", "TERROR", "CHEAT", "ABUSE",
    "SEX", "PORN", "FUCK", "SHIT", "ASS", "BASTARD"
];

export const INITIAL_UPGRADE_TASKS: UpgradeTask[] = [
  { id: 'TASK_MISSION', description: 'Complete 5 Strategic Missions', targetCount: 5, currentCount: 0, completed: false, type: 'MISSION' },
  { id: 'TASK_ATTENDANCE', description: 'Log 10 Attendance Records', targetCount: 10, currentCount: 0, completed: false, type: 'ATTENDANCE' },
  { id: 'TASK_JOURNAL', description: 'Add 5 Growth Journal Entries', targetCount: 5, currentCount: 0, completed: false, type: 'JOURNAL' },
  { id: 'TASK_LOGIN', description: 'Access Elite Hub 3 Times', targetCount: 3, currentCount: 0, completed: false, type: 'LOGIN' }
];

export const DEFAULT_USER: UserProfile = {
  name: "PERSONNEL NODE",
  email: `USER@${SYSTEM_DOMAIN}`,
  phone: "+977 0000000000",
  isVerified: false,
  emailVerified: false,
  twoFactorEnabled: true,
  privacyLevel: 'STANDARD',
  subscriptionTier: SubscriptionTier.LIGHT,
  upgradeTasks: INITIAL_UPGRADE_TASKS,
  isSuspicious: false,
  level: MAX_PROFESSIONAL_LEVEL,
  verificationStatus: 'NONE',
  storageLimitGB: 1500,
  storageUsedBytes: 0,
  totpEnabled: false,
  skills: ["QUANTUM ELITE ENTRY"],
  interests: ["NEURAL DATA SYNC"],
  authorizedDevices: ["MASTER ELITE NODE"],
  violationCount: 0,
  maxViolations: 1,
  integrityScore: 100,
  sanctions: []
};

export const FOOTER_LINKS = {
  internal: [
    { label: 'ELITE CONTROL', view: View.DASHBOARD },
    { label: 'SECURITY HUB', view: View.SECURITY_HEARTBEAT },
    { label: 'ULTRA VAULT', view: View.FILE_HUB },
    { label: 'RECOVERY PORTAL', view: View.ACCESS_RECOVERY },
  ],
  academic: [
    { label: 'ELITE RESEARCH', href: 'https://scholar.google.com' },
    { label: 'QUANTUM LIBRARY', href: '#' },
    { label: 'ACADEMIC REPOSITORY', href: '#' }
  ]
};
