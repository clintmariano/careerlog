export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  PHONE_SCREEN = 'PHONE_SCREEN',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  BEHAVIORAL_INTERVIEW = 'BEHAVIORAL_INTERVIEW',
  FINAL_ROUND = 'FINAL_ROUND',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Application {
  id?: number
  userId?: string
  companyName: string
  jobTitle: string
  location?: string
  techStack?: string
  applicationDate: string
  status: ApplicationStatus
  salaryRange?: string
  source?: string
  description?: string
  activities?: Activity[]
  attachments?: Attachment[]
}

export enum ActivityType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  PHONE_SCREEN = 'PHONE_SCREEN',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  BEHAVIORAL_INTERVIEW = 'BEHAVIORAL_INTERVIEW',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  CODING_TEST = 'CODING_TEST',
  TAKE_HOME_ASSIGNMENT = 'TAKE_HOME_ASSIGNMENT',
  FINAL_ROUND = 'FINAL_ROUND',
  OFFER_CALL = 'OFFER_CALL',
  REJECTION = 'REJECTION',
  FOLLOW_UP_EMAIL = 'FOLLOW_UP_EMAIL',
  NETWORKING_COFFEE = 'NETWORKING_COFFEE',
  INFO_SESSION = 'INFO_SESSION',
  REFERENCE_CHECK = 'REFERENCE_CHECK',
  OTHER = 'OTHER',
}

export interface Activity {
  id?: number
  application?: Pick<Application, 'id' | 'companyName' | 'jobTitle'>
  type: ActivityType
  dateTime: string
  notes?: string
  location?: string
  participants?: string
  durationMinutes?: number
}

export interface Attachment {
  id?: number
  fileName: string
  fileType: string
  url: string
  uploadedAt: string
  description?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface DashboardOverview {
  totalApplications: number
  applicationStatusBreakdown: Record<string, number>
  weeklyApplications: Record<string, number>
  recentActivities: Array<{
    id: number
    type: string
    dateTime: string
    companyName: string
    jobTitle: string
  }>
  totalActivities?: number
  totalAttachments?: number
}
