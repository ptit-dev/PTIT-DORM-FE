// Document Model
export interface Document {
  id: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentRequest {
  description: string;
  content: string;
}

export interface UpdateDocumentRequest {
  description: string;
  content: string;
}

// Prompting Model
export interface Prompting {
  id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptingRequest {
  type: string;
  content: string;
}

export interface UpdatePromptingRequest {
  type: string;
  content: string;
}

// API Response
export interface ApiResponse<T = null> {
  code: number;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  code: number;
  message: string;
  data: T[];
}
