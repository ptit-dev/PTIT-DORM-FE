import { API_BASE_URL } from "@/config/apiConfig";
// API cho chức năng admin_system
export async function backupData(): Promise<Blob> {
  const token = localStorage.getItem("ptit_access_token");
  if (!token) {
    throw new Error("Không tìm thấy token đăng nhập");
  }
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/backup-data`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error("Không thể backup dữ liệu");
  return await res.blob();
}
