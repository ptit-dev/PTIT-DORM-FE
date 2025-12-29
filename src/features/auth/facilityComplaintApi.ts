import { API_BASE_URL } from "@/config/apiConfig";

export type FacilityComplaint = {
  id: string;
  room_id: string;
  student_id: string;
  student_name?: string;
  username?: string;
  title: string;
  description?: string;
  proof?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type MyRoomComplaintsResponse = {
  room: string;
  data: FacilityComplaint[];
};

const BASE_URL = `${API_BASE_URL}/api/v1/protected/facility-complaints`;

function getAccessToken(): string | null {
  return localStorage.getItem("ptit_access_token");
}

export async function getMyFacilityComplaints(): Promise<FacilityComplaint[]> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    throw new Error("Không thể lấy danh sách khiếu nại của bạn");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getMyRoomFacilityComplaints(): Promise<MyRoomComplaintsResponse> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/my-room`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    throw new Error("Không thể lấy danh sách khiếu nại của phòng bạn");
  }
  const data = await res.json();
  const room = typeof data.room === "string" ? data.room : "";
  const complaints: FacilityComplaint[] = Array.isArray(data.data) ? data.data : [];
  return { room, data: complaints };
}

export async function getAllFacilityComplaints(): Promise<FacilityComplaint[]> {
  const token = getAccessToken();
  const res = await fetch(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    throw new Error("Không thể lấy danh sách khiếu nại cơ sở vật chất");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getFacilityComplaintById(id: string): Promise<FacilityComplaint> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    throw new Error("Không thể lấy chi tiết khiếu nại");
  }
  return res.json();
}

export async function createFacilityComplaint(params: {
  room_id: string;
  title: string;
  description?: string;
  proofFile?: File;
}): Promise<FacilityComplaint> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("room_id", params.room_id);
  formData.append("title", params.title);
  if (params.description) {
    formData.append("description", params.description);
  }
  if (params.proofFile) {
    formData.append("proof", params.proofFile);
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Không thể tạo khiếu nại cơ sở vật chất");
  }
  return res.json();
}

export async function updateFacilityComplaint(id: string, payload: {
  title: string;
  description?: string;
  status: string;
}): Promise<FacilityComplaint> {
  const token = getAccessToken();
  const body = {
    title: payload.title,
    description: payload.description ?? "",
    status: payload.status,
  };

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Không thể cập nhật khiếu nại cơ sở vật chất");
  }
  return res.json();
}

export async function updateFacilityComplaintStatus(id: string, status: string): Promise<FacilityComplaint> {
  const token = getAccessToken();
  const body = { status };

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Không thể cập nhật trạng thái khiếu nại cơ sở vật chất");
  }
  return res.json();
}

export async function updateFacilityComplaintProof(id: string, proofFile: File): Promise<FacilityComplaint> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("proof", proofFile);

  const res = await fetch(`${BASE_URL}/${id}/proof`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Không thể cập nhật minh chứng cho khiếu nại");
  }
  return res.json();
}

export async function deleteFacilityComplaint(id: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    throw new Error("Không thể xóa khiếu nại cơ sở vật chất");
  }
}
