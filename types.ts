
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  NOTES = 'NOTES',
  VAULT = 'VAULT',
  CV_BUILDER = 'CV_BUILDER',
  SCHOLARSHIP = 'SCHOLARSHIP',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum ScholarshipStatus {
  PENDING = 'Pending',
  APPLIED = 'Applied',
  INTERVIEW = 'Interview',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  role?: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Award {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
}

export interface UserProfile {
  name: string;
  profession?: string; // New field for Professional Title
  email: string;
  phone: string;
  education: string;
  institution: string;
  country: string;
  avatar?: string;
  vaultPin?: string;
  studyPreference?: string;
  personalStatement?: string;
  skills: string[];
  badges?: string[]; // AI Generated Badges
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  interests: string[];
  // Gamification & Viral Features
  streak?: number;
  points?: number;
  rank?: number;
  isPro?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string
  priority: TaskPriority;
  completed: boolean;
  estimatedTime?: string;
  reminderMinutes?: number;
  assignedBy?: string; // 'admin' or 'user'
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  author?: string; // 'admin' or 'user'
  status?: 'PENDING' | 'COMPLETED'; // New Admin Review Status
  adminFeedback?: string;
  deletedAt?: number; // Timestamp for soft delete
}

export interface VaultDocument {
  id: string;
  title: string;
  type: 'ID' | 'CERTIFICATE' | 'MARKSHEET' | 'OTHER' | 'FOLDER';
  content?: string;
  parentId?: string | null;
  size?: number;
  createdAt?: number;
  mimeType?: string;
  deletedAt?: number; // Timestamp for soft delete
}

export interface Scholarship {
  id: string;
  name: string;
  deadline: string;
  requirements: string;
  status: ScholarshipStatus;
  link?: string;
}

export type RequestType = 'PROFILE_UPDATE' | 'PASSWORD_RESET' | 'VERIFICATION_REQUEST' | 'DELETE_ACCOUNT' | 'SUPPORT_TICKET';

export interface ChangeRequest {
  id: string;
  username: string;
  type: RequestType;
  payload?: any; 
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  likes: string[];
  comments: Comment[];
}
