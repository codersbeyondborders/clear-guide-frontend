// =============================================================================
// ClearGuide — Shared TypeScript types matching the DB schema
// =============================================================================

// ---------------------------------------------------------------------------
// Enums (mirror pgEnum values)
// ---------------------------------------------------------------------------
export type ManualStatus = 'draft' | 'processing' | 'pending_review' | 'published' | 'archived'
export type ChatRole = 'user' | 'assistant'
export type ViewMode = 'web' | 'ar' | 'qr' | 'direct'

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------
export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  userId: string
}

// ---------------------------------------------------------------------------
// Firebase Auth Profiles (stored in Firestore)
// ---------------------------------------------------------------------------
export type AgeGroup = 'under_18' | '18_34' | '35_54' | '55_64' | '65_plus'
export type FontSizePref = 'small' | 'medium' | 'large' | 'xlarge'
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

/** Stored at Firestore: users/{uid} */
export interface EndUserProfile {
  uid: string
  name: string
  email: string
  userType: 'end_user'
  avatarUrl: string | null
  ageGroup: AgeGroup | null
  fontSizePref: FontSizePref
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  colorBlindMode: ColorBlindMode
  createdAt: string
  updatedAt: string
}

/** Stored at Firestore: manufacturers/{uid} */
export interface ManufacturerProfile {
  uid: string
  name: string
  email: string
  userType: 'manufacturer'
  companyId: string
  role: CompanyRole
  createdAt: string
  updatedAt: string
}

/** Stored at Firestore: companies/{companyId} */
export interface CompanyDoc {
  id: string
  ownerUid: string
  name: string
  industry: string | null
  website: string | null
  description: string | null
  logoUrl: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Company & Team Management
// ---------------------------------------------------------------------------
export type CompanyRole = 'owner' | 'admin' | 'manager' | 'creator' | 'viewer'
export type MemberStatus = 'pending' | 'active' | 'suspended'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: CompanyRole
  status: MemberStatus
  joinedAt: string
  image: string | null
}

export interface CompanyProfile {
  name: string
  industry: string
  website: string
  description: string
  logoUrl: string | null
}

// Role permission matrix
export const ROLE_PERMISSIONS: Record<CompanyRole, { label: string; description: string; permissions: string[] }> = {
  owner: {
    label: 'Owner',
    description: 'Full access. Owns the company account.',
    permissions: ['All permissions'],
  },
  admin: {
    label: 'Admin',
    description: 'Edit company details, invite members, manage roles.',
    permissions: ['Edit company', 'Invite members', 'Change roles', 'Create manuals', 'Publish', 'Analytics'],
  },
  manager: {
    label: 'Manager',
    description: 'Invite members and publish manuals.',
    permissions: ['Invite members', 'Create manuals', 'Publish', 'Analytics'],
  },
  creator: {
    label: 'Creator',
    description: 'Create and edit manuals, submit for review.',
    permissions: ['Create manuals', 'Submit for review', 'Analytics'],
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to manuals and analytics.',
    permissions: ['View manuals', 'Analytics'],
  },
}

// ---------------------------------------------------------------------------
// Output Formats
// ---------------------------------------------------------------------------
export type OutputFormat = 'web' | 'pdf' | 'qr_page' | 'epub' | 'print_ready'

// ---------------------------------------------------------------------------
// App: manuals
// ---------------------------------------------------------------------------
export interface Manual {
  id: string
  userId: string
  productName: string
  productModel: string | null
  brand: string | null
  description: string | null
  status: ManualStatus
  /** When true and status is 'published', the manual is listed in the public Products Forum. */
  isPublic: boolean
  languages: string[]
  outputFormats: OutputFormat[]
  coverImage: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Lightweight list item used in dashboard cards */
export interface ManualListItem
  extends Pick<Manual, 'id' | 'productName' | 'productModel' | 'brand' | 'status' | 'isPublic' | 'languages' | 'coverImage' | 'createdAt' | 'updatedAt'> {
  sectionCount: number
  /** Total view events from the analytics table */
  viewCount: number
  /** Average time spent per view session, in seconds */
  avgTimeSeconds: number
}

// ---------------------------------------------------------------------------
// Dashboard-level analytics
// ---------------------------------------------------------------------------
export interface DashboardKPI {
  totalManuals: number
  publishedManuals: number
  totalViews: number
  activeUsers: number
  /** % change in views vs prior 30-day period */
  trendViews?: number
  /** % change in active users vs prior 30-day period */
  trendUsers?: number
}

export interface ActivityEvent {
  id: string
  manualName: string
  manualId: string
  mode: ViewMode
  timeSpentSeconds: number
  viewedAt: string
}

export interface DashboardAnalytics {
  kpi: DashboardKPI
  recentActivity: ActivityEvent[]
}

// ---------------------------------------------------------------------------
// App: manual_sections
// ---------------------------------------------------------------------------
export interface ManualSection {
  id: string
  manualId: string
  sectionNumber: number
  title: string
  content: string | null
  imageUrls: string[]
  videoUrls: string[]
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: translations
// ---------------------------------------------------------------------------
export interface Translation {
  id: string
  manualId: string
  sectionId: string
  language: string
  translatedContent: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: manual_knowledge_base
// ---------------------------------------------------------------------------
export interface KnowledgeBaseChunk {
  text: string
  embeddingId: string
  sectionId: string
}

export interface ManualKnowledgeBase {
  id: string
  manualId: string
  chunks: KnowledgeBaseChunk[]
  modelVersion: string | null
  indexedAt: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: analytics
// ---------------------------------------------------------------------------
export interface AnalyticsEvent {
  id: string
  manualId: string
  userSessionId: string
  mode: ViewMode
  timeSpentSeconds: number
  viewedAt: string
  createdAt: string
}

/** Aggregated stats returned for dashboard charts */
export interface ManualAnalyticsSummary {
  manualId: string
  totalViews: number
  uniqueSessions: number
  avgTimeSpentSeconds: number
  viewsByMode: Record<ViewMode, number>
  viewsLast30Days: number
  bounceRate: number
  avgSessionDurationSeconds: number
}

export interface CountryStats {
  country: string
  flag: string
  views: number
  percentage: number
}

export interface DeviceStats {
  mobile: number
  desktop: number
  tablet: number
}

export interface SectionEngagement {
  sectionNumber: number
  title: string
  views: number
  avgTimeSeconds: number
  dropoffRate: number
}

export interface EngagementFunnel {
  sessions: number
  scrolled50: number
  usedAiChat: number
  downloaded: number
}

export interface ManualDetailedAnalytics extends ManualAnalyticsSummary {
  topCountries: CountryStats[]
  deviceStats: DeviceStats
  topLanguages: { language: string; views: number; percentage: number }[]
  sectionEngagement: SectionEngagement[]
  engagementFunnel: EngagementFunnel
  returningUserRate: number
}

// ---------------------------------------------------------------------------
// App: ai_chat_history
// ---------------------------------------------------------------------------
export interface AiChatMessage {
  id: string
  manualId: string
  userSessionId: string
  role: ChatRole
  message: string
  tokenCount: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Community — user roles
// ---------------------------------------------------------------------------
export type UserType = 'manufacturer' | 'end_user'

// ---------------------------------------------------------------------------
// Community — public product listing (Products Forum)
// ---------------------------------------------------------------------------
export interface PublicProduct {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  description: string | null
  coverImage: string | null
  languages: string[]
  createdAt: string
  updatedAt: string
  /** Aggregate community stats */
  avgRating: number
  reviewCount: number
  threadCount: number
}

// ---------------------------------------------------------------------------
// Community — product reviews
// ---------------------------------------------------------------------------
export interface ProductReview {
  id: string
  manualId: string
  userId: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string | null
  body: string
  helpfulCount: number
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
}

// ---------------------------------------------------------------------------
// Community — forum threads
// ---------------------------------------------------------------------------
export interface ForumThread {
  id: string
  manualId: string
  userId: string
  title: string
  body: string
  isPinned: boolean
  isSolved: boolean
  replyCount: number
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
  manualName?: string
  productBrand?: string
}

// ---------------------------------------------------------------------------
// Community — forum replies
// ---------------------------------------------------------------------------
export interface ForumReply {
  id: string
  threadId: string
  userId: string
  body: string
  isSolution: boolean
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
}

// ---------------------------------------------------------------------------
// Repair Hub — media attachment (stored as JSONB in hub_posts / hub_comments)
// ---------------------------------------------------------------------------
export type MediaType = 'image' | 'video' | 'document' | 'link'

export interface MediaAttachment {
  type: MediaType
  url: string        // public Blob URL or external URL for links
  name?: string      // original file name
  size?: number      // bytes
  mimeType?: string
  thumbnail?: string // optional preview image for videos/docs
}

export interface LinkMeta {
  title?: string
  description?: string
  image?: string
  domain?: string
}

// ---------------------------------------------------------------------------
// Repair Hub — user profile (extends the auth User)
// ---------------------------------------------------------------------------
export interface HubProfile {
  id: string
  name: string
  email?: string
  username: string | null
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  location: string | null
  websiteUrl: string | null
  repairSpecialty: string[]
  createdAt: string
  // aggregate counts
  postCount: number
  followerCount: number
  followingCount: number
}

// ---------------------------------------------------------------------------
// Repair Hub — posts (global feed)
// ---------------------------------------------------------------------------
export interface HubPost {
  id: string
  userId: string
  manualId: string | null
  body: string
  media: MediaAttachment[]
  linkUrl: string | null
  linkMeta: LinkMeta | null
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  // joined
  author: { id: string; name: string; username: string | null; avatarUrl: string | null }
  productName?: string | null
  productBrand?: string | null
  tags?: string[]
  // viewer state
  isLiked?: boolean
  isBookmarked?: boolean
}

// ---------------------------------------------------------------------------
// Repair Hub — comments
// ---------------------------------------------------------------------------
export interface HubComment {
  id: string
  postId: string
  parentId: string | null
  userId: string
  body: string
  media: MediaAttachment[]
  likeCount: number
  createdAt: string
  updatedAt: string
  author: { id: string; name: string; username: string | null; avatarUrl: string | null }
  isLiked?: boolean
  replies?: HubComment[]
}

// ---------------------------------------------------------------------------
// Repair Hub — engagement
// ---------------------------------------------------------------------------
export interface HubLike {
  id: string
  userId: string
  targetType: 'post' | 'comment' | 'thread_reply'
  targetId: string
  createdAt: string
}

export interface HubFollow {
  followerId: string
  followingId: string
  createdAt: string
}

export interface HubBookmark {
  userId: string
  postId: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Company accounts + multi-user roles (extended interfaces)
// ---------------------------------------------------------------------------
export interface Company {
  id: string
  ownerUserId: string
  name: string
  slug: string
  logoUrl: string | null
  industry: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanyMember {
  companyId: string
  userId: string
  role: CompanyRole
  status: MemberStatus
  invitedBy: string | null
  invitedAt: string
  acceptedAt: string | null
  /** Joined from "user" table */
  name?: string
  email?: string
  image?: string | null
}

export interface CompanyInvitation {
  id: string
  companyId: string
  email: string
  role: CompanyRole
  token: string
  invitedBy: string
  expiresAt: string
  acceptedAt: string | null
}

// ---------------------------------------------------------------------------
// Extended analytics
// ---------------------------------------------------------------------------
export interface ExtendedAnalytics {
  manualName: string
  totalViews: number
  activeUsers: number
  avgTimeSpent: string
  trendViews: number
  trendUsers: number
  viewsOverTime: { date: string; views: number }[]
  topAIQueries: { query: string; count: number }[]
  deviceBreakdown: { device: string; count: number }[]
  topSections: { title: string; views: number; avgScrollDepth: number }[]
  retentionCurve: { step: string; pct: number }[]
  countryBreakdown: { country: string; views: number }[]
  ageGroupBreakdown: { group: string; count: number }[]
  eventBreakdown: { type: string; count: number }[]
  returningVsNew: { returning: number; new: number }
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------
export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
