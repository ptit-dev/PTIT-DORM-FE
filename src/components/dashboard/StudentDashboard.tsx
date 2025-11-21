import React from "react";
import NotificationCard, { Notification } from "@/components/intro/NotificationCard";
import EventCard, { Event } from "@/components/intro/EventCard";
import WelcomeBanner from "@/components/intro/WelcomeBanner";

const notifications: Notification[] = [
  {
    id: "1",
    title: "Thông báo đóng tiền KTX tháng 12/2025",
    date: "05/11/2025",
    content: "Sinh viên lưu ý hoàn thành đóng tiền KTX trước ngày 25/11/2025 để tránh bị xử lý theo quy định.",
    isNew: true,
  },
  {
    id: "2",
    title: "Lịch phun khử khuẩn toàn KTX",
    date: "03/11/2025",
    content: "Toàn bộ KTX sẽ được phun khử khuẩn vào ngày 10/11/2025. Đề nghị sinh viên phối hợp và bảo quản tài sản cá nhân.",
  },
  {
    id: "3",
    title: "Cập nhật quy định nội trú mới",
    date: "01/11/2025",
    content: "Quy định mới về giờ giấc, an ninh, vệ sinh KTX áp dụng từ 15/11/2025.",
  },
];

const events: Event[] = [
  {
    id: "1",
    title: "Ngày hội sinh viên KTX 2025",
    date: "20/11/2025",
    description: "Sự kiện giao lưu, văn nghệ, thể thao dành cho toàn bộ sinh viên nội trú. Đăng ký tham gia tại văn phòng KTX.",
  },
  {
    id: "2",
    title: "Tập huấn phòng cháy chữa cháy",
    date: "18/11/2025",
    description: "Buổi tập huấn bắt buộc cho tất cả sinh viên nội trú về kỹ năng PCCC và thoát hiểm.",
  },
];

const StudentDashboard: React.FC<{ user: any }> = ({ user }) => (
  <>
    <WelcomeBanner name={user?.display_name || "Sinh viên"} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Notifications */}
      <section className="col-span-1">
        <h3 className="font-bold text-lg mb-2 text-red-700 flex items-center gap-2">Thông báo KTX</h3>
        {notifications.map(n => <NotificationCard key={n.id} notification={n} />)}
      </section>
      {/* Events */}
      <section className="col-span-1">
        <h3 className="font-bold text-lg mb-2 text-blue-700 flex items-center gap-2">Sự kiện KTX</h3>
        {events.length > 0 ? events.map(e => <EventCard key={e.id} event={e} />) : <div className="text-gray-400 text-sm">Không có sự kiện</div>}
      </section>
      {/* Hướng dẫn */}
      <section className="col-span-1">
        <h3 className="font-bold text-lg mb-2 text-green-700 flex items-center gap-2">Hướng dẫn nội trú</h3>
        <div className="bg-white rounded-lg shadow p-4 text-gray-700 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>Đăng ký, gia hạn, thanh toán KTX trực tuyến.</li>
            <li>Tuân thủ quy định về giờ giấc, an ninh, vệ sinh.</li>
            <li>Tham gia các hoạt động, sự kiện do KTX tổ chức.</li>
            <li>Báo cáo sự cố, góp ý qua hệ thống.</li>
          </ul>
        </div>
      </section>
    </div>
    <section className="mb-8">
      <h3 className="font-bold text-lg text-yellow-700 mb-2">Thông tin thêm</h3>
      <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">Các tiện ích, dịch vụ KTX sẽ được cập nhật tại đây.</div>
    </section>
  </>
);

export default StudentDashboard;
