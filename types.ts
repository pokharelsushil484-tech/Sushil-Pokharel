
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  NOTES = 'NOTES',
  VAULT = 'VAULT',
  CV_BUILDER = 'CV_BUILDER',
  SCHOLARSHIP = 'SCHOLARSHIP',
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

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  education: string;
  institution: string;
  country: string;
  avatar?: string;
  vaultPin?: string;
  studyPreference?: string;
  skills: string[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string
  priority: TaskPriority;
  completed: boolean;
  estimatedTime?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML or Rich text
  date: string;
  tags: string[];
}

export interface VaultDocument {
  id: string;
  title: string;
  type: 'ID' | 'CERTIFICATE' | 'MARKSHEET' | 'OTHER';
  content?: string; // Base64 or Description
}

export interface Scholarship {
  id: string;
  name: string;
  deadline: string;
  requirements: string;
  status: ScholarshipStatus;
  link?: string;
}

export type RequestType = 'PROFILE_UPDATE' | 'PASSWORD_RESET' | 'VERIFICATION_CODE' | 'DELETE_ACCOUNT';

export interface ChangeRequest {
  id: string;
  username: string;
  type: RequestType;
  payload?: any; // For profile updates, contains the new profile data
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}