import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import { backupData } from "@/features/admin/api";

const BackupData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const handleBackup = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!user?.roles?.includes("admin_system")) {
      setError("Bạn không có quyền thực hiện chức năng này.");
      setLoading(false);
      return;
    }
    try {
      const blob = await backupData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup_data.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || "Backup thất bại");
      } else {
        setError("Backup thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-xl mx-auto mt-16 bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-700 mb-6">Backup dữ liệu hệ thống</h2>
            <p className="mb-8 text-gray-700 text-center">Chức năng này cho phép admin_system tải về toàn bộ dữ liệu hệ thống dưới dạng file <b>backup.zip</b>.</p>
            <button
              className="px-6 py-3 bg-red-700 text-white font-semibold rounded-lg shadow hover:bg-red-800 transition mb-4 disabled:opacity-60"
              onClick={handleBackup}
              disabled={loading}
            >
              {loading ? "Đang backup..." : "Tải file backup.zip"}
            </button>
            {success && <div className="text-green-600 font-medium mt-2">Backup thành công! File đã được tải về.</div>}
            {error && <div className="text-red-500 font-medium mt-2">{error}</div>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BackupData;
