import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  FacilityComplaint,
  getAllFacilityComplaints,
  updateFacilityComplaintStatus,
  deleteFacilityComplaint,
} from "@/features/auth/facilityComplaintApi";

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "rejected", label: "Từ chối" },
];

const areaOptions: { value: string; label: string }[] = [
  { value: "", label: "Tất cả KTX" },
  { value: "B1", label: "Khu B1" },
  { value: "B2", label: "Khu B2" },
  { value: "B5", label: "Khu B5" },
  { value: "B0", label: "Khu B0 - Ngọc Trục" },
];

const floorOptions: { value: string; label: string }[] = [
  { value: "", label: "Tất cả tầng" },
  { value: "1", label: "Tầng 1" },
  { value: "2", label: "Tầng 2" },
  { value: "3", label: "Tầng 3" },
  { value: "4", label: "Tầng 4" },
  { value: "5", label: "Tầng 5" },
];

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Từ chối",
};

const FacilityComplaints: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const [complaints, setComplaints] = useState<FacilityComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("");
  const [floorFilter, setFloorFilter] = useState<string>("");

  const [selected, setSelected] = useState<FacilityComplaint | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FacilityComplaint | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFacilityComplaints();
      setComplaints(data || []);
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error) {
        setError(fetchError.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getAreaFromRoom = (roomId: string): string => {
    const parts = roomId.split("-");
    return parts[0] || "";
  };

  const getFloorFromRoom = (roomId: string): string => {
    const parts = roomId.split("-");
    if (parts.length < 2) {
      return "";
    }
    const suffix = parts[1];
    if (suffix.length === 0) {
      return "";
    }
    // Ví dụ: B1-305 => tầng 3
    return suffix.charAt(0);
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesStatus = statusFilter
        ? complaint.status.toLowerCase() === statusFilter.toLowerCase()
        : true;
      const area = getAreaFromRoom(complaint.room_id);
      const floor = getFloorFromRoom(complaint.room_id);
      const matchesArea = areaFilter ? area === areaFilter : true;
      const matchesFloor = floorFilter ? floor === floorFilter : true;
      const search = searchText.trim().toLowerCase();
      const matchesSearch = search
        ? complaint.title.toLowerCase().includes(search) ||
          complaint.room_id.toLowerCase().includes(search) ||
          (complaint.username && complaint.username.toLowerCase().includes(search)) ||
          (complaint.student_id && complaint.student_id.toLowerCase().includes(search))
        : true;
      return matchesStatus && matchesArea && matchesFloor && matchesSearch;
    });
  }, [complaints, statusFilter, areaFilter, floorFilter, searchText]);

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

  const handleOpenDetail = (complaint: FacilityComplaint) => {
    setSelected(complaint);
    setEditTitle(complaint.title);
    setEditDescription(complaint.description || "");
    setEditStatus(complaint.status || "pending");
    setDetailOpen(true);
  };

  const handleUpdateComplaint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) {
      return;
    }
    setUpdateSubmitting(true);
    try {
      const updated = await updateFacilityComplaintStatus(selected.id, editStatus);
      setDetailOpen(false);
      setSelected(null);
      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (updateError: unknown) {
      if (updateError instanceof Error) {
        // eslint-disable-next-line no-alert
        alert(updateError.message);
      } else {
        // eslint-disable-next-line no-alert
        alert("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteSubmitting(true);
    try {
      await deleteFacilityComplaint(deleteTarget.id);
      setComplaints((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (selected && selected.id === deleteTarget.id) {
        setDetailOpen(false);
        setSelected(null);
      }
    } catch (deleteError: unknown) {
      if (deleteError instanceof Error) {
        // eslint-disable-next-line no-alert
        alert(deleteError.message);
      } else {
        // eslint-disable-next-line no-alert
        alert("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setDeleteSubmitting(false);
    }
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
                  Quản lý khiếu nại cơ sở vật chất
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Theo dõi, xử lý và cập nhật trạng thái các khiếu nại từ sinh viên.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Tìm theo tiêu đề, phòng, mã sinh viên..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khu KTX
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={areaFilter}
                  onChange={(event) => setAreaFilter(event.target.value)}
                >
                  {areaOptions.map((option) => (
                    <option key={option.value || "all-areas"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tầng
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={floorFilter}
                  onChange={(event) => setFloorFilter(event.target.value)}
                >
                  {floorOptions.map((option) => (
                    <option key={option.value || "all-floors"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 self-start md:self-auto mt-2 md:mt-0"
                onClick={() => {
                  setStatusFilter("");
                  setSearchText("");
                  setAreaFilter("");
                  setFloorFilter("");
                }}
              >
                Đặt lại bộ lọc
              </button>
            </div>

            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">
                Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-gray-400 text-center py-10">
                Chưa có khiếu nại nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Mã</th>
                      <th className="p-4 text-left">Phòng</th>
                      <th className="p-4 text-left">Tiêu đề</th>
                      <th className="p-4 text-left">Mã sinh viên</th>
                      <th className="p-4 text-left">Minh chứng</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-left">Ngày tạo</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="border-b last:border-0 hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-xs font-mono text-gray-500 max-w-[80px] truncate">
                          {complaint.id}
                        </td>
                        <td className="p-4 font-semibold text-red-700">
                          {complaint.room_id}
                        </td>
                        <td className="p-4 max-w-xs truncate">
                          {complaint.title}
                        </td>
                        <td className="p-4 text-sm text-gray-700 font-mono">
                          {complaint.username || complaint.student_id || "-"}
                        </td>
                        <td className="p-4">
                          {complaint.proof ? (
                            <a
                              href={complaint.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={complaint.proof}
                                alt="Ảnh minh chứng khiếu nại"
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
                        <td className="p-4 text-center">
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              type="button"
                              className="px-4 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                              onClick={() => handleOpenDetail(complaint)}
                            >
                              Xem / cập nhật
                            </button>
                            <button
                              type="button"
                              className="px-4 py-1.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                              onClick={() => setDeleteTarget(complaint)}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal chi tiết & cập nhật */}
          {detailOpen && selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative">
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setDetailOpen(false)}
                  aria-label="Đóng"
                  disabled={updateSubmitting}
                >
                  ×
                </button>
                <h3 className="text-xl font-bold text-red-700 mb-2">
                  Chi tiết khiếu nại phòng {selected.room_id}
                </h3>
                <div className="mb-4 text-xs text-gray-500">
                  Mã: <span className="font-mono">{selected.id}</span>
                </div>
                <form
                  className={`space-y-4 ${
                    updateSubmitting ? "opacity-60 pointer-events-none" : ""
                  }`}
                  onSubmit={handleUpdateComplaint}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề
                      </label>
                      <input
                        className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-700"
                        value={selected.title}
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        className="border rounded px-3 py-2 w-full"
                        value={editStatus}
                        onChange={(event) => setEditStatus(event.target.value)}
                      >
                        {statusOptions
                          .filter((option) => option.value !== "")
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      className="border rounded px-3 py-2 w-full min-h-[120px] bg-gray-100 text-gray-700"
                      value={selected.description || ""}
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minh chứng
                    </label>
                    {selected.proof ? (
                      <a
                        href={selected.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <img
                          src={selected.proof}
                          alt="Ảnh minh chứng khiếu nại"
                          className="mt-1 max-h-56 rounded border object-contain"
                        />
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Chưa có minh chứng đính kèm. Minh chứng chỉ được sinh viên bổ sung khi khiếu nại ở trạng thái chờ xử lý.
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 mt-2">
                    <div>
                      <span className="font-medium">Tạo lúc:</span>{" "}
                      {selected.created_at
                        ? new Date(selected.created_at).toLocaleString()
                        : "-"}
                    </div>
                    <div>
                      <span className="font-medium">Cập nhật lúc:</span>{" "}
                      {selected.updated_at
                        ? new Date(selected.updated_at).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                      onClick={() => setDetailOpen(false)}
                      disabled={updateSubmitting}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
                      disabled={updateSubmitting}
                    >
                      {updateSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal xác nhận xóa */}
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
    </div>
  );
};

export default FacilityComplaints;
