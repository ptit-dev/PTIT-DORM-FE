import { API_BASE_URL } from "@/config/apiConfig";

export async function getElectricBills() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills`, {
    headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hóa đơn điện");
  return res.json();
}

export async function getElectricBill(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
  });
  if (!res.ok) throw new Error("Không thể lấy chi tiết hóa đơn điện");
  return res.json();
}

export async function createElectricBill(data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể tạo hóa đơn điện");
  return res.json();
}

export async function updateElectricBill(id: string, data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Không thể cập nhật hóa đơn điện");
  return res.json();
}

export async function deleteElectricBill(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bills/${id}`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể xóa hóa đơn điện");
  return res.json();
}

// Lấy danh sách khiếu nại hóa đơn điện
export async function getElectricBillComplaints() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/electric-bill-complaints`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách khiếu nại hóa đơn điện");
  return res.json();
}