import { API_BASE_URL } from "@/config/apiConfig";

export async function getContracts(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hợp đồng");
  return res.json();
}

export async function verifyContract(id: string, data: { status: string; note?: string }, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/${id}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể xác nhận hợp đồng");
  return res.json();
}
