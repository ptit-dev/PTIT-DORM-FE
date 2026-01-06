// Quản lý/admin duyệt hoặc từ chối yêu cầu hủy hợp đồng
export async function verifyContractCancelRequest(
  id: string,
  data: { status: "approved" | "rejected"; manager_note?: string }
): Promise<ContractCancelRequest> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contract-cancel-requests/${id}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : "Không thể duyệt yêu cầu hủy hợp đồng";
    throw new Error(message);
  }
  return res.json();
}
import { API_BASE_URL } from "@/config/apiConfig";

export type ContractCancelStatus = "pending" | "approved" | "rejected";

export interface ContractCancelRequest {
  id: string;
  contract_id: string;
  status: ContractCancelStatus;
  reason: string;
  manager_note?: string;
  created_at?: string;
  updated_at?: string;
}

function getAccessToken(): string | null {
  return localStorage.getItem("ptit_access_token");
}

export async function createContractCancelRequest(payload: {
  contract_id: string;
  reason: string;
}): Promise<ContractCancelRequest> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contract-cancel-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : "Không thể gửi yêu cầu hủy hợp đồng";
    throw new Error(message);
  }

  return res.json();
}

export async function getMyContractCancelRequests(): Promise<ContractCancelRequest[]> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contract-cancel-requests/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" && body !== null && "message" in body && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : "Không thể lấy danh sách yêu cầu hủy hợp đồng";
    throw new Error(message);
  }

  const data: unknown = await res.json();
  if (Array.isArray(data)) {
    return data as ContractCancelRequest[];
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    const wrapped = (data as { data?: unknown }).data;
    return Array.isArray(wrapped) ? (wrapped as ContractCancelRequest[]) : [];
  }

  return [];
}
