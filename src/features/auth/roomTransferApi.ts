import { API_BASE_URL } from "@/config/apiConfig";

export type ConfirmStatus = "pending" | "accepted" | "rejected";

export interface RoomTransferRequest {
  id: string;
  requester_user_id: string;
  target_user_id: string;
  target_room_id: string;
  transfer_time: string;
  reason: string;
  peer_confirm_status: ConfirmStatus;
  manager_confirm_status: ConfirmStatus;
  [key: string]: unknown;
}

export interface CreateRoomTransferRequestPayload {
  requester_user_id: string;
  target_user_id: string;
  target_room_id: string;
  transfer_time: string;
  reason: string;
}

export async function createRoomTransferRequest(
  data: CreateRoomTransferRequestPayload,
) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/room-transfer-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Không thể tạo yêu cầu chuyển phòng");
  }

  return res.json();
}

interface RoomTransferListResponse {
  data?: RoomTransferRequest[];
}

export async function getRoomTransferRequests(): Promise<RoomTransferRequest[]> {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/room-transfer-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Không thể lấy danh sách yêu cầu chuyển phòng");
  }

  const raw: unknown = await res.json();
  // BE có thể trả [] trực tiếp hoặc object bao bọc { data: [...] }
  if (Array.isArray(raw)) {
    return raw as RoomTransferRequest[];
  }

const wrapped = raw as RoomTransferListResponse;
return wrapped.data || [];
}

export async function getRoomTransferRequest(id: string): Promise<RoomTransferRequest> {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/room-transfer-requests/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Không thể lấy chi tiết yêu cầu chuyển phòng");
  }

  return res.json();
}

export async function peerConfirmRoomTransferRequest(
  id: string,
  status: Exclude<ConfirmStatus, "pending">,
) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(
    `${API_BASE_URL}/api/v1/protected/room-transfer-requests/${id}/peer-confirm`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ peer_confirm_status: status }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Không thể xác nhận yêu cầu (bạn cùng phòng)");
  }

  return res.json();
}

export async function managerConfirmRoomTransferRequest(
  id: string,
  status: Exclude<ConfirmStatus, "pending">,
) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(
    `${API_BASE_URL}/api/v1/protected/room-transfer-requests/${id}/manager-confirm`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ manager_confirm_status: status }),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Không thể duyệt yêu cầu (quản lý)");
  }

  return res.json();
}
