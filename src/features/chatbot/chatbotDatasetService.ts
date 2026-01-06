import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  Prompting,
  CreatePromptingRequest,
  UpdatePromptingRequest,
  ApiResponse,
  ApiListResponse,
} from '@/model/ChatbotDataset';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/protected`;

class ChatbotDatasetService {
  private async request<TResponse>(
    path: string,
    options: RequestInit = {}
  ): Promise<TResponse> {
    const token = localStorage.getItem('ptit_access_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_ENDPOINT}${path}`, {
      ...options,
      headers,
    });

    const json = (await response.json()) as TResponse;

    if (!response.ok) {
      const errorBody = json as { message?: string };
      const message =
        errorBody.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return json;
  }

  // ===== DOCUMENTS APIS =====

  async getDocuments(): Promise<Document[]> {
    const response = await this.request<ApiListResponse<Document>>(
      '/chatbot/documents',
      { method: 'GET' }
    );
    return response.data || [];
  }

  async createDocument(request: CreateDocumentRequest): Promise<Document> {
    const response = await this.request<ApiResponse<Document>>(
      '/chatbot/documents',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async updateDocument(
    id: string,
    request: UpdateDocumentRequest
  ): Promise<void> {
    await this.request<ApiResponse<null>>(`/chatbot/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteDocument(id: string): Promise<void> {
    await this.request<ApiResponse<null>>(`/chatbot/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== PROMPTING APIS =====

  async getPromptings(): Promise<Prompting[]> {
    const response = await this.request<ApiListResponse<Prompting>>(
      '/chatbot/prompting',
      { method: 'GET' }
    );
    return response.data || [];
  }

  async createPrompting(
    request: CreatePromptingRequest
  ): Promise<Prompting> {
    const response = await this.request<ApiResponse<Prompting>>(
      '/chatbot/prompting',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  async updatePrompting(
    id: string,
    request: UpdatePromptingRequest
  ): Promise<void> {
    await this.request<ApiResponse<null>>(`/chatbot/prompting/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deletePrompting(id: string): Promise<void> {
    await this.request<ApiResponse<null>>(`/chatbot/prompting/${id}`, {
      method: 'DELETE',
    });
  }


  async syncDataset(): Promise<ApiResponse<unknown>> {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL chưa được cấu hình ở FE.');
    }

    const baseUrl = String(API_BASE_URL).replace(/\/+$/, '');
    const url = `${baseUrl}/api/v1/protected/chatbot/sync-dataset`;

    const token = localStorage.getItem('ptit_access_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    let json: ApiResponse<unknown>;

    try {
      json = (await response.json()) as ApiResponse<unknown>;
    } catch {
      if (!response.ok) {
        throw new Error(`Đồng bộ thất bại (HTTP ${response.status}).`);
      }

      return {
        code: response.status,
        message: 'Đồng bộ dataset chatbot thành công.',
        data: null,
      };
    }

    if (!response.ok || (json.code && json.code >= 400)) {
      throw new Error(
        json.message || `Đồng bộ thất bại (HTTP ${response.status}).`
      );
    }

    return json;
  }
}

export default new ChatbotDatasetService();
