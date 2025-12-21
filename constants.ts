
import { UserProfile } from './types';

export const APP_VERSION = "7.0.0 (Core)"; 
export const ADMIN_USERNAME = "admin"; 
export const CREATOR_NAME = "Susil Pokharel";

const now = new Date();
export const CURRENT_TERMS_VERSION = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_USER: UserProfile = {
  name: "System Specialist",
  profession: "Database Architect",
  education: "Managed Profile",
  email: "specialist@susil.pro",
  phone: "",
  personalStatement: "Managing synchronized database architectures.",
  skills: ["Data Logic", "System Design"],
  interests: ["Automation", "Security"],
  streak: 0,
  points: 0,
  isPro: false,
  verificationStatus: 'NONE',
  acceptedTermsVersion: ""
};

export const APP_NAME = "Database Manager by Susil Pokharel";
export const WATERMARK = "© Database Manager | Designed & Developed by Susil Pokharel";
export const ADMIN_EMAIL = "admin@susilpokharel.com";

export const COPYRIGHT_NOTICE = "PROPRIETARY NOTICE: This software and its architecture are the exclusive property of Susil Pokharel. Unauthorized reproduction, hosting, or distribution is strictly prohibited and protected by copyright law.";

export const MOTIVATIONAL_QUOTES = [
  "Precision in data, power in decisions.",
  "Susil Pokharel: Engineering the future of data.",
  "Built for scale, designed for simplicity.",
  "System synchronized. Data secured."
];
