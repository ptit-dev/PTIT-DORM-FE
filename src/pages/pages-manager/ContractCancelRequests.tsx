import React, { useEffect, useState } from "react";
import { ContractCancelRequest, verifyContractCancelRequest } from "@/features/auth/contractCancelApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

// Dummy: Replace with real API
const fetchCancelRequests = async (): Promise<ContractCancelRequest[]> => {
  const token = localStorage.getItem("ptit_access_token");
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/protected/contract-cancel-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Không thể lấy danh sách yêu cầu hủy hợp đồng");
  const data = await res.json();
  return data || [];
};

const ContractCancelRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<ContractCancelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContractCancelRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchCancelRequests();
      setRequests(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-60 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-6">Yêu cầu hủy hợp đồng</h2>
            {loading ? (
              <div>Đang tải...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Mã hợp đồng</th>
                      <th className="p-3 text-left">Lý do</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Ghi chú quản lý</th>
                      <th className="p-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="p-3 font-mono">{r.contract_id}</td>
                        <td className="p-3">{r.reason}</td>
                        <td className="p-3">
                          {r.status === "pending" ? (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Chờ duyệt</span>
                          ) : r.status === "approved" ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Đã duyệt</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Đã từ chối</span>
                          )}
                        </td>
                        <td className="p-3">{r.manager_note || "—"}</td>
                        <td className="p-3 text-center">
                          {r.status === "pending" && (
                            <Button size="sm" onClick={() => { setSelected(r); setModalOpen(true); }}>
                              Duyệt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal duyệt */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu hủy hợp đồng</DialogTitle>
          </DialogHeader>
          {selected && (
            <VerifyForm request={selected} onClose={() => setModalOpen(false)} onSuccess={handleSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VerifyForm: React.FC<{ request: ContractCancelRequest; onClose: () => void; onSuccess: () => void }> = ({ request, onClose, onSuccess }) => {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [managerNote, setManagerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await verifyContractCancelRequest(request.id, { status, manager_note: managerNote });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-semibold">Trạng thái</label>
        <select
          className="w-full border rounded p-2 mt-1"
          value={status}
          onChange={e => setStatus(e.target.value as "approved" | "rejected")}
          disabled={loading}
        >
          <option value="approved">Chấp thuận hủy hợp đồng</option>
          <option value="rejected">Từ chối yêu cầu</option>
        </select>
      </div>
      <div>
        <label className="font-semibold">Ghi chú quản lý</label>
        <Textarea
          value={managerNote}
          onChange={e => setManagerNote(e.target.value)}
          placeholder="Nhập ghi chú (nếu có)"
          disabled={loading}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>Đóng</Button>
        <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </div>
      <NotificationDialog
        open={!!error}
        onOpenChange={(open) => !open && setError(null)}
        title="Thông báo"
        description={error || ""}
        type="error"
      />
    </div>
  );
};

export default ContractCancelRequestsPage;
