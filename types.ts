
export enum View {
  DOWNLOADER = 'DOWNLOADER',
  HISTORY = 'HISTORY',
  SUPPORT = 'SUPPORT',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT',
  DASHBOARD = 'DASHBOARD',
  VERIFY_LINK = 'VERIFY_LINK',
  FILE_HUB = 'FILE_HUB',
  AI_CHAT = 'AI_CHAT',
  VERIFICATION_FORM = 'VERIFICATION_FORM',
  ACCESS_RECOVERY = 'ACCESS_RECOVERY',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ERROR = 'ERROR'
}

// Added DownloadItem interface for index.tsx
export interface DownloadItem {
  id: string;
  url: string;
  platform: 'YouTube' | 'Facebook' | 'Instagram' | 'TikTok' | 'Unknown' | string;
  status: 'READY' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  title: string;
  quality: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isSuspicious: boolean;
  level: number;
  verificationStatus: string;
  storageLimitGB: number;
  storageUsedBytes: number;
  totpEnabled: boolean;
  skills: string[];
  interests: string[];
  authorizedDevices: string[];
  education?: string;
  profession?: string;
  studentId?: string;
  acceptedTermsVersion?: string;
  vaultPin?: string;
  totpSecret?: string;
  avatar?: string;
  isBanned?: boolean;
  banReason?: string;
  adminFeedback?: string;
  adminComments?: string[];
  badges?: string[];
  admissionKey?: string;
  rescueKey?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

// TaskPriority enum for study planner
export enum TaskPriority {
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

// Assignment interface for study planner
export interface Assignment {
  id: string;
  title: string;
  category: string;
  subject: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  estimatedTime?: string;
  reminderMinutes: number;
}

// Note interface for notes view
export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  status: 'PENDING' | 'COMPLETED';
  author: 'user' | 'admin';
  deletedAt?: number;
}

// VaultDocument interface for storage vault
export interface VaultDocument {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO' | 'OTHER';
  content: string;
  size: number;
  mimeType: string;
  createdAt: number;
}

// Expense interface for expense tracker
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

// ChangeRequest interface for admin and verification workflows
export interface ChangeRequest {
  id: string;
  userId: string;
  username: string;
  type: 'VERIFICATION' | 'DATA_CHANGE' | 'NAME_CHANGE' | 'RECOVERY';
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  linkId?: string;
  generatedStudentId?: string;
  autoFlagged?: boolean;
  autoFlagReason?: string;
  previousLinkIds?: string[];
}

// TicketMessage interface for support tickets
export interface TicketMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

// SupportTicket interface for user support
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: number;
  updatedAt: number;
  messages: TicketMessage[];
}

// FieldType for dynamic database schema
export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date'
}

// DbField for dynamic database schema
export interface DbField {
  name: string;
  type: FieldType;
  required: boolean;
}

// Database interface for DatabaseManager
export interface Database {
  id: string;
  name: string;
  description: string;
  schema: DbField[];
  records: any[];
  createdAt: number;
}

// ActivityLog interface for system auditing
export interface ActivityLog {
  id: string;
  timestamp: number;
  actor: string;
  targetUser?: string;
  actionType: 'DATA' | 'SECURITY' | 'ADMIN' | 'AUTH' | 'SYSTEM';
  description: string;
  metadata?: string;
}