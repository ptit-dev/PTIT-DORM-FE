import React from "react";

const ManagerDashboard: React.FC<{ user: any }> = ({ user }) => (
  <>
    <h2 className="text-2xl font-bold mb-6 text-primary">Dashboard quản trị hệ thống</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-blue-600">1,250</span>
        <span className="mt-2 text-gray-600">Tài khoản đang sử dụng</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-yellow-600">23</span>
        <span className="mt-2 text-gray-600">Chờ duyệt</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-red-600">7</span>
        <span className="mt-2 text-gray-600">Bị khóa</span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-green-600">4</span>
        <span className="mt-2 text-gray-600">Yêu cầu hỗ trợ</span>
      </div>
    </div>
    <section className="mb-8">
      <h3 className="font-bold text-lg mb-2 text-blue-700">Quyền hạn của bạn</h3>
      <div className="bg-white rounded-lg shadow p-4 text-gray-700 text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>Quản lý toàn bộ tài khoản hệ thống</li>
          <li>Phê duyệt, khóa/mở khóa tài khoản</li>
          <li>Phân quyền, cập nhật thông tin người dùng</li>
          <li>Xem lịch sử hoạt động, nhật ký hệ thống</li>
          <li>Tiếp nhận và xử lý yêu cầu hỗ trợ tài khoản</li>
        </ul>
      </div>
    </section>
    <section className="mb-8">
      <h3 className="font-bold text-lg mb-2 text-red-700">Yêu cầu liên quan đến tài khoản</h3>
      <div className="bg-white rounded-lg shadow p-4 text-gray-700 text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>5 tài khoản yêu cầu mở khóa</li>
          <li>2 tài khoản yêu cầu cập nhật thông tin</li>
          <li>1 tài khoản báo cáo sự cố đăng nhập</li>
          <li>1 tài khoản yêu cầu cấp lại mật khẩu</li>
        </ul>
      </div>
    </section>
    <section className="mb-8">
      <h3 className="font-bold text-lg mb-2 text-green-700">Tình trạng hệ thống kỹ thuật</h3>
      <div className="space-y-3">
        {/* Status: Ổn định */}
        <div className="flex items-center bg-green-50 border-l-4 border-green-500 rounded p-3 shadow-sm">
          <span className="mr-3 text-green-600 text-xl">✔️</span>
          <div>
            <span className="font-semibold text-green-700">Ổn định:</span>
            <span className="ml-2 text-gray-700">Tất cả dịch vụ đang hoạt động bình thường.</span>
          </div>
        </div>
        {/* Status: Cảnh báo */}
        <div className="flex items-center bg-yellow-50 border-l-4 border-yellow-500 rounded p-3 shadow-sm">
          <span className="mr-3 text-yellow-600 text-xl">⚠️</span>
          <div>
            <span className="font-semibold text-yellow-700">Cảnh báo:</span>
            <span className="ml-2 text-gray-700">Có 1 bản cập nhật hệ thống đang chờ triển khai.</span>
          </div>
        </div>
        {/* Status: Không có lỗi nghiêm trọng */}
        <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 rounded p-3 shadow-sm">
          <span className="mr-3 text-blue-600 text-xl">ℹ️</span>
          <div>
            <span className="font-semibold text-blue-700">Thông tin:</span>
            <span className="ml-2 text-gray-700">Không có lỗi nghiêm trọng trong 7 ngày qua.</span>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default ManagerDashboard;
