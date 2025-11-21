// import Dorm3D from "@/components/dashboard/Dorm3D";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import React from "react";
import { useNavigate } from "react-router-dom";

const DormInfo: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <Sidebar roles={user?.roles} />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4 text-red-700">Thông tin KTX</h2>
          <p className="text-gray-700">Chức năng này sẽ hiển thị thông tin chi tiết hơn của KTX.</p>
        </div>
        <div className="w-full max-w-6xl">
          {/* <Dorm3D /> */}
        </div>
      </main>
    </div>
  );
};

export default DormInfo;
