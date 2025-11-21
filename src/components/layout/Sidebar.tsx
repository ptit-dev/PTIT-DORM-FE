import { NavLink } from "react-router-dom";
import { Home, Newspaper, User, FileText, Calendar, GraduationCap, Briefcase, Layers, MessageSquare, ShieldCheck, Settings, Users, BookOpen, Library, DollarSign, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  roles?: string[];
  open?: boolean; // for mobile drawer
  onClose?: () => void;
}

// Menu config for each role, hỗ trợ submenu (accordion)
const MENU_CONFIG = {
  guest: [
    { to: "/home", icon: Home, label: "Trang chủ" },
    { to: "/news", icon: Newspaper, label: "Tin tức" },
    // { to: "/dorm-info", icon: Home, label: "Thông tin KTX" },
  ],
  student: [
    { to: "/home", icon: Home, label: "Trang chủ" },
    { to: "/news", icon: Newspaper, label: "Tin tức" },
    { to: "/profile", icon: User, label: "Thông tin cá nhân" },
    // { to: "/dorm-info", icon: FileText, label: "Thông tin KTX" },
    { to: "/my-contract", icon: FileText, label: "Hợp đồng của bạn" },
    { to: "/my-room-electric-bills", icon: DollarSign, label: "Hóa đơn tiền điện" },
    {
      label: "Dịch vụ nội trú",
      icon: Layers,
      submenu: [
        { to: "/facility-service", icon: FileText, label: "Cơ sở vật chất" },
        { to: "/room-change-service", icon: Briefcase, label: "Chuyển phòng" },
        { to: "/absence-service", icon: Calendar, label: "Tạm vắng/Tạm trú" },
      ],
    },
    {
      label: "Tài khoản & Hệ thống",
      icon: Settings,
      submenu: [
        { to: "/profile", icon: User, label: "Thông tin cá nhân" },
        { to: "/change-password", icon: LogOut, label: "Đổi mật khẩu" },
      ],
    },
  ],
  non_manager: [
    { to: "/home", icon: Home, label: "Trang chủ" },
    { to: "/news", icon: Newspaper, label: "Tin tức" },
    { to: "/profile", icon: User, label: "Thông tin cá nhân" },
    // { to: "/dorm-info", icon: FileText, label: "Thông tin KTX" },
    { to: "/dorm-areas", icon: FileText, label: "Khu vực KTX" },
    { to: "/registration-period", icon: FileText, label: "Thời gian đăng ký" },
    { to: "/application-list", icon: FileText, label: "Thông tin nguyện vọng" },
    { to: "/contract-info", icon: FileText, label: "Thông tin hợp đồng" },
    { to: "/manage-employee", icon: Users, label: "Quản lý nhân viên" },
    {to: "/duty-schedule", icon: Calendar, label: "Lịch trực" },
  ],
  manager: [
    { to: "/home", icon: Home, label: "Trang chủ" },
    { to: "/news", icon: Newspaper, label: "Tin tức" },
    { to: "/profile", icon: User, label: "Thông tin cá nhân" },
    // { to: "/dorm-info", icon: FileText, label: "Thông tin KTX" },
    { to: "/dorm-areas", icon: FileText, label: "Khu vực KTX" },
    { to: "/registration-period", icon: FileText, label: "Thời gian đăng ký" },
    { to: "/application-list", icon: FileText, label: "Thông tin nguyện vọng" },
    { to: "/contract-list", icon: FileText, label: "Danh sách hợp đồng" },
    { to: "/electric-bill-list", icon: DollarSign, label: "Hóa đơn tiền điện" },
    { to: "/manage-employee", icon: Users, label: "Quản lý nhân viên" },
    { to: "/duty-schedule", icon: Calendar, label: "Lịch trực" },
  ],
  admin_system: [
    { to: "/home", icon: ShieldCheck, label: "Dashboard" },
    { to: "/profile", icon: User, label: "Thông tin cá nhân" },
    {
      label: "Quản lý tài khoản",
      icon: Users,
      submenu: [
        { to: "/accounts/pending", label: "Chờ duyệt" },
        { to: "/accounts/locked", label: "Bị khóa" },
        { to: "/accounts/all", label: "Tất cả tài khoản" },
      ],
    },
    { to: "/roles", icon: User, label: "Phân quyền" },
    { to: "/logs", icon: Layers, label: "Nhật ký hệ thống" },
    { to: "/support", icon: MessageSquare, label: "Yêu cầu hỗ trợ" },
    {
      label: "Cài đặt hệ thống",
      icon: Settings,
      submenu: [
        { to: "/system/backup", label: "Sao lưu" },
        { to: "/system/update", label: "Cập nhật" },
      ],
    },
    { to: "/dorm-info", icon: FileText, label: "Thông tin KTX" },
  ],
};



function getMenuByRoles(roles) {
  // Ưu tiên admin > manager > student > guest
  if (roles?.includes("admin_system")) return { menu: MENU_CONFIG.admin_system, title: "Menu Admin" };
  if (roles?.includes("manager")) return { menu: MENU_CONFIG.manager, title: "Menu Quản lý" };
  if (roles?.includes("student")) return { menu: MENU_CONFIG.student, title: "Menu Sinh viên" };
  return { menu: MENU_CONFIG.guest, title: "Menu Khách" };
}



const Sidebar: React.FC<SidebarProps> = ({ roles, open = false, onClose }) => {
  const { menu, title } = getMenuByRoles(roles);
  const [accordion, setAccordion] = useState({});
  const toggle = (label: string) => setAccordion((o) => ({ ...o, [label]: !o[label] }));

  // Responsive: show as drawer on mobile, fixed on desktop
  // Height of header (fixed): 64px
  return (
    <>
      {/* Mobile: chỉ render sidebar khi open=true */}
      <div className="md:hidden">
        {open && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose}></div>
            <aside
              className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col select-none z-50 w-60 transition-transform duration-300"
              style={{ paddingTop: '64px' }}
            >
              <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pb-6 pr-2">
                <div className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
                  {title}
                </div>
                {menu.map((item) =>
                  item.submenu ? (
                    <div key={item.label}>
                      <button
                        onClick={() => toggle(item.label)}
                        className={`flex items-center gap-3 px-4 py-2 transition-all duration-200 text-base font-semibold w-full ${accordion[item.label] ? 'bg-gray-100 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <item.icon className="h-5 w-5" /> {item.label}
                        {accordion[item.label] ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
                      </button>
                      {accordion[item.label] && (
                        <div className="ml-10 flex flex-col gap-1">
                          {item.submenu.map((sub) => (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              className={({ isActive }) =>
                                `flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 text-sm font-medium ${isActive ? "bg-gray-200 text-red-700" : "text-gray-700 hover:bg-gray-100"}`
                              }
                              onClick={onClose}
                            >
                              {sub.icon && <sub.icon className="h-4 w-4" />} {sub.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded transition-all duration-200 text-base font-semibold ${isActive ? "bg-gray-200 text-red-700" : "text-gray-700 hover:bg-gray-100"}`
                        }
                      onClick={onClose}
                    >
                      <item.icon className="h-5 w-5" /> {item.label}
                    </NavLink>
                  )
                )}
              </nav>
            </aside>
          </>
        )}
      </div>
      {/* Desktop: luôn render sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 flex-col select-none z-30 w-52"
        style={{ paddingTop: 0 }}
      >
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pb-6 pr-2">
          <div className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider select-none">
            {title}
          </div>
          {menu.map((item) =>
            item.submenu ? (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`flex items-center gap-3 px-4 py-2 transition-all duration-200 text-base font-semibold w-full ${accordion[item.label] ? 'bg-gray-100 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <item.icon className="h-5 w-5" /> {item.label}
                  {accordion[item.label] ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
                </button>
                {accordion[item.label] && (
                  <div className="ml-10 flex flex-col gap-1">
                    {item.submenu.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 text-sm font-medium ${isActive ? "bg-gray-200 text-red-700" : "text-gray-700 hover:bg-gray-100"}`
                        }
                        onClick={onClose}
                      >
                        {sub.icon && <sub.icon className="h-4 w-4" />} {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded transition-all duration-200 text-base font-semibold ${isActive ? "bg-gray-200 text-red-700" : "text-gray-700 hover:bg-gray-100"}`
                }
                onClick={onClose}
              >
                <item.icon className="h-5 w-5" /> {item.label}
              </NavLink>
            )
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
