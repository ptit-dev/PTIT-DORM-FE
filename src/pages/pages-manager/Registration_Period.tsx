import React, { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
  getRegistrationPeriods,
  createRegistrationPeriod,
  updateRegistrationPeriod,
  deleteRegistrationPeriod,
} from "@/features/auth/api";
import { NotificationDialog } from "@/components/ui/notification-dialog";

interface RegistrationPeriodType {
  id: string;
  name: string;
  starttime: string;
  endtime: string;
  description: string;
  status: string;
}

interface RegistrationPeriodApiResponse {
  ok?: boolean;
  data?: RegistrationPeriodType[];
}

const RegistrationPeriod: React.FC = () => {
  const [periods, setPeriods] = useState<RegistrationPeriodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; data: RegistrationPeriodType | null }>({ open: false, data: null });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({
    open: false,
    title: "",
    description: "",
    type: "success",
  });

  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const showNotification = (title: string, description: string, type: "success" | "error") => {
    setNotification({ open: true, title, description, type });
  };

  const fetchPeriods = () => {
    setLoading(true);
    getRegistrationPeriods()
      .then((res: RegistrationPeriodApiResponse | RegistrationPeriodType[]) => {
        if (Array.isArray(res)) {
          setPeriods(res);
        } else if (res && Array.isArray(res.data)) {
          setPeriods(res.data);
        } else {
          setPeriods([]);
        }
      })
      .catch((e: Error) => showNotification("Lỗi", e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((v, k) => (data[k] = v.toString()));
    
    if (data.starttime) data.starttime = new Date(data.starttime).toISOString();
    if (data.endtime) data.endtime = new Date(data.endtime).toISOString();
    
    try {
      if (modal.data && modal.data.id) {
        await updateRegistrationPeriod(modal.data.id, data);
        showNotification("Thành công", "Cập nhật đợt đăng ký thành công", "success");
      } else {
        await createRegistrationPeriod(data);
        showNotification("Thành công", "Tạo đợt đăng ký mới thành công", "success");
      }
      setModal({ open: false, data: null });
      fetchPeriods();
    } catch (err) {
      if (err instanceof Error) {
        showNotification("Lỗi thao tác", err.message || "Lỗi thao tác", "error");
      } else {
        showNotification("Lỗi thao tác", "Đã xảy ra lỗi không xác định", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteRegistrationPeriod(deleteId);
      showNotification("Thành công", "Xóa đợt đăng ký thành công", "success");
      setDeleteId(null);
      fetchPeriods();
    } catch (err) {
      if (err instanceof Error) {
        showNotification("Lỗi xóa", err.message || "Lỗi xóa đợt đăng ký", "error");
      } else {
        showNotification("Lỗi xóa", "Đã xảy ra lỗi không xác định", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user} />
      <div className="flex flex-1">
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative animate-fadeIn"
              onSubmit={handleSave}
            >
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-red-700 text-2xl font-bold"
                type="button"
                onClick={() => setModal({ open: false, data: null })}
                aria-label="Đóng"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-red-700 mb-6 text-center">{modal.data && modal.data.id ? "Chỉnh sửa" : "Thêm mới"} đợt đăng ký</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-red-700">Tên đợt</label>
                  <input name="name" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.name || ""} required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-red-700">Trạng thái</label>
                  <select name="status" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.status || "active"}>
                    <option value="active">Kích hoạt</option>
                    <option value="inactive">Tạm dừng</option>
                    <option value="cancelled">Hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-red-700">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    name="starttime"
                    className="w-full border rounded px-3 py-2"
                    defaultValue={modal.data?.starttime ? new Date(modal.data.starttime as string).toISOString().slice(0, 16) : ""}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-red-700">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    name="endtime"
                    className="w-full border rounded px-3 py-2"
                    defaultValue={modal.data?.endtime ? new Date(modal.data.endtime as string).toISOString().slice(0, 16) : ""}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-red-700">Mô tả</label>
                  <textarea name="description" className="w-full border rounded px-3 py-2 min-h-[60px]" defaultValue={modal.data?.description || ""} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => setModal({ open: false, data: null })}
                  disabled={actionLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800 shadow"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        )}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn flex flex-col items-center">
              <h3 className="text-xl font-bold text-red-700 mb-4">Xác nhận xóa đợt đăng ký?</h3>
              <div className="mb-6 text-gray-700">Bạn có chắc chắn muốn xóa đợt này không? Thao tác này không thể hoàn tác.</div>
              <div className="flex gap-3">
                <button
                  className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => setDeleteId(null)}
                  disabled={actionLoading}
                >
                  Hủy
                </button>
                <button
                  className="px-6 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800 shadow"
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        )}
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-red-700">Các đợt đăng ký ký túc xá</h2>
              <button
                className="px-5 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800 shadow"
                onClick={() => setModal({ open: true, data: null })}
              >
                + Thêm đợt mới
              </button>
            </div>
            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : periods.length === 0 ? (
              <div className="text-gray-500 text-lg text-center py-10">Chưa có đợt đăng ký nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-red-100">
                  <div className="hidden md:flex items-center px-8 py-4 bg-red-700 text-white text-[16px] font-semibold rounded-t-2xl">
                    <div className="flex-1 min-w-[200px]">Tên đợt</div>
                    <div className="w-[200px] min-w-[150px]">Thời gian bắt đầu</div>
                    <div className="w-[200px] min-w-[150px]">Thời gian kết thúc</div>
                    <div className="w-[160px] min-w-[120px]">Trạng thái</div>
                    <div className="flex-1 min-w-[250px]">Mô tả</div>
                    <div className="w-[160px] min-w-[120px] text-center">Thao tác</div>
                  </div>
                  <div className="divide-y divide-red-100">
                    {periods.map((period) => {
                      const now = new Date();
                      const start = new Date(period.starttime as string);
                      const end = new Date(period.endtime as string);
                      let statusLabel = "Chưa bắt đầu";
                      let statusColor = "bg-blue-100 text-blue-700";
                      if (now >= start && now <= end) {
                        statusLabel = "Đang diễn ra";
                        statusColor = "bg-green-100 text-green-700";
                      } else if (now > end) {
                        statusLabel = "Đã kết thúc";
                        statusColor = "bg-gray-200 text-gray-600";
                      }
                      return (
                        <div key={String(period.id)} className="flex flex-col md:flex-row items-start md:items-center px-6 md:px-8 py-5 hover:bg-red-50/40 transition">
                          <div className="flex-1 min-w-[200px] font-medium text-red-700 text-lg mb-2 md:mb-0">{String(period.name)}</div>
                          <div className="w-[200px] min-w-[150px] text-gray-800 text-base mb-2 md:mb-0">{formatDate(period.starttime as string)}</div>
                          <div className="w-[200px] min-w-[150px] text-gray-800 text-base mb-2 md:mb-0">{formatDate(period.endtime as string)}</div>
                          <div className="w-[160px] min-w-[120px] mb-2 md:mb-0">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                          </div>
                          <div className="flex-1 min-w-[250px] text-gray-700 text-base mb-2 md:mb-0 truncate" title={String(period.description)}>{String(period.description) || "-"}</div>
                          <div className="w-[160px] min-w-[120px] flex gap-2 justify-center mt-2 md:mt-0">
                            <button
                              onClick={() => setModal({ open: true, data: period })}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
                            >
                              <PencilSquareIcon className="w-5 h-5 inline" />
                              Sửa
                            </button>
                            <button
                              onClick={() => setDeleteId(period.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-red-600 text-white text-base font-semibold hover:bg-red-700 transition"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification((prev) => ({ ...prev, open }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </div>
  );
};

export default RegistrationPeriod;