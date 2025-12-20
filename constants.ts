
import { UserProfile } from './types';

export const APP_VERSION = "3.1.0"; 
export const ADMIN_USERNAME = "admin"; 

// Generates a monthly version string like "2023-10"
const now = new Date();
export const CURRENT_TERMS_VERSION = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export const DEFAULT_USER: UserProfile = {
  name: "User",
  profession: "Personal Explorer",
  email: "user@example.com",
  phone: "",
  personalStatement: "Navigating daily life with 3D AI.",
  skills: ["Planning", "Organization"],
  interests: ["Technology", "Health"],
  streak: 0,
  points: 0,
  isPro: true,
  acceptedTermsVersion: ""
};

export const APP_NAME = "StudentPocket – By Sushil";
export const WATERMARK = "StudentPocket – By Sushil • 3D AI Edition";
export const ADMIN_EMAIL = "support@sushil.admin";

export const MOTIVATIONAL_QUOTES = [
  "Master your day, master your life.",
  "Depth in design, depth in action.",
  "Your daily moves define your future.",
  "Efficiency is elegance."
];
