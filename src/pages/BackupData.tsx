import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import { backupData } from "@/features/admin/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Download,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  HardDrive,
  Lock,
} from "lucide-react";

const BackupData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const { toast } = useToast();

  const handleBackup = async () => {
    setLoading(true);
    if (!user?.roles?.includes("admin_system")) {
      toast({
        variant: "destructive",
        title: "Lỗi quyền hạn",
        description: "Bạn không có quyền thực hiện chức năng này.",
      });
      setLoading(false);
      return;
    }
    try {
      const blob = await backupData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_data_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLastBackup(new Date());
      toast({
        title: "Backup thành công",
        description: "Dữ liệu hệ thống đã được tải về thành công.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Backup thất bại";
      toast({
        variant: "destructive",
        title: "Lỗi backup",
        description: message,
      });
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <Card className="border-red-100 bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700/90 text-white">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-red-800">
                    Sao lưu dữ liệu hệ thống
                  </CardTitle>
                  <p className="text-sm text-red-700/70 mt-1">
                    Tạo bản sao lưu toàn bộ dữ liệu hệ thống KTX PTIT
                  </p>
                </div>
              </CardHeader>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Action Card */}
              <div className="lg:col-span-2 space-y-6">
                {/* Backup Action Card */}
                <Card className="border-red-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                  <CardHeader className="border-b border-red-100 bg-white">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                      <Download className="h-5 w-5" />
                      Tạo bản sao lưu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Bảo vệ dữ liệu</p>
                          <p className="text-gray-600 text-xs">
                            Sao lưu toàn bộ dữ liệu: hóa đơn, hợp đồng, tài khoản, cài đặt hệ thống.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Nén an toàn</p>
                          <p className="text-gray-600 text-xs">
                            Dữ liệu sẽ được nén thành file ZIP duy nhất, dễ dàng lưu trữ và chuyển giao.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Quy trình đơn giản</p>
                          <p className="text-gray-600 text-xs">
                            Chỉ cần một click để khởi động sao lưu, file sẽ được tải về máy của bạn.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <Button
                        onClick={handleBackup}
                        disabled={loading}
                        size="lg"
                        className="w-full bg-red-700 hover:bg-red-800 text-white shadow-sm rounded-lg h-11"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Đang tạo sao lưu...
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5 mr-2" />
                            Tải bản sao lưu ngay
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {lastBackup
                          ? `Lần cuối sao lưu: ${lastBackup.toLocaleString("vi-VN")}`
                          : "Chưa sao lưu lần nào"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Warning Card */}
                <Card className="border-amber-200 bg-amber-50/50 rounded-2xl">
                  <CardContent className="p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">Lưu ý quan trọng</p>
                      <p className="text-amber-800 mt-1 text-xs">
                        Vui lòng sao lưu dữ liệu định kỳ (tối thiểu hàng tuần) để bảo vệ các
                        thông tin quan trọng. Lưu trữ file sao lưu ở nơi an toàn.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Info Cards */}
              <div className="space-y-4">
                {/* Status Card */}
                <Card className="border-emerald-200 bg-emerald-50/50 rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <p className="font-medium text-emerald-900">Trạng thái hệ thống</p>
                    </div>
                    <p className="text-2xl font-semibold text-emerald-700">Bình thường</p>
                    <p className="text-xs text-emerald-700/70 mt-2">
                      Hệ thống đang hoạt động ổn định.
                    </p>
                  </CardContent>
                </Card>

                {/* Database Info Card */}
                <Card className="border-gray-200 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                      <Database className="h-4 w-4 text-red-700" />
                      Thông tin sao lưu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Loại sao lưu</p>
                      <p className="font-medium text-gray-900 mt-0.5">Toàn bộ hệ thống</p>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500">Định dạng</p>
                      <p className="font-medium text-gray-900 mt-0.5">ZIP (nén)</p>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500">Quyền truy cập</p>
                      <p className="font-medium text-gray-900 mt-0.5">Admin system</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice Card */}
                <Card className="border-blue-200 bg-blue-50/50 rounded-2xl">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-blue-900 mb-2">🔒 Bảo mật</p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      File sao lưu chứa dữ liệu nhạy cảm. Lưu giữ ở nơi an toàn và hạn chế
                      quyền truy cập.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer Info */}
            <Card className="border-gray-200 bg-white/50 rounded-2xl">
              <CardContent className="p-4 text-center text-xs text-gray-600">
                <p>
                  Dữ liệu sao lưu bao gồm: tài khoản, hợp đồng, hóa đơn, thông tin phòng ở,
                  lịch trực, cài đặt hệ thống và các dữ liệu liên quan khác.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BackupData;
