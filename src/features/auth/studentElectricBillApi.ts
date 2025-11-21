import { API_BASE_URL } from "@/config/apiConfig";
// API cho sinh viên lấy hóa đơn điện phòng mình
export async function getMyRoomElectricBills(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/my-room`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hóa đơn phòng bạn");
  return res.json();
}
