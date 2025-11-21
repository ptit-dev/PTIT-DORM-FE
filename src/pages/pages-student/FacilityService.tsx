import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const FacilityService: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">Dịch vụ cơ sở vật chất</h2>
            <div className="text-gray-600 text-center">Trang quản lý/yêu cầu về cơ sở vật chất (comming soon).</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacilityService;
