import { API_BASE_URL } from "@/config/apiConfig";

export async function getManagers(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/managers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách nhân viên");
  return res.json();
}

export async function createManager(data: FormData, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/managers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) throw new Error("Không thể thêm nhân viên");
  return res.json();
}

export async function updateManager(id: string, data: FormData, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/managers/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  });
  if (!res.ok) throw new Error("Không thể cập nhật nhân viên");
  return res.json();
}

export async function deleteManager(id: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/managers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể xóa nhân viên");
  return res.json();
}
