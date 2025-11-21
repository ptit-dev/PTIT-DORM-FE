

import React, { useEffect, useState } from "react";
import { Clipboard, Check } from "lucide-react";
import { getProfileDetail } from "@/features/auth/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("ptit_access_token");
    if (!token || !user) {
      navigate("/", { replace: true });
      return;
    }
    setLoading(true);
    getProfileDetail(token)
      .then((res) => {
        setProfile(res);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  
  const [copied, setCopied] = useState(false);
  // Helper to mask id
  const maskId = (id: string) => id ? id.slice(0, 4) + "..." + id.slice(-4) : "";

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
      </div>
    );
  }

  if (!profile) return null;

  // Nếu có manager thì hiển thị thông tin quản trị viên
  if (profile.manager) {
    const manager = profile.manager;
    // Lấy role từ localStorage nếu có
    const localUser = JSON.parse(localStorage.getItem("ptit_user") || "null");
    const roles = (localUser && localUser.roles) || manager.roles || [];
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
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow">Yêu cầu cập nhật</button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col md:flex-row gap-8">
                {/* Left: Avatar + Role */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                  <div className="w-40 h-56 rounded-lg border-4 border-red-600 shadow mb-4 overflow-hidden bg-gray-100">
                    <img
                      src={manager.avatar || "/src/assets/ptit-logo-new.png"}
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
                      <div className="text-gray-800">{profile.username}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase">Email</span>
                      <div className="text-gray-800">{profile.email}</div>
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
  const student = profile.student || {};
  const parents = profile.parents || [];
  const email = profile.email;
  const username = profile.username;
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto">
            {/* <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <span className="font-semibold">Đợt cập nhật hồ sơ</span>
                <span className="font-bold text-blue-700">"Đợt cập nhật hồ sơ"</span>
                <span className="text-gray-600">từ ngày</span>
                <span className="font-bold">01/11/2024</span>
                <span className="text-gray-600">đến ngày</span>
                <span className="font-bold">31/01/2026</span>
              </div>
            </div> */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2">
                <span>✏️</span> Cập nhật hồ sơ
              </button>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2">
                <span>📄</span> Đổi mật khẩu
              </button>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-4 py-2 rounded shadow flex items-center gap-2">
                <span>🖼️</span> Cập nhật ảnh nhận diện
              </button>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-center mb-8 tracking-wide">SƠ YẾU LÝ LỊCH</h2>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar + tên + roles */}
                <div className="flex-shrink-0 mx-auto md:mx-0 flex flex-col items-center justify-center">
                  <img
                    src={student.avatar || "/src/assets/ptit-logo-new.png"}
                    alt={student.fullname}
                    className="w-48 h-60 object-cover rounded-lg border-4 border-gray-200 shadow"
                  />
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
                      <div><span className="font-semibold">Mã sinh viên:</span> {username}</div>
                      <div><span className="font-semibold">Lớp:</span> {student.class}</div>
                      <div><span className="font-semibold">Khóa:</span> {student.course}</div>
                      <div><span className="font-semibold">Ngành:</span> {student.major}</div>
                      <div><span className="font-semibold">Loại hình đào tạo:</span> {student.type}</div>
                      <div className="md:col-start-2"><span className="font-semibold">Email:</span> {email}</div>
                    </div>
                  </div>
                  {/* Thông tin nhân thân: chỉ phụ huynh */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-red-700">Thông tin nhân thân (Phụ huynh)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parents.length > 0 ? parents.map((p: any) => (
                        <div key={p.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="font-semibold">{p.type}: {p.fullname}</div>
                          <div className="text-gray-700">SĐT: {p.phone}</div>
                          <div className="text-gray-700">Ngày sinh: {p.dob ? new Date(p.dob).toLocaleDateString() : ""}</div>
                          <div className="text-gray-700">Địa chỉ: {p.address}</div>
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
    </div>
  );
};

export default Profile;
