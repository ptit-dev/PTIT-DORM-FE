import { API_BASE_URL } from "@/config/apiConfig";

// ===================== DORM APPLICATION STATUS =====================
export async function updateDormApplicationStatus(token: string, id: string, status: 'approved' | 'rejected') {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-applications/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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
    },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách hợp đồng của bạn");
  const data = await res.json();
  return data.data || [];
}

// ===================== DORM AREA =====================
export async function createDormArea(token: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể tạo khu ký túc xá.');
  return res.json();
}

export async function updateDormArea(token: string, id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật khu ký túc xá.');
  return res.json();
}

export async function deleteDormArea(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-area/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Không thể xóa khu ký túc xá.');
  return res.json();
}

export async function getDormAreas(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/dorm-areas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách khu ký túc xá.');
  const data = await res.json();
  return data || [];
}

// ===================== REGISTRATION PERIODS =====================
export async function createRegistrationPeriod(token: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể tạo đợt đăng ký.');
  return res.json();
}

export async function getRegistrationPeriods(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Không thể lấy danh sách đợt đăng ký.');
  const data = await res.json();
  return data || [];
}

export async function updateRegistrationPeriod(token: string, id: string, data: any) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật đợt đăng ký.');
  return res.json();
}

export async function deleteRegistrationPeriod(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/protected/registration-periods/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Đăng xuất thất bại");
  }
  return await res.json();
}
// Đăng xuất toàn bộ phiên
export async function logoutAllSessions(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/logout-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Đăng xuất toàn bộ thất bại");
  }
  return await res.json();
}
// API for authentication and user profile
export async function getProfileDetail(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/test/getprofile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Lấy thông tin profile thất bại");
  return res.json();
}
export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Đăng nhập thất bại");
  return await res.json();
}
// API functions for OTP and dorm application

export async function sendOtp(email: string, action: string = "dangkynguyenvong") {
  const res = await fetch(`${API_BASE_URL}/api/v1/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, email })
  });
  if (!res.ok) throw new Error("Gửi OTP thất bại");
  return await res.json();
}

export async function verifyOtp(email: string, otp: string, action: string = "dangkynguyenvong") {
  const res = await fetch(`${API_BASE_URL}/api/v1/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, email, otp })
  });
  if (!res.ok) throw new Error("Xác thực OTP thất bại");
  return await res.json(); // expect { token: string }
}

export async function submitDormApplication(data: any, token: string) {
  const formData = new FormData();
  // Map fields to formData (convert camelCase to snake_case if needed)
  if (data.student_id || data.studentId) formData.append("student_id", data.student_id || data.studentId);
  if (data.full_name || data.fullName) formData.append("full_name", data.full_name || data.fullName);
  if (data.dob) formData.append("dob", data.dob);
  if (data.gender) formData.append("gender", data.gender);
  if (data.cccd) formData.append("cccd", data.cccd);
  if (data.cccd_issue_date || data.cccdIssueDate) formData.append("cccd_issue_date", data.cccd_issue_date || data.cccdIssueDate);
  if (data.cccd_issue_place || data.cccdIssuePlace) formData.append("cccd_issue_place", data.cccd_issue_place || data.cccdIssuePlace);
  if (data.avatar_front || data.avatarFront) formData.append("avatar_front", data.avatar_front || data.avatarFront);
  if (data.avatar_back || data.avatarBack) formData.append("avatar_back", data.avatar_back || data.avatarBack);
  if (data.class || data.className) formData.append("class", data.class || data.className);
  if (data.course) formData.append("course", data.course);
  if (data.faculty) formData.append("faculty", data.faculty);
  if (data.ethnicity) formData.append("ethnicity", data.ethnicity);
  if (data.religion) formData.append("religion", data.religion);
  if (data.hometown) formData.append("hometown", data.hometown);
  if (data.guardian_name || data.guardianName) formData.append("guardian_name", data.guardian_name || data.guardianName);
  if (data.guardian_phone || data.guardianPhone) formData.append("guardian_phone", data.guardian_phone || data.guardianPhone);
  if (data.priority_proof || data.priorityProof) formData.append("priority_proof", data.priority_proof || data.priorityProof);
  if (data.preferred_site || data.preferredSite) formData.append("preferred_site", data.preferred_site || data.preferredSite);
  if (data.preferred_dorm || data.preferredDorm) formData.append("preferred_dorm", data.preferred_dorm || data.preferredDorm);
  if (data.priority_group || data.priorityGroup) formData.append("priority_group", data.priority_group || data.priorityGroup);
  if (data.admission_type || data.admissionType) formData.append("admission_type", data.admission_type || data.admissionType);
  if (data.notes) formData.append("notes", data.notes);
  if (data.email) formData.append("email", data.email);
  // Always append phone, even if empty string, to ensure BE always receives the field
  formData.append("phone", typeof data.phone !== 'undefined' && data.phone !== null ? String(data.phone) : "");
  if (data.status) formData.append("status", data.status);

  const res = await fetch(`${API_BASE_URL}/api/v1/dorm-applications`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) throw new Error("Đăng ký thất bại");
  return await res.json();
}
