// Lấy danh sách thành viên cùng phòng cho sinh viên
export async function getMyRoomMembers() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/me/members`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Không thể lấy danh sách thành viên cùng phòng");
  }
  const data = await res.json();
  return data;
}
// ===================== CONTRACTS - MANAGER =====================
// Lấy danh sách hợp đồng đã duyệt (cho quản lý/admin_system)
export async function getApprovedContracts() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/approved`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hợp đồng đã duyệt");
  const data = await res.json();
  return data.data || [];
}

// Lấy danh sách sinh viên trong một phòng (cho quản lý/admin_system)
export async function getResidentsByRoom(room: string) {
  const token = localStorage.getItem("ptit_access_token");
  if (!room) throw new Error("Thiếu mã phòng");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/residents?room=${encodeURIComponent(room)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Không thể lấy danh sách sinh viên trong phòng");
  }
  const data = await res.json();
  return data.data || [];
}
import { API_BASE_URL } from "@/config/apiConfig";

// ===================== DORM APPLICATION STATUS =====================
export async function updateDormApplicationStatus(id: string, status: 'approved' | 'rejected') {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Không thể cập nhật trạng thái đơn.');
  return res.json();
}

// ===================== CONTRACTS =====================
// Lấy danh sách hợp đồng của sinh viên đang đăng nhập
export async function getMyContracts() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hợp đồng của bạn");
  const data = await res.json();
  return data.data || [];
}

// Gia hạn hợp đồng
export async function renewalContract(contractId: string, data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/contracts/${contractId}/renewal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Không thể gia hạn hợp đồng");
  }
  return res.json();
}

// ===================== DORM AREA =====================
export interface DormAreaData {
  name: string;
  branch: string;
  address: string;
  fee: number;
  description: string;
  image: string;
  status: string;
}

export async function createDormArea(data: DormAreaData) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể tạo khu ký túc xá.');
  return res.json();
}

export async function updateDormArea(id: string, data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật khu ký túc xá.');
  return res.json();
}

export async function deleteDormArea(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error('Không thể xóa khu ký túc xá.');
  return res.json();
}

export async function getDormAreas() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-areas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách khu ký túc xá.');
  const data = await res.json();
  return data || [];
}

// ===================== REGISTRATION PERIODS =====================
export async function createRegistrationPeriod(data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể tạo đợt đăng ký.');
  return res.json();
}

export async function getRegistrationPeriods() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách đợt đăng ký.');
  const data = await res.json();
  return data || [];
}

export async function updateRegistrationPeriod(id: string, data: { [key: string]: unknown }) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật đợt đăng ký.');
  return res.json();
}

export async function deleteRegistrationPeriod(id: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error('Không thể xóa đợt đăng ký.');
  return res.json();
}
// Lấy danh sách đơn nguyện vọng
export async function getDormApplications() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách đơn nguyện vọng");
  const data = await res.json();
  return data.data || [];
}

// Duyệt đơn nguyện vọng (update status và phòng)
export async function approveDormApplication(id: string, room_id: string, status: 'approved' | 'rejected' = 'approved') {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-applications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ status, room_id })
  });
  if (!res.ok) throw new Error("Duyệt đơn thất bại");
  return await res.json();
}
// Đăng xuất phiên hiện tại
export async function logout(refreshToken: string) {
  const res = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" ,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Đăng xuất thất bại");
  }
  return await res.json();
}

// Làm mới access token từ refresh token
export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Làm mới phiên đăng nhập thất bại");
  }
  return await res.json();
}
// Đăng xuất toàn bộ phiên
export async function logoutAllSessions(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/logout-all`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" ,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Đăng xuất toàn bộ thất bại");
  }
  return await res.json();
}
// API for authentication and user profile
export async function getProfileDetail() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/test/getprofile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    throw new Error("Lấy thông tin profile thất bại");
  }
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'ngrok-skip-browser-warning': 'true',
     },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Đăng nhập thất bại");
  return await res.json();
}


interface ApiErrorBody {
  message?: string;
  error?: string;
}

export async function sendOtp(email: string, action: string = "dangkynguyenvong") {
  const res = await fetch(`${API_BASE_URL}/api/v1/send-otp`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" ,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ action, email })
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(data.message || data.error || "Gửi OTP thất bại");
  }
  return await res.json();
}

export async function verifyOtp(email: string, otp: string, action: string = "dangkynguyenvong") {
  const res = await fetch(`${API_BASE_URL}/api/v1/verify-otp`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" ,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ action, email, otp })
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(data.message || data.error || "Xác thực OTP thất bại");
  }
  return await res.json(); // expect { token: string }
}

export async function submitDormApplication(data: { [key: string]: unknown }, token?: string) {
  const formData = new FormData();
  // Map fields to formData (convert camelCase to snake_case if needed)
  if (data.student_id || data.studentId) formData.append("student_id", String(data.student_id || data.studentId));
  if (data.full_name || data.fullName) formData.append("full_name", String(data.full_name || data.fullName));
  if (data.dob) formData.append("dob", String(data.dob));
  if (data.gender) formData.append("gender", String(data.gender));
  if (data.cccd) formData.append("cccd", String(data.cccd));
  if (data.cccd_issue_date || data.cccdIssueDate) formData.append("cccd_issue_date", String(data.cccd_issue_date || data.cccdIssueDate));
  if (data.cccd_issue_place || data.cccdIssuePlace) formData.append("cccd_issue_place", String(data.cccd_issue_place || data.cccdIssuePlace));
  if (data.avatar_front || data.avatarFront) {
    const file = data.avatar_front || data.avatarFront;
    if (file instanceof Blob) formData.append("avatar_front", file);
  }
  if (data.avatar_back || data.avatarBack) {
    const file = data.avatar_back || data.avatarBack;
    if (file instanceof Blob) formData.append("avatar_back", file);
  }
  if (data.class || data.className) formData.append("class", String(data.class || data.className));
  if (data.course) formData.append("course", String(data.course));
  if (data.faculty) formData.append("faculty", String(data.faculty));
  if (data.ethnicity) formData.append("ethnicity", String(data.ethnicity));
  if (data.religion) formData.append("religion", String(data.religion));
  if (data.hometown) formData.append("hometown", String(data.hometown));
  if (data.guardian_name || data.guardianName) formData.append("guardian_name", String(data.guardian_name || data.guardianName));
  if (data.guardian_phone || data.guardianPhone) formData.append("guardian_phone", String(data.guardian_phone || data.guardianPhone));
  if (data.priority_proof || data.priorityProof) {
    const file = data.priority_proof || data.priorityProof;
    if (file instanceof Blob) formData.append("priority_proof", file);
  }
  if (data.preferred_site || data.preferredSite) formData.append("preferred_site", String(data.preferred_site || data.preferredSite));
  if (data.preferred_dorm || data.preferredDorm) formData.append("preferred_dorm", String(data.preferred_dorm || data.preferredDorm));
  if (data.priority_group || data.priorityGroup) formData.append("priority_group", String(data.priority_group || data.priorityGroup));
  if (data.admission_type || data.admissionType) formData.append("admission_type", String(data.admission_type || data.admissionType));
  if (data.notes) formData.append("notes", String(data.notes));
  if (data.email) formData.append("email", String(data.email));
  // Always append phone, even if empty string, to ensure BE always receives the field
  formData.append("phone", typeof data.phone !== 'undefined' && data.phone !== null ? String(data.phone) : "");
  if (data.status) formData.append("status", String(data.status));

  const effectiveToken = token || localStorage.getItem("ptit_access_token") || "";
  const res = await fetch(`${API_BASE_URL}/api/v1/dorm-applications`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${effectiveToken}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new Error(data.message || data.error || "Đăng ký thất bại");
  }
  return await res.json();
}

// Đổi avatar cho user hiện tại
export async function updateAvatar(avatarFile: File) {
  const token = localStorage.getItem("ptit_access_token");
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/me/avatar`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: formData
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Cập nhật avatar thất bại");
  }
  return await res.json();
}

// Đổi mật khẩu cho user hiện tại
export async function updatePassword(oldPassword: string, newPassword: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Đổi mật khẩu thất bại");
  }
  return await res.json();
}

// Lấy danh sách tất cả tài khoản (chỉ cho admin_system)
export async function getAllAccounts() {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách tài khoản");
  const data = await res.json();
  return data.data || [];
}

// Cập nhật thông tin cá nhân cho manager hoặc admin_system
export async function updateMyProfile(data: {
  fullname?: string;
  phone?: string;
  cccd?: string;
  dob?: string;
  province?: string;
  commune?: string;
  detail_address?: string;
}) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/me/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật thông tin cá nhân.');
  return res.json();
}

// Cập nhật trạng thái tài khoản user (chỉ cho admin_system)
export async function updateUserStatus(userId: string, status: string) {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Không thể cập nhật trạng thái tài khoản.');
  return res.json();
}