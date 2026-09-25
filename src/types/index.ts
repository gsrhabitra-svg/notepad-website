export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterData {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type NodeType = 'notebook' | 'topic' | 'page';

export interface NotebookNode {
  _id: string;
  userId: string;
  title: string;
  parentId: string | null;
  type: NodeType;
  order: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
  children?: NotebookNode[];
}

export interface PageContent {
  _id: string;
  userId: string;
  nodeId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface SearchResult {
  nodeId: string;
  nodeTitle: string;
  nodeType: string;
  pageTitle: string;
  snippet: string;
  matchedIn: 'title' | 'content';
}
