import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getAllAccounts, updateUserStatus } from "@/features/auth/api";
import { ROLE_COLORS } from "@/constants/roleColors";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ShieldCheck } from "lucide-react";

interface Account {
  id: string;
  username: string;
  email: string;
  roles: string[];
  status?: string;
  created_at: string;
}

const AdminAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed token declaration
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUserId, setModalUserId] = useState<string | null>(null);
  const [modalCurrentStatus, setModalCurrentStatus] = useState<string | undefined>(undefined);
   const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  const handleOpenModal = (userId: string, currentStatus?: string) => {
    setModalUserId(userId);
    setModalCurrentStatus(currentStatus);
    setModalOpen(true);
  };

  const handleConfirmUpdateStatus = async (status: string) => {
    if (!modalUserId) return;
    const token = localStorage.getItem("ptit_access_token");
    if (!token) return;
    setUpdatingId(modalUserId);
    setModalOpen(false);
    try {
      await updateUserStatus(modalUserId, status);
      setAccounts((prev) => prev.map(acc => acc.id === modalUserId ? { ...acc, status } : acc));
      toast({
        title: "Cập nhật trạng thái thành công",
        description: "Trạng thái tài khoản đã được cập nhật.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Cập nhật trạng thái thất bại";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
      setModalUserId(null);
      setModalCurrentStatus(undefined);
    }
  };
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("ptit_access_token");
    const localUser = JSON.parse(localStorage.getItem("ptit_user") || "null");
    if (!token || !localUser || !localUser.roles?.includes("admin_system")) {
      navigate("/", { replace: true });
      return;
    }
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await getAllAccounts();
        setAccounts(res);
        setError(null);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Không thể tải danh sách tài khoản";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;
    const term = searchTerm.toLowerCase();
    return accounts.filter((acc) =>
      acc.username.toLowerCase().includes(term) ||
      acc.email.toLowerCase().includes(term)
    );
  }, [accounts, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card className="border-red-100 bg-white shadow-sm rounded-2xl">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-semibold text-red-800">
                      Quản lý tài khoản hệ thống
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Xem và quản lý quyền truy cập các tài khoản trong hệ thống KTX PTIT.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 sm:pb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Tổng số tài khoản: <span className="font-semibold text-red-700">{accounts.length}</span>
                  </p>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tên đăng nhập hoặc email..."
                      className="pl-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin text-red-600 mr-2" />
                Đang tải danh sách tài khoản...
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50/80 rounded-2xl">
                <CardContent className="py-4 text-sm text-red-700">
                  {error}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200 bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-700/95">
                          <TableHead className="text-white font-semibold w-12 text-center">#</TableHead>
                          <TableHead className="text-white font-semibold">Tên đăng nhập</TableHead>
                          <TableHead className="text-white font-semibold">Email</TableHead>
                          <TableHead className="text-white font-semibold w-48">Quyền</TableHead>
                          <TableHead className="text-white font-semibold w-48 text-center">Trạng thái</TableHead>
                          <TableHead className="text-white font-semibold w-32 text-center">Ngày tạo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccounts.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="py-8 text-center text-sm text-gray-500"
                            >
                              Không tìm thấy tài khoản phù hợp.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAccounts.map((acc, idx) => (
                            <TableRow
                              key={acc.id}
                              className="hover:bg-red-50/60 transition-colors"
                            >
                              <TableCell className="text-center text-sm text-gray-700">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {acc.username}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {acc.email}
                              </TableCell>
                              <TableCell className="text-sm text-gray-800">
                                <div className="flex flex-wrap gap-1">
                                  {acc.roles.map((role) => (
                                    <span
                                      key={role}
                                      className={`${
                                        ROLE_COLORS[role] ||
                                        "bg-gray-100 text-gray-700"
                                      } text-[11px] font-semibold px-2 py-0.5 rounded-full`}
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {role.replace(/_/g, " ")}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                                  <span
                                    className={
                                      acc.status === "active"
                                        ? "inline-block px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold"
                                        : "inline-block px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-[11px] font-semibold"
                                    }
                                  >
                                    {acc.status || "Chưa kích hoạt"}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={updatingId === acc.id}
                                    onClick={() => handleOpenModal(acc.id, acc.status)}
                                    className="h-7 px-3 text-[11px] border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                                  >
                                    {updatingId === acc.id ? "Đang cập nhật..." : "Cập nhật"}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm text-gray-700">
                                {new Date(acc.created_at).toLocaleDateString("vi-VN")}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            <UpdateStatusModal
              open={modalOpen}
              currentStatus={modalCurrentStatus}
              onClose={() => setModalOpen(false)}
              onConfirm={handleConfirmUpdateStatus}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAccounts;
