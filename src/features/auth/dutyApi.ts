import { API_BASE_URL } from "@/config/apiConfig";

export async function getDutySchedules() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/duty-schedules`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách lịch trực");
  return res.json();
}
export async function createDutySchedule(data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/duty-schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể tạo lịch trực");
  return res.json();
}
export async function updateDutySchedule(id: string, data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/duty-schedules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể cập nhật lịch trực");
  return res.json();
}
export async function deleteDutySchedule(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/duty-schedules/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể xóa lịch trực");
  return res.json();
}




