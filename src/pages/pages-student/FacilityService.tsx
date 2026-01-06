import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  FacilityComplaint,
  MyRoomComplaintsResponse,
  getMyRoomFacilityComplaints,
  createFacilityComplaint,
  deleteFacilityComplaint,
} from "@/features/auth/facilityComplaintApi";
import { NotificationDialog } from "@/components/ui/notification-dialog";

type TabKey = "me" | "room";

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Từ chối",
};

const FacilityService: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const [activeTab, setActiveTab] = useState<TabKey>("me");
  const [roomComplaints, setRoomComplaints] = useState<FacilityComplaint[]>([]);
  const [roomInfo, setRoomInfo] = useState<string>("");
  const [roomComplaintsLoading, setRoomComplaintsLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createProofFile, setCreateProofFile] = useState<File | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailComplaint, setDetailComplaint] = useState<FacilityComplaint | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<FacilityComplaint | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  const showNotification = (title: string, description: string, type: "success" | "error") => {
    setNotification({ open: true, title, description, type });
  };

  const loadRoomComplaints = async () => {
    setRoomComplaintsLoading(true);
    try {
      const data: MyRoomComplaintsResponse = await getMyRoomFacilityComplaints();
      setRoomInfo(data.room);
      setRoomComplaints(data.data || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const msg = error.message === "No approved contract with room found for this student"
          ? "Hệ thống không tìm thấy hợp đồng nội trú được duyệt của bạn."
          : error.message;
        showNotification("Thông báo", msg, "error");
      }
    } finally {
      setRoomComplaintsLoading(false);
    }
  };

  const studentId: string | undefined = user?.user_id;

  const myComplaints = useMemo(() => {
    if (!studentId) {
      return [];
    }
    return roomComplaints.filter((complaint) => complaint.student_id === studentId);
  }, [roomComplaints, studentId]);

  useEffect(() => {
    loadRoomComplaints();
  }, []);

  const handleOpenCreate = () => {
    setCreateTitle("");
    setCreateDescription("");
    setCreateProofFile(null);
    setCreateModalOpen(true);
  };

  const handleSubmitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomInfo) {
      showNotification("Lỗi", "Bạn chưa có phòng nội trú được duyệt nên không thể tạo khiếu nại.", "error");
      return;
    }
    if (!createTitle.trim()) {
      showNotification("Lỗi", "Vui lòng nhập tiêu đề khiếu nại.", "error");
      return;
    }

    setCreateSubmitting(true);
    try {
      await createFacilityComplaint({
        room_id: roomInfo,
        title: createTitle.trim(),
        description: createDescription.trim(),
        proofFile: createProofFile ?? undefined,
      });
      setCreateModalOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      setCreateProofFile(null);
      await loadRoomComplaints();
      showNotification("Thành công", "Gửi khiếu nại thành công.", "success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showNotification("Lỗi", error.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenDetail = (complaint: FacilityComplaint) => {
    setDetailComplaint(complaint);
    setDetailOpen(true);
  };

  const handleConfirmDelete = (complaint: FacilityComplaint) => {
    setDeleteTarget(complaint);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      await deleteFacilityComplaint(deleteTarget.id);
      setDeleteTarget(null);
      await loadRoomComplaints();
      showNotification("Thành công", "Đã xóa khiếu nại.", "success");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showNotification("Lỗi", error.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    let className = "bg-yellow-100 text-yellow-700";
    if (normalized === "resolved") {
      className = "bg-green-100 text-green-700";
    } else if (normalized === "rejected") {
      className = "bg-red-100 text-red-700";
    } else if (normalized === "in_progress") {
      className = "bg-blue-100 text-blue-700";
    }
    const label = statusLabelMap[normalized] || status;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
        {label}
      </span>
    );
  };

  const renderComplaintsTable = (complaints: FacilityComplaint[], isOwnList: boolean) => {
    if (roomComplaintsLoading) {
      return <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>;
    }
    if (complaints.length === 0) {
      return <div className="text-gray-400 text-center py-10">Chưa có khiếu nại nào.</div>;
    }
    return (
      <div className="overflow-x-auto rounded-2xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tiêu đề</th>
              <th className="p-4 text-left">Phòng</th>
              <th className="p-4 text-left">Minh chứng</th>
              <th className="p-4 text-left">Trạng thái</th>
              <th className="p-4 text-left">Ngày tạo</th>
              {isOwnList && <th className="p-4 text-center">Hành động</th>}
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="p-4 font-semibold text-gray-800 max-w-xs truncate">
                  {complaint.title}
                </td>
                <td className="p-4 font-semibold text-red-700">{complaint.room_id}</td>
                <td className="p-4">
                  {complaint.proof ? (
                    <a
                      href={complaint.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={complaint.proof}
                        alt="Minh chứng"
                        className="h-12 w-16 rounded border object-cover"
                      />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">Chưa có</span>
                  )}
                </td>
                <td className="p-4">{renderStatusBadge(complaint.status)}</td>
                <td className="p-4 text-gray-500">
                  {complaint.created_at
                    ? new Date(complaint.created_at).toLocaleString()
                    : "-"}
                </td>
                {isOwnList && (
                  <td className="p-4 text-center">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        type="button"
                        className="px-4 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        onClick={() => handleOpenDetail(complaint)}
                      >
                        Xem chi tiết
                      </button>
                      {complaint.status.toLowerCase() === "pending" && (
                        <button
                          type="button"
                          className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                          onClick={() => handleConfirmDelete(complaint)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-red-700 mb-1">
                  Khiếu nại cơ sở vật chất
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Gửi và theo dõi các khiếu nại liên quan đến phòng ở hiện tại của bạn.
                </p>
              </div>
              <button
                type="button"
                className="px-5 py-2 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 transition disabled:opacity-60"
                onClick={handleOpenCreate}
                disabled={!roomInfo}
              >
                + Tạo khiếu nại mới
              </button>
            </div>

            <div className="border-b border-gray-200 mb-4 flex flex-wrap">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === "me"
                    ? "border-red-600 text-red-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("me")}
              >
                Khiếu nại của tôi
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${activeTab === "room"
                    ? "border-red-600 text-red-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("room")}
              >
                Khiếu nại phòng hiện tại
              </button>
            </div>

            {activeTab === "room" && (
              <div className="mb-4 text-sm text-gray-600">
                {roomInfo ? (
                  <span>
                    Phòng hiện tại của bạn: <span className="font-semibold text-red-700">{roomInfo}</span>
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Bạn chưa có thông tin phòng ở.
                  </span>
                )}
              </div>
            )}

            {activeTab === "me"
              ? renderComplaintsTable(myComplaints, true)
              : renderComplaintsTable(roomComplaints, false)}
          </div>

          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative">
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={createSubmitting}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold text-red-700 mb-4 text-center">
                  Tạo khiếu nại cơ sở vật chất
                </h3>
                <form
                  className={`space-y-4 ${createSubmitting ? "opacity-60 pointer-events-none" : ""}`}
                  onSubmit={handleSubmitCreate}
                >
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Phòng</label>
                    <input
                      className="border rounded px-3 py-2 bg-gray-100 text-gray-700"
                      value={roomInfo || "Chưa xác định"}
                      disabled
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">
                      Tiêu đề <span className="text-red-600">*</span>
                    </label>
                    <input
                      className="border rounded px-3 py-2"
                      placeholder="Nhập tiêu đề ngắn gọn, rõ ràng"
                      value={createTitle}
                      onChange={(event) => setCreateTitle(event.target.value)}
                      required
                      disabled={createSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Mô tả chi tiết</label>
                    <textarea
                      className="border rounded px-3 py-2 min-h-[100px]"
                      placeholder="Mô tả chi tiết vấn đề, thời điểm phát hiện, mức độ ảnh hưởng..."
                      value={createDescription}
                      onChange={(event) => setCreateDescription(event.target.value)}
                      disabled={createSubmitting}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Ảnh/file minh chứng (tùy chọn)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setCreateProofFile(event.target.files?.[0] || null)}
                      disabled={createSubmitting}
                    />
                    {createProofFile && (
                      <div className="text-xs text-gray-500 mt-1">
                        Tệp đã chọn: {createProofFile.name}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                      onClick={() => setCreateModalOpen(false)}
                      disabled={createSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
                      disabled={createSubmitting}
                    >
                      {createSubmitting ? "Đang gửi..." : "Gửi khiếu nại"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {detailOpen && detailComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-8 relative">
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setDetailOpen(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h3 className="text-xl font-bold text-red-700 mb-2">Chi tiết khiếu nại</h3>
                <div className="mb-4 text-sm text-gray-500">
                  Mã: <span className="font-mono">{detailComplaint.id}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tiêu đề:</span>
                    <div className="mt-1 text-gray-900">{detailComplaint.title}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Phòng:</span>
                      <div className="mt-1 text-red-700 font-semibold">
                        {detailComplaint.room_id}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trạng thái:</span>
                      <div className="mt-1">{renderStatusBadge(detailComplaint.status)}</div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Mô tả:</span>
                    <div className="mt-1 text-gray-900 whitespace-pre-line">
                      {detailComplaint.description || "(Không có mô tả chi tiết)"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Minh chứng:</span>
                    <div className="mt-1">
                      {detailComplaint.proof ? (
                        <a
                          href={detailComplaint.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={detailComplaint.proof}
                            alt="Ảnh minh chứng khiếu nại"
                            className="mt-2 max-h-56 rounded border object-contain"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-500">Chưa có minh chứng đính kèm.</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 mt-2">
                    <div>
                      <span className="font-medium">Tạo lúc:</span>{" "}
                      {detailComplaint.created_at
                        ? new Date(detailComplaint.created_at).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      <span className="font-medium">Cập nhật lúc:</span>{" "}
                      {detailComplaint.updated_at
                        ? new Date(detailComplaint.updated_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => setDetailOpen(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setDeleteTarget(null)}
                  aria-label="Đóng"
                  disabled={deleteSubmitting}
                >
                  ×
                </button>
                <div className="text-lg font-semibold text-red-700 mb-4">
                  Bạn có chắc chắn muốn xóa khiếu nại này?
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Hành động này không thể hoàn tác. Khiếu nại sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleteSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
                    onClick={handleDelete}
                    disabled={deleteSubmitting}
                  >
                    {deleteSubmitting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </div>
            </div>
          )}
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

export default FacilityService;