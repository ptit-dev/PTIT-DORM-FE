import { API_BASE_URL } from "@/config/apiConfig";

export async function confirmContract(id: string, data: { image_bill: File; note?: string }, token: string) {
  const formData = new FormData();
  formData.append("image_bill", data.image_bill);
  if (data.note) formData.append("note", data.note);
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/${id}/confirm`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Không thể xác nhận hợp đồng");
  return res.json();
}
