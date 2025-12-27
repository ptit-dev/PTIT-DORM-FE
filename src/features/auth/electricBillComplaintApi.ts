import { API_BASE_URL } from "@/config/apiConfig";

// Accept or reject electric bill complaint (manager)
export async function resolveElectricBillComplaint({ complaint_id, status }: { complaint_id: string, status: 'accepted' | 'rejected' }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bill-complaints/${complaint_id}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Không thể cập nhật trạng thái khiếu nại hóa đơn điện");
  return res.json();
}
