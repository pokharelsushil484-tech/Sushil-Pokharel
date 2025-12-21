
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  EXPENSES = 'EXPENSES',
  DATABASE_MANAGER = 'DATABASE_MANAGER',
  NOTES = 'NOTES',
  VAULT = 'VAULT'
}

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date'
}

// Added TaskPriority enum
export enum TaskPriority {
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface DbField {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface Database {
  id: string;
  name: string;
  description: string;
  schema: DbField[];
  records: any[];
  createdAt: number;
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
  isPro?: boolean; 
  verificationStatus?: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  acceptedTermsVersion?: string;
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

// Added Assignment interface
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
