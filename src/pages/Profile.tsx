import React, { useEffect, useState, useRef } from "react";
import { Clipboard, Check } from "lucide-react";
import { getProfileDetail, updateAvatar, updatePassword, updateMyProfile } from "@/features/auth/api";
import { NotificationDialog } from "@/components/ui/notification-dialog";

// Modal chỉnh sửa thông tin cá nhân cho manager
interface EditInfoData {
  fullname: string;
  phone: string;
  cccd: string;
  dob: string;
  province: string;
  commune: string;
  detail_address: string;
}

function EditInfoModal({ open, onClose, info, onSave }: { open: boolean, onClose: () => void, info: EditInfoData, onSave: (data: EditInfoData) => void }) {
  const [form, setForm] = useState({
    fullname: info.fullname || "",
    phone: info.phone || "",
    cccd: info.cccd || "",
    dob: info.dob || "",
    province: info.province || "",
    commune: info.commune || "",
    detail_address: info.detail_address || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError("Lỗi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl flex flex-col gap-3">
        <h2 className="text-lg font-bold mb-2">Chỉnh sửa thông tin cá nhân</h2>
        <input name="fullname" className="border rounded px-3 py-2" placeholder="Họ tên" value={form.fullname} onChange={handleChange} />
        <input name="phone" className="border rounded px-3 py-2" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
        <input name="cccd" className="border rounded px-3 py-2" placeholder="CCCD" value={form.cccd} onChange={handleChange} />
        <input name="dob" type="date" className="border rounded px-3 py-2" placeholder="Ngày sinh" value={form.dob} onChange={handleChange} />
        <input name="province" className="border rounded px-3 py-2" placeholder="Tỉnh/Thành" value={form.province} onChange={handleChange} />
        <input name="commune" className="border rounded px-3 py-2" placeholder="Xã/Phường" value={form.commune} onChange={handleChange} />
        <input name="detail_address" className="border rounded px-3 py-2" placeholder="Địa chỉ chi tiết" value={form.detail_address} onChange={handleChange} />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>Huỷ</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? "Đang lưu..." : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}

// Modal gửi yêu cầu chỉnh sửa thông tin cá nhân cho non-manager
function RequestEditInfoModal({ open, onClose, info, onSend }: { open: boolean, onClose: () => void, info: EditInfoData, onSend: (data: EditInfoData) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl flex flex-col gap-3 items-center">
        <h2 className="text-lg font-bold mb-2 text-center">Chức năng chỉnh sửa thông tin</h2>
        <div className="flex flex-col items-center gap-2 my-4">
          <span className="text-2xl">🚧</span>
          <span className="text-xl font-semibold text-gray-700">Coming soon</span>
        </div>
        <div className="text-center text-gray-600 text-base mt-2">
          Vui lòng liên hệ quản lý KTX để được thay đổi thông tin cá nhân.
        </div>
        <button type="button" className="mt-6 px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
// Modal đổi avatar
function AvatarModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    return () => { setPreview(null); };
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const res = await updateAvatar(file);
      onSuccess(res.data || res.url || "");
      onClose();
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        setError((err as { message: string }).message || "Lỗi cập nhật ảnh");
      } else {
        setError("Lỗi cập nhật ảnh");
      }
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Cập nhật ảnh đại diện</h2>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="mb-3"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        {preview && <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-full border mb-3" />}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>Huỷ</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || !file}>{loading ? "Đang lưu..." : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}
// Modal đổi mật khẩu
function PasswordModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess: () => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [oldTouched, setOldTouched] = useState(false);
  const [newTouched, setNewTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const isStrongPassword = (value: string): boolean => {
    // Ít nhất 8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPasswordRegex.test(value);
  };

  const oldValid = oldPassword.trim().length > 0;
  const hasMinLength = newPassword.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const newValid = isStrongPassword(newPassword);
  const confirmValid = confirmPassword.length > 0 && confirmPassword === newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess(); onClose(); }, 1200);
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        setError((err as { message: string }).message || "Đổi mật khẩu thất bại");
      } else {
        setError("Đổi mật khẩu thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Đổi mật khẩu</h2>
        <input
          type="password"
          className={`px-3 py-2 border rounded w-full ${
            oldTouched ? (oldValid ? "border-green-500" : "border-red-500") : "mb-2"
          }`}
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          onBlur={() => setOldTouched(true)}
        />
        {oldTouched && (
          <div className={`w-full text-xs mb-2 ${oldValid ? "text-green-600" : "text-red-500"}`}>
            {oldValid ? "Mật khẩu cũ đã được nhập." : "Vui lòng nhập mật khẩu cũ."}
          </div>
        )}
        <input
          type="password"
          className={`px-3 py-2 border rounded w-full ${
            newTouched ? (newValid ? "border-green-500" : "border-red-500") : "mb-1"
          }`}
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          onBlur={() => setNewTouched(true)}
        />
        <div className="w-full text-xs text-gray-500 mb-2">
          <p className="mb-1">Mật khẩu mới phải bao gồm:</p>
          <ul className="space-y-0.5">
            <li className={hasMinLength ? "text-green-600" : "text-gray-500"}>• Ít nhất 8 ký tự</li>
            <li className={hasUppercase ? "text-green-600" : "text-gray-500"}>• Chữ hoa (A-Z)</li>
            <li className={hasLowercase ? "text-green-600" : "text-gray-500"}>• Chữ thường (a-z)</li>
            <li className={hasDigit ? "text-green-600" : "text-gray-500"}>• Số (0-9)</li>
            <li className={hasSpecial ? "text-green-600" : "text-gray-500"}>• Ký tự đặc biệt (!@#$...)</li>
          </ul>
        </div>
        <input
          type="password"
          className={`px-3 py-2 border rounded w-full ${
            confirmTouched ? (confirmValid ? "border-green-500" : "border-red-500") : "mb-2"
          }`}
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmTouched(true)}
        />
        {confirmTouched && confirmPassword.length > 0 && (
          <div className={`w-full text-xs mb-1 ${confirmValid ? "text-green-600" : "text-red-500"}`}>
            {confirmValid ? "Mật khẩu nhập lại khớp." : "Mật khẩu nhập lại chưa khớp."}
          </div>
        )}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">Đổi mật khẩu thành công!</div>}
        <div className="flex gap-2 mt-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={loading}>Huỷ</button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={loading || !oldValid || !newValid || !confirmValid}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<{ [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("ptit_access_token");
    const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
    if (!token || !user) {
      navigate("/", { replace: true });
      return;
    }
    setLoading(true);
      getProfileDetail()
      .then((res) => {
        setProfile(res);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Move all hooks to top-level, not inside conditionals
  const [copied, setCopied] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  // avatarUrl will be initialized later depending on manager/student
  const [avatarUrl, setAvatarUrl] = useState<string>("/src/assets/ptit-logo-new.png");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editInfoModalOpen, setEditInfoModalOpen] = useState(false);
  const [requestEditModalOpen, setRequestEditModalOpen] = useState(false);
  const handleAvatarSuccess = (url: string) => {
    setAvatarUrl(url);
    const userLS = JSON.parse(localStorage.getItem("ptit_user") || "null");
    if (userLS) {
      const newUser = { ...userLS, avatar: url };
      localStorage.setItem("ptit_user", JSON.stringify(newUser));
    }
  };

  const maskId = (id: string) => id ? id.slice(0, 4) + "..." + id.slice(-4) : "";

  const handlePasswordSuccess = () => {
    setPasswordModalOpen(false);
    setTimeout(() => {
      setPasswordModalOpen(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar roles={user?.roles} />
          <main className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-gray-500 text-lg">Đang tải thông tin cá nhân...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar roles={user?.roles} />
          <main className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-red-500 text-lg">{error}</div>
          </main>
        </div>
        <NotificationDialog
          open={!!error}
          onOpenChange={(open) => !open && setError(null)}
          title="Lỗi"
          description={error || ""}
          type="error"
        />
      </div>
    );
  }

  if (!profile) return null;

  interface Manager {
    id: string;
    avatar?: string;
    fullname: string;
    roles?: string[];
    phone?: string;
    cccd?: string;
    dob?: string;
    province?: string;
    commune?: string;
    detail_address?: string;
    [key: string]: unknown;
  }

  if (profile.manager) {
    const manager = profile.manager as Manager;
    const localUser = JSON.parse(localStorage.getItem("ptit_user") || "null") as { roles?: string[] };
    const roles = (localUser && localUser.roles) || (manager && manager.roles) || [];
    if (avatarUrl === "/src/assets/ptit-logo-new.png" && manager.avatar) {
      setAvatarUrl(manager.avatar);
    }
    const canEditInfo = Array.isArray(roles) && (roles.includes("manager") || roles.includes("admin_system"));
    const handleEditInfoSave = async (data: EditInfoData) => {
      const token = localStorage.getItem("ptit_access_token");
      if (!token) throw new Error("Không tìm thấy token");
        await updateMyProfile(data);
      setProfile((prev) => prev ? { ...prev, manager: { ...(prev as { manager: Manager }).manager, ...data } } : prev);
      const userLS = JSON.parse(localStorage.getItem("ptit_user") || "null");
      if (userLS) {
        const newUser = { ...userLS, ...data };
        localStorage.setItem("ptit_user", JSON.stringify(newUser));
      }
    };
    const handleRequestEdit = async (data: EditInfoData) => {
      // TODO: Gửi yêu cầu chỉnh sửa thông tin cá nhân đến manager
      // await sendEditRequest(data);
    };
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header user={user}/>
        <div className="flex flex-1">
          <Sidebar roles={roles} />
          <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-red-700">Thông tin quản trị viên</h2>
                <div className="flex gap-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow">Refresh</button>
                  {/* Nút chỉnh sửa hoặc gửi yêu cầu */}
                  {canEditInfo ? (
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow" onClick={() => setEditInfoModalOpen(true)}>
                      Chỉnh sửa thông tin cá nhân
                    </button>
                  ) : (
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded shadow" onClick={() => setRequestEditModalOpen(true)}>
                      Gửi yêu cầu chỉnh sửa thông tin
                    </button>
                  )}
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <span>📄</span> Đổi mật khẩu
                </button>
                <button
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                  onClick={() => setAvatarModalOpen(true)}
                >
                  <span>🖼️</span> Cập nhật ảnh nhận diện
                </button>
              </div>
              <PasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSuccess={handlePasswordSuccess} />
              <AvatarModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} onSuccess={handleAvatarSuccess} />
              <EditInfoModal
                open={editInfoModalOpen}
                onClose={() => setEditInfoModalOpen(false)}
                info={{
                  fullname: manager.fullname || "",
                  phone: manager.phone || "",
                  cccd: manager.cccd || "",
                  dob: manager.dob || "",
                  province: manager.province || "",
                  commune: manager.commune || "",
                  detail_address: manager.detail_address || ""
                }}
                onSave={handleEditInfoSave}
              />
              <RequestEditInfoModal
                open={requestEditModalOpen}
                onClose={() => setRequestEditModalOpen(false)}
                info={{
                  fullname: manager.fullname || "",
                  phone: manager.phone || "",
                  cccd: manager.cccd || "",
                  dob: manager.dob || "",
                  province: manager.province || "",
                  commune: manager.commune || "",
                  detail_address: manager.detail_address || ""
                }}
                onSend={handleRequestEdit}
              />
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col md:flex-row gap-8">
                {/* Left: Avatar + Role */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                  <div className="w-40 h-56 rounded-lg border-4 border-red-600 shadow mb-4 overflow-hidden bg-gray-100 relative group">
                    <img
                      src={avatarUrl}
                      alt={manager.fullname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-lg font-bold text-gray-800 mb-1 text-center">{manager.fullname}</div>
                  {roles && roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {roles.map((role: string) => (
                        <span key={role} className="bg-yellow-400 text-white text-xs font-semibold px-2 py-0.5 rounded mr-1">{role}</span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Right: Info Table */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[16px]">
                    <div>
                      <span className="text-gray-500 text-xs uppercase">ID</span>
                      <div className="font-mono text-gray-800 break-all flex items-center gap-2">
                        {maskId(manager.id)}
                        <button
                          className="ml-1 w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition"
                          onClick={() => {
                            navigator.clipboard.writeText(manager.id);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 500);
                          }}
                          title="Copy user id"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Username</span>
                      <div className="text-gray-800">{String(profile.username)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Email</span>
                      <div className="text-gray-800">{String(profile.email)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Số điện thoại</span>
                      <div className="text-gray-800">{manager.phone}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">CCCD</span>
                      <div className="text-gray-800">{manager.cccd}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Ngày sinh</span>
                      <div className="text-gray-800">{manager.dob ? new Date(manager.dob).toLocaleDateString() : ""}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Tỉnh/Thành</span>
                      <div className="text-gray-800">{manager.province}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Xã/Phường</span>
                      <div className="text-gray-800">{manager.commune}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 text-xs uppercase">Địa chỉ chi tiết</span>
                      <div className="text-gray-800">{manager.detail_address}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Nếu không có manager thì hiển thị thông tin sinh viên
  interface Student {
    avatar?: string;
    fullname?: string;
    dob?: string;
    cccd?: string;
    province?: string;
    commune?: string;
    detail_address?: string;
    phone?: string;
    class?: string;
    course?: string;
    major?: string;
    type?: string;
    [key: string]: unknown;
  }
  const student: Student = (profile.student as Student) || {};
  interface Parent {
    id: string;
    fullname?: string;
    phone?: string;
    dob?: string;
    address?: string;
    type?: string;
    [key: string]: unknown;
  }
  const parents: Parent[] = Array.isArray(profile.parents) ? profile.parents as Parent[] : [];
  const email = profile.email;
  const username = profile.username;
  // Set avatarUrl if not already set and student.avatar exists
  if (avatarUrl === "/src/assets/ptit-logo-new.png" && student.avatar) {
    setAvatarUrl(student.avatar);
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto">
            {/* <div className="mb-4">
              ...existing code...
            </div> */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2">
                <span>✏️</span> Cập nhật hồ sơ
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                onClick={() => setPasswordModalOpen(true)}
              >
                <span>📄</span> Đổi mật khẩu
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
                onClick={() => setAvatarModalOpen(true)}
              >
                <span>🖼️</span> Cập nhật ảnh nhận diện
              </button>
            </div>
            <PasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} onSuccess={handlePasswordSuccess} />
            <AvatarModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} onSuccess={handleAvatarSuccess} />
            <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-center mb-8 tracking-wide">SƠ YẾU LÝ LỊCH</h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar + tên + roles */}
                <div className="flex-shrink-0 mx-auto md:mx-0 flex flex-col items-center justify-center relative group">
                  <img
                    src={avatarUrl}
                    alt={student.fullname}
                    className="w-48 h-60 object-cover rounded-lg border-4 border-gray-200 shadow"
                  />
                  <button type="button" onClick={() => setAvatarModalOpen(true)}
                    className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs border border-gray-300 shadow group-hover:opacity-100 opacity-0 group-hover:scale-100 scale-95 transition"
                  >Đổi ảnh</button>
                  <AvatarModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} onSuccess={handleAvatarSuccess} />
                  <div className="mt-4 text-center">
                    <div className="font-bold text-xl">{student.fullname}</div>
                    {Array.isArray(user?.roles) && user.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {user.roles.map((role: string) => (
                          <span key={role} className="bg-yellow-400 text-white text-xs font-semibold px-2 py-0.5 rounded mr-1">{role}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Thông tin sinh viên: cơ bản + học tập */}
                <div className="flex-1 space-y-6">
                  {/* Thông tin cơ bản */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-red-700">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[16px]">
                      <div><span className="font-semibold">Ngày sinh:</span> {student.dob ? new Date(student.dob).toLocaleDateString() : ""}</div>
                      <div><span className="font-semibold">CCCD:</span> {student.cccd}</div>
                      <div><span className="font-semibold">Tỉnh/Thành:</span> {student.province}</div>
                      <div><span className="font-semibold">Xã/Phường:</span> {student.commune}</div>
                      <div><span className="font-semibold">Địa chỉ chi tiết:</span> {student.detail_address}</div>
                      <div><span className="font-semibold">Số điện thoại:</span> {student.phone}</div>
                    </div>
                  </div>
                  {/* Thông tin học tập */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-red-700">Thông tin học tập</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[16px]">
                      <div><span className="font-semibold">Mã sinh viên:</span> {String(username)}</div>
                      <div><span className="font-semibold">Lớp:</span> {student.class}</div>
                      <div><span className="font-semibold">Khóa:</span> {student.course}</div>
                      <div><span className="font-semibold">Ngành:</span> {student.major}</div>
                      <div><span className="font-semibold">Loại hình đào tạo:</span> {student.type}</div>
                      <div className="md:col-start-2"><span className="font-semibold">Email:</span> {String(email)}</div>
                    </div>
                  </div>
                  {/* Thông tin nhân thân: chỉ phụ huynh */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-red-700">Thông tin nhân thân (Phụ huynh)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parents.length > 0 ? parents.map((p: Parent) => (
                        <div key={p.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="font-semibold">{p.type}: {p.fullname}</div>
                          <div className="text-gray-700">SĐT: {p.phone}</div>
                          {/* <div className="text-gray-700">Ngày sinh: {p.dob ? new Date(p.dob).toLocaleDateString() : ""}</div>
                          <div className="text-gray-700">Địa chỉ: {p.address}</div> */}
                        </div>
                      )) : <div className="text-gray-500 italic">Chưa cập nhật phụ huynh</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <NotificationDialog
        open={!!error}
        onOpenChange={(open) => !open && setError(null)}
        title="Thông báo"
        description={error || ""}
        type="error"
      />
    </div>
  );
};

export default Profile;
