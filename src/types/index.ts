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
