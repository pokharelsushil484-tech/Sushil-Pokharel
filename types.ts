
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  EXPENSES = 'EXPENSES',
  DATABASE_MANAGER = 'DATABASE_MANAGER',
  NOTES = 'NOTES',
  VAULT = 'VAULT',
  PLANNER = 'PLANNER'
}

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date'
}

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
  storageLimitGB: number;
  storageUsedBytes: number;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  authorizedDevices: string[];
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
  type: 'FOLDER' | 'IMAGE' | 'VIDEO' | 'DATA' | 'OTHER';
  content?: string;
  parentId: string | null;
  size: number;
  mimeType?: string;
  createdAt: number;
  deletedAt?: number;
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

/**
 * Fix: Exporting missing ChangeRequest interface used for administrative audits and verification tasks.
 */
export interface ChangeRequest {
  id: string;
  userId: string;
  username: string;
  type: 'VERIFICATION' | 'STORAGE' | 'OTHER';
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}
