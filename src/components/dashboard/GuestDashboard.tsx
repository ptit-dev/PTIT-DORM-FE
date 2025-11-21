
import React from "react";
// import Dorm3D from "./Dorm3D";

const GuestDashboard: React.FC<{ user: any }> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="mb-2">Bạn đang đăng nhập với vai trò <b>guest</b>.</p>
      <p>Hệ thống KTX PTIT chào mừng bạn. Vui lòng liên hệ quản trị viên để được cấp quyền truy cập đầy đủ.</p>
      {user?.display_name && <div className="mt-4 text-gray-600">Tên tài khoản Microsoft: {user.display_name}</div>}
    </div>
  );
};

export default GuestDashboard;
