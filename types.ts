
export enum View {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  FILE_HUB = 'FILE_HUB',
  AI_CHAT = 'AI_CHAT',
  VERIFICATION_FORM = 'VERIFICATION_FORM',
  SETTINGS = 'SETTINGS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  VERIFY_LINK = 'VERIFY_LINK',
  INVITE_REGISTRATION = 'INVITE_REGISTRATION',
  ACCESS_RECOVERY = 'ACCESS_RECOVERY',
  SUPPORT = 'SUPPORT',
  ERROR = 'ERROR'
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  loginSnap?: string; // Captured during professional login
  vaultPin?: string;
  isBanned?: boolean;
  banReason?: string;
  isVerified: boolean;
  isSuspicious?: boolean; // Flag for accounts recovered via Admission Key needing re-verification
  level: number; // 0=Guest, 1=Basic, 2=Verified, 3=Elite
  verificationStatus: 'NONE' | 'FORM_PENDING' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';
  adminFeedback?: string; // Stores the email content/rejection reason
  rescueKey?: string; // Static master key for alternative verification
  admissionKey?: string; // Key generated for banned user recovery (Acts as Master Key)
  acceptedTermsVersion?: string;
  studentId?: string; // Generated ID during verification
  storageLimitGB: number;
  storageUsedBytes: number;
  totpEnabled: boolean;
  totpSecret?: string;
  profession?: string;
  education?: string;
  skills: string[];
  interests: string[];
  authorizedDevices: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  actor: string;        // Who performed the action (User or Admin)
  targetUser?: string;  // Who was affected (if different from actor)
  actionType: 'AUTH' | 'DATA' | 'ADMIN' | 'SECURITY' | 'SYSTEM';
  description: string;
  metadata?: string;    // JSON string for extra details (e.g., file size, old values)
}

export interface VaultDocument {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO' | 'DATA' | 'OTHER';
  content: string; // Base64 or Blob
  size: number;
  mimeType: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface VerificationQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice';
  options?: string[];
}

export interface ChangeRequest {
  id: string;
  userId: string;
  username: string;
  type: 'VERIFICATION' | 'STORAGE' | 'RECOVERY' | 'DATA_CHANGE' | 'NAME_CHANGE';
  details: string; // Will store the JSON of the form answers
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  linkId?: string;
  previousLinkIds?: string[]; // History of link IDs to allow redirects
  generatedStudentId?: string; // The ID generated during form submission
  autoFlagged?: boolean; // System detected potential issues
  autoFlagReason?: string;
}

export enum TaskPriority {
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
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
  status: 'PENDING' | 'COMPLETED';
  author: 'user' | 'admin';
  deletedAt?: number;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export enum FieldType {
  STRING = 'String',
  NUMBER = 'Number',
  BOOLEAN = 'Boolean',
  DATE = 'Date'
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

export interface TicketMessage {
  id: string;
  sender: string; // Username or 'Admin'
  text: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: number;
  updatedAt: number;
  messages: TicketMessage[];
}
