import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getAllAccounts, updateUserStatus } from "@/features/auth/api";
import { ROLE_COLORS } from "@/constants/roleColors";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useNavigate } from "react-router-dom";

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
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
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
    setLoading(true);
    getAllAccounts()
      .then((res) => setAccounts(res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-red-700">Danh sách tài khoản hệ thống</h2>
            {loading ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-red-700">
                    <tr>
                      <th className="px-4 py-2 border text-white">STT</th>
                      <th className="px-4 py-2 border text-white">Tên đăng nhập</th>
                      <th className="px-4 py-2 border text-white">Email</th>
                      <th className="px-4 py-2 border text-white">Quyền</th>
                      <th className="px-4 py-2 border text-white">Trạng thái</th>
                      <th className="px-4 py-2 border text-white">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, idx) => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border text-center">{idx + 1}</td>
                        <td className="px-4 py-2 border">{acc.username}</td>
                        <td className="px-4 py-2 border">{acc.email}</td>
                        <td className="px-4 py-2 border">
                          {acc.roles.map((role) => (
                            <span
                              key={role}
                              className={`${ROLE_COLORS[role] || 'bg-gray-300 text-gray-800'} text-xs font-semibold px-2 py-0.5 rounded mr-1`}
                              style={{ textTransform: 'capitalize' }}
                            >
                              {role.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-2 border text-center">
                          <span className={
                            acc.status === "active"
                              ? "inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium"
                              : "inline-block px-2 py-1 rounded bg-gray-200 text-gray-600 text-xs font-medium"
                          }>
                            {acc.status || "-"}
                          </span>
                          <button
                            className="ml-2 px-2 py-1 rounded border text-xs font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background: '#f5f5f5',
                              borderColor: '#d1d5db',
                              color: '#374151',
                            }}
                            disabled={updatingId === acc.id}
                            title="Cập nhật trạng thái"
                            onClick={() => handleOpenModal(acc.id, acc.status)}
                          >
                            {updatingId === acc.id ? 'Đang cập nhật...' : 'Cập nhật'}
                          </button>
                              <UpdateStatusModal
                                open={modalOpen}
                                currentStatus={modalCurrentStatus}
                                onClose={() => setModalOpen(false)}
                                onConfirm={handleConfirmUpdateStatus}
                              />
                        </td>
                        {/* create at */}
                        <td className="px-4 py-2 border text-center">{new Date(acc.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAccounts;
