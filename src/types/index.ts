// ─── Common ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedData<T> {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
  /** Article list: 0=thường, 1=nổi bật, 2=tin tức */
  type?: number;
  name?: string;
  email?: string;
  roleName?: string;
  title?: string;
  slug?: string;
  category?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface RoleRef {
  id: number;
  name: string;
}

export interface CompanyRef {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  address: string;
  avatar: string | null;
  company: CompanyRef | null;
  roles: RoleRef[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
  address: string;
  /** Backend expects explicit null when no avatar. */
  avatar?: string | null;
  companyId?: number | null;
  roleIds?: number[];
}

export interface UpdateUserRequest {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  address: string;
  avatar?: string | null;
  companyId?: number | null;
  roleIds?: number[];
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  address: string;
  logo?: string;
}

export interface UpdateCompanyRequest {
  id: number;
  name: string;
  description: string;
  address: string;
  logo?: string;
}

// ─── Permission ───────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Permission {
  id: number;
  name: string;
  apiPath: string;
  method: HttpMethod;
  module: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePermissionRequest {
  name: string;
  apiPath: string;
  method: HttpMethod;
  module: string;
}

export interface UpdatePermissionRequest {
  id: number;
  name: string;
  apiPath: string;
  method: HttpMethod;
  module: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds: number[];
}

export interface UpdateRoleRequest {
  id: number;
  name: string;
  description: string;
  permissionIds: number[];
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
}

export interface UpdateTagRequest {
  id: number;
  name: string;
  description?: string;
}

// ─── Document ────────────────────────────────────────────────────────────────

export interface Document {
  id: number;
  title: string | null;
  description: string | null;
  documentUrl: string;
  articleId: number;
  article?: { id: number; title?: string };
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDocumentRequest {
  title?: string;
  description?: string;
  documentUrl: string;
  articleId: number;
}

export interface UpdateDocumentRequest {
  id: number;
  title?: string;
  description?: string;
  documentUrl: string;
  articleId: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryParent {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  active: number;
  parent: CategoryParent | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  active?: number;
  parentId?: number;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  slug: string;
  active?: number;
  parentId?: number;
}

// ─── Article ──────────────────────────────────────────────────────────────────

export interface ArticleAuthor {
  id: number;
  name: string;
}

export interface ArticleCategory {
  id: number;
  name: string;
}

export interface ArticleTag {
  id: number;
  name: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content?: string;
  thumbnail: string | null;
  type: number;
  views: number;
  active: number;
  author: ArticleAuthor;
  category: ArticleCategory | null;
  tags: ArticleTag[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateArticleRequest {
  title: string;
  slug: string;
  content?: string;
  thumbnail?: string;
  type: number;
  active?: number;
  authorId: number;
  categoryId?: number;
  tagIds: number[];
}

export interface UpdateArticleRequest {
  id: number;
  title: string;
  slug: string;
  content?: string;
  thumbnail?: string;
  type: number;
  active?: number;
  authorId: number;
  categoryId?: number;
  tagIds: number[];
}

// ─── Feedback ──────────────────────────────────────────────────────────────────

export type FeedbackStatus = "PENDING" | "PROCESSING" | "RESOLVED" | "REJECTED";

export type IssueType =
  | "LEAK"
  | "QUALITY"
  | "PRESSURE"
  | "OUTAGE"
  | "BILLING"
  | "METER"
  | "OTHER";

export interface FeedbackCustomer {
  customerId: number;
  digiCode: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface FeedbackStaff {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface FeedbackReply {
  id: number;
  staff: FeedbackStaff;
  content: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: number;
  trackingCode: string;
  customer: FeedbackCustomer;
  issueType: IssueType;
  location: string;
  description: string;
  status: FeedbackStatus;
  replyCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackDetail {
  id: number;
  trackingCode: string;
  customer: FeedbackCustomer;
  issueType: IssueType;
  location: string;
  description: string;
  status: FeedbackStatus;
  images: string[];
  replies: FeedbackReply[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStatistics {
  byStatus: Record<FeedbackStatus, number>;
  byIssueType: Record<IssueType, number>;
  trendCounts: { last7Days: number; last30Days: number };
  hotspotLocations: { location: string; count: number }[];
}

export interface FeedbackListParams {
  keyword?: string;
  status?: FeedbackStatus;
  issueType?: IssueType;
  customerSearch?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface UpdateFeedbackStatusRequest {
  status: FeedbackStatus;
}

export interface CreateFeedbackReplyRequest {
  content: string;
}
// ─── Media ────────────────────────────────────────────────────────────────────

export interface Media {
  id: number;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: string;
}

export interface MediaParams {
  page?: number;
  pageSize?: number;
  title?: string;
  fileType?: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export interface Road {
  id: number;
  name: string;
  type: number;
}

export interface AdminInvoice {
  id: number;
  digiCode: string;
  customerName: string;
  totalAmount: number;
  yearMonth: string;
  invoiceNo: string;
  paymentStatus: number; // 1 = Chưa thanh toán, 2 = Đã thanh toán
  isReminded?: boolean;
  isOverdue?: boolean;
  isWaterCutoff?: boolean;
  hasReplacement?: boolean;
  fkey: string | null;
  qrUrl: string | null;
  blankNo: string | null;
  roadId: number | null;
}

export interface AdminInvoiceParams {
  page?: number;
  size?: number;
  yearMonth?: string;
  paymentStatus?: number;
  customerName?: string;
  digiCode?: string;
  remindStatus?: number;
  roadId?: number;
}
