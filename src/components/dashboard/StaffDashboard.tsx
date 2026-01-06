import React from "react";
import { Link } from "react-router-dom";

interface StaffUser {
  id: string;
  name?: string;
}

const StaffDashboard: React.FC<{ user: StaffUser }> = () => (
  <>
    <h2 className="text-2xl font-bold mb-6 text-primary">
      Bảng điều khiển nhân sự quản túc
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-red-700">3</span>
        <span className="mt-2 text-gray-600 text-center">
          Ca trực trong tuần này
        </span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-amber-500">7</span>
        <span className="mt-2 text-gray-600 text-center">
          Phòng đang có khiếu nại CSVC
        </span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-blue-600">4</span>
        <span className="mt-2 text-gray-600 text-center">
          Hóa đơn điện cần kiểm tra
        </span>
      </div>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-emerald-600">5</span>
        <span className="mt-2 text-gray-600 text-center">
          Yêu cầu hỗ trợ đang mở
        </span>
      </div>
    </div>

    <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
        <h3 className="font-bold text-lg mb-3 text-red-700">Công việc hôm nay</h3>
        <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
          <li>Kiểm tra vệ sinh hành lang khu A tầng 3 trước 17:00.</li>
          <li>Tiếp nhận và cập nhật 2 phản ánh CSVC của sinh viên.</li>
          <li>Phối hợp bảo vệ kiểm tra giờ giới nghiêm sau 23:00.</li>
          <li>Rà soát danh sách sinh viên vắng mặt theo ca trực.</li>
        </ul>
      </div>
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="font-bold text-lg mb-3 text-blue-700">Lịch trực sắp tới</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="border-l-4 border-red-500 pl-3">
            <p className="font-semibold">Tối nay · 18:00 - 22:00</p>
            <p className="text-xs text-gray-500">Khu B - Tầng 2, kiểm tra sinh hoạt và an ninh.</p>
          </div>
          <div className="border-l-4 border-amber-500 pl-3">
            <p className="font-semibold">Ngày mai · 06:00 - 08:00</p>
            <p className="text-xs text-gray-500">Ghi nhận tình trạng phòng sau giờ nghỉ đêm.</p>
          </div>
          <div className="border-l-4 border-emerald-500 pl-3">
            <p className="font-semibold">Cuối tuần · 20:00 - 23:00</p>
            <p className="text-xs text-gray-500">Tăng cường kiểm tra giờ giới nghiêm toàn KTX.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="mb-4">
      <h3 className="font-bold text-lg mb-3 text-gray-800">Lối tắt thao tác nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <Link
          to="/duty-schedule"
          className="group bg-white rounded-lg shadow p-4 border border-gray-100 hover:border-red-200 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-red-700">
              Xem lịch trực
            </p>
            <p className="mt-1 text-gray-500">
              Theo dõi và cập nhật ca trực của bạn.
            </p>
          </div>
          <span className="mt-3 text-xs text-red-700 font-semibold group-hover:underline">
            Mở lịch trực
          </span>
        </Link>

        <Link
          to="/electric-bill-list"
          className="group bg-white rounded-lg shadow p-4 border border-gray-100 hover:border-red-200 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-red-700">
              Quản lý hóa đơn điện
            </p>
            <p className="mt-1 text-gray-500">
              Kiểm tra và đối soát các hóa đơn điện phòng.
            </p>
          </div>
          <span className="mt-3 text-xs text-red-700 font-semibold group-hover:underline">
            Xem danh sách hóa đơn
          </span>
        </Link>

        <Link
          to="/facility-complaints"
          className="group bg-white rounded-lg shadow p-4 border border-gray-100 hover:border-red-200 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-red-700">
              Khiếu nại CSVC
            </p>
            <p className="mt-1 text-gray-500">
              Theo dõi và xử lý phản ánh về cơ sở vật chất.
            </p>
          </div>
          <span className="mt-3 text-xs text-red-700 font-semibold group-hover:underline">
            Đi tới danh sách khiếu nại
          </span>
        </Link>
      </div>
    </section>
  </>
);

export default StaffDashboard;
