
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  EXPENSES = 'EXPENSES',
  PLANNER = 'PLANNER',
  NOTES = 'NOTES',
  VAULT = 'VAULT'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface UserProfile {
  name: string;
  profession?: string;
  education?: string;
  email: string;
  phone: string;
  avatar?: string;
  vaultPin?: string;
  personalStatement?: string;
  skills: string[];
  badges?: string[];
  interests: string[];
  streak?: number;
  points?: number;
  isPro?: boolean; // True if verified
  verificationStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  acceptedTermsVersion?: string;
}

export interface Assignment {
  id: string;
  title: string;
  category: string;
  subject: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  estimatedTime?: string;
  reminderMinutes?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  author?: string;
  status?: 'PENDING' | 'COMPLETED';
  deletedAt?: number;
}

export interface VaultDocument {
  id: string;
  title: string;
  type: 'FOLDER' | 'OTHER';
  content?: string;
  parentId: string | null;
  size?: number;
  mimeType?: string;
  createdAt: number;
  deletedAt?: number;
}

export type RequestType = 'PROFILE_UPDATE' | 'VERIFICATION_REQUEST' | 'SUPPORT_TICKET' | 'PASSWORD_RESET';

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

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}
