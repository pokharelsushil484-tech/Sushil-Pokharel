
import { UserProfile } from './types';

export const APP_VERSION = "2.0.0"; // Increment to force reset
export const ADMIN_USERNAME = "admin"; // Simplified for generic use

export const DEFAULT_USER: UserProfile = {
  name: "Student",
  profession: "Lifelong Learner",
  email: "student@example.com",
  phone: "",
  education: "University",
  institution: "Campus",
  country: "Global",
  studyPreference: "Flexible",
  personalStatement: "Focused on personal growth and academic excellence.",
  skills: ["Time Management", "Planning"],
  experience: [],
  projects: [],
  certifications: [],
  awards: [],
  languages: [{ id: '1', language: 'English', proficiency: 'Fluent' }],
  interests: ["Technology", "Productivity"],
  streak: 0,
  points: 0,
  rank: 0,
  isPro: true
};

export const APP_NAME = "StudentPocket";
export const WATERMARK = "StudentPocket v2.0 • Personal Edition";
export const ADMIN_EMAIL = "support@studentpocket.app";

export const MOTIVATIONAL_QUOTES = [
  "The best way to predict the future is to create it.",
  "Small daily improvements are the key to staggering long-term results.",
  "Focus on being productive instead of busy.",
  "Discipline is choosing between what you want now and what you want most."
];
