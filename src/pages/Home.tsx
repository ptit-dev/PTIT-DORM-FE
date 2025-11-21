import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import WelcomeBanner from "@/components/intro/WelcomeBanner";
import NotificationCard, { Notification } from "@/components/intro/NotificationCard";
import EventCard, { Event } from "@/components/intro/EventCard";
import AdminSystemDashboard from "@/components/dashboard/AdminSystemDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  // Phân quyền: admin_system, student, guest
  const isAdmin = user?.roles?.includes("admin_system");
  const isStudent = user?.roles?.includes("student");
  const isGuest = user?.roles?.includes("guest");
  const isManager = user?.roles?.includes("manager");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <WelcomeBanner
              name={
                isAdmin
                  ? `Chào mừng quản trị viên${user?.display_name ? ", " + user.display_name : ""} đến hệ thống quản lý KTX!`
                  : isManager
                  ? `Chào mừng quản lý${user?.display_name ? ", " + user.display_name : ""} đến hệ thống quản lý KTX!`
                  : isStudent
                  ? `Chào mừng sinh viên nội trú${user?.display_name ? ", " + user.display_name : ""} đến hệ thống quản lý KTX!`
                  : isGuest
                  ? `Chào mừng khách${user?.display_name ? ", " + user.display_name : ""} đến hệ thống quản lý KTX!`
                  : "Chào mừng đến hệ thống quản lý KTX!"
              }
            />
            {isAdmin ? (
              <AdminSystemDashboard user={user} />
            ) : isManager ? (
              <ManagerDashboard user={user} />
            ) : isStudent ? (
              <StudentDashboard user={user} />
            ) : isGuest ? (
              <GuestDashboard user={user} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
