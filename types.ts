
export enum View {
  SUPPORT = 'SUPPORT',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
  VERIFY_LINK = 'VERIFY_LINK',
  FILE_HUB = 'FILE_HUB',
  VERIFICATION_FORM = 'VERIFICATION_FORM',
  ACCESS_RECOVERY = 'ACCESS_RECOVERY',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  REGISTER = 'REGISTER',
  ACADEMIC_LEDGER = 'ACADEMIC_LEDGER',
  ATTENDANCE_TRACKER = 'ATTENDANCE_TRACKER',
  CAMPUS_RADAR = 'CAMPUS_RADAR',
  GROWTH_JOURNAL = 'GROWTH_JOURNAL',
  SECURITY_HEARTBEAT = 'SECURITY_HEARTBEAT',
  ERROR = 'ERROR'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export interface GradeRecord {
  id: string;
  subject: string;
  score: number;
  total: number;
  semester: string;
  grade: string;
  timestamp: number;
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  present: number;
  absent: number;
  lastUpdated: number;
}

export interface CampusNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  privacyLevel: 'STANDARD' | 'MAXIMUM' | 'STEALTH';
  isSuspended?: boolean;
  isSuspicious: boolean;
  level: number;
  verificationStatus: string;
  storageLimitGB: number;
  storageUsedBytes: number;
  totpEnabled: boolean;
  totpSecret?: string;
  skills: string[];
  interests: string[];
  authorizedDevices: string[];
  education?: string;
  studentId?: string;
  avatar?: string;
  isBanned?: boolean;
  banReason?: string;
  adminFeedback?: string;
  rescueKey?: string;
  admissionKey?: string;
  badges?: string[];
  adminComments?: string[];
  acceptedTermsVersion?: string;
  vaultPin?: string;
  violationCount: number;
  maxViolations: number;
  integrityScore: number; // 0 - 100
  sanctions: SanctionRecord[];
}

export interface SanctionRecord {
  id: string;
  type: 'UI_FAULT' | 'PIN_FAILURE' | 'LINGUISTIC' | 'UNSTABLE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
  context: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  estimatedTime?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  status: 'PENDING' | 'COMPLETED';
  author: 'admin' | 'user';
  deletedAt?: number;
}

export interface VaultDocument {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO' | 'OTHER';
  content: string;
  size: number;
  mimeType: string;
  createdAt: number;
}

export interface ChangeRequest {
  id: string;
  userId: string;
  username: string;
  type: 'VERIFICATION' | 'DATA_CHANGE' | 'RECOVERY' | 'REACTIVATION' | 'RESTORE_INTEGRITY';
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  linkId: string;
  generatedStudentId?: string;
}

export interface TicketMessage {
  id: string;
  sender: string;
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
  records: Record<string, any>[];
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  actor: string;
  targetUser: string;
  actionType: string;
  description: string;
  metadata?: string;
}
