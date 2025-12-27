import { API_BASE_URL } from "@/config/apiConfig";
// API cho sinh viên lấy hóa đơn điện phòng mình
export async function getMyRoomElectricBills() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/my-room`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hóa đơn phòng bạn");
  return res.json();
}


// Xác nhận hóa đơn điện
export async function confirmElectricBill(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/${id}/confirm-only`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể xác nhận hóa đơn");
  return res.json();
}

// Upload minh chứng thanh toán
export async function uploadElectricBillPaymentProof(id: string, file: File) {
  const token = localStorage.getItem("ptit_access_token");
  const formData = new FormData();
  formData.append('payment_proof', file);
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/${id}/payment-proof`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Không thể upload minh chứng thanh toán");
  return res.json();
}

// Tạo mới khiếu nại hóa đơn điện
export async function createElectricBillComplaint({ electric_bill_id, note, proof, student_id }: { electric_bill_id: string, note: string, proof?: File, student_id: string }) {
  const token = localStorage.getItem("ptit_access_token");
  const formData = new FormData();
  formData.append('electric_bill_id', electric_bill_id);
  formData.append('note', note);
  formData.append('student_id', student_id);
  if (proof) formData.append('proof', proof);
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bill-complaints`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Không thể gửi khiếu nại hóa đơn điện");
  return res.json();
}