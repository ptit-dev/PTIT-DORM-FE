import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { getRegistrationPeriods } from "@/features/auth/api";


const RegistrationPeriod: React.FC = () => {
	const [periods, setPeriods] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editModal, setEditModal] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  useEffect(() => {
    const token = localStorage.getItem("ptit_access_token");
    setLoading(true);
    getRegistrationPeriods(token)
      .then((res) => setPeriods(res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	// Handler for editing a period (open modal, etc.)
	const handleEdit = (period: any) => {
		setEditModal({ open: true, data: period });
	};

	const handleCloseModal = () => {
		setEditModal({ open: false, data: null });
	};

	// Dummy save handler
	const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// TODO: Call API to update
		setEditModal({ open: false, data: null });
	};

	// Handler for status change
	const handleStatusChange = (period: any, newStatus: string) => {
		// TODO: Call API to update status
		alert(`Đổi trạng thái ${period.name} thành ${newStatus}`);
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Header user={user} />
			<div className="flex flex-1">
				{/* Modal chỉnh sửa đợt đăng ký */}
				{editModal.open && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fadeIn">
							<button
								className="absolute top-3 right-4 text-gray-400 hover:text-red-700 text-2xl font-bold"
								onClick={handleCloseModal}
								aria-label="Đóng"
							>
								×
							</button>
							<h3 className="text-2xl font-bold text-red-700 mb-6 text-center">Chỉnh sửa đợt đăng ký</h3>
							<form onSubmit={handleSave} className="space-y-5">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block font-semibold mb-1 text-red-700">Tên đợt</label>
										<input
											className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
											defaultValue={editModal.data?.name || ""}
											name="name"
											required
										/>
									</div>
									<div>
										<label className="block font-semibold mb-1 text-red-700">Trạng thái</label>
										<select
											className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
											name="status"
											defaultValue={editModal.data?.status || "active"}
										>
											<option value="active">Kích hoạt</option>
											<option value="inactive">Tạm dừng</option>
											<option value="cancelled">Hủy</option>
										</select>
									</div>
									<div>
										<label className="block font-semibold mb-1 text-red-700">Thời gian bắt đầu</label>
										<input
											type="datetime-local"
											className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
											name="starttime"
											defaultValue={editModal.data?.starttime ? new Date(editModal.data.starttime).toISOString().slice(0,16) : ""}
											required
										/>
									</div>
									<div>
										<label className="block font-semibold mb-1 text-red-700">Thời gian kết thúc</label>
										<input
											type="datetime-local"
											className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
											name="endtime"
											defaultValue={editModal.data?.endtime ? new Date(editModal.data.endtime).toISOString().slice(0,16) : ""}
											required
										/>
									</div>
								</div>
								<div>
									<label className="block font-semibold mb-1 text-red-700">Mô tả</label>
									<textarea
										className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 min-h-[80px]"
										name="description"
										defaultValue={editModal.data?.description || ""}
									/>
								</div>
								<div className="flex justify-end gap-3 mt-6">
									<button
										type="button"
										className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
										onClick={handleCloseModal}
									>
										Hủy
									</button>
									<button
										type="submit"
										className="px-6 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800 shadow"
									>
										Lưu thay đổi
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
				<Sidebar roles={user?.roles} />
				<main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-3xl font-bold text-center mb-8 tracking-wide text-red-700">Các đợt đăng ký ký túc xá</h2>
						{loading ? (
							<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
						) : error ? (
							<div className="text-red-500 text-lg text-center py-10">{error}</div>
						) : periods.length === 0 ? (
							<div className="text-gray-500 text-lg text-center py-10">Chưa có đợt đăng ký nào.</div>
						) : (
							<div className="overflow-x-auto">
								{/* List style, no horizontal scroll */}
								<div className="bg-white rounded-2xl shadow-lg border border-red-100">
									{/* Header row */}
									<div className="hidden md:flex items-center px-8 py-4 bg-red-700 text-white text-[16px] font-semibold rounded-t-2xl">
										<div className="flex-1 min-w-[200px]">Tên đợt</div>
										<div className="w-[200px] min-w-[150px]">Thời gian bắt đầu</div>
										<div className="w-[200px] min-w-[150px]">Thời gian kết thúc</div>
										<div className="w-[160px] min-w-[120px]">Trạng thái</div>
										<div className="flex-1 min-w-[250px]">Mô tả</div>
										<div className="w-[120px] min-w-[100px] text-center">Thao tác</div>
									</div>
									<div className="divide-y divide-red-100">
										{periods.map((period) => {
											const now = new Date();
											const start = new Date(period.starttime);
											const end = new Date(period.endtime);
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
												<div key={period.id} className="flex flex-col md:flex-row items-start md:items-center px-6 md:px-8 py-5 hover:bg-red-50/40 transition">
													<div className="flex-1 min-w-[200px] font-medium text-red-700 text-lg mb-2 md:mb-0">{period.name}</div>
													<div className="w-[200px] min-w-[150px] text-gray-800 text-base mb-2 md:mb-0">{formatDate(period.starttime)}</div>
													<div className="w-[200px] min-w-[150px] text-gray-800 text-base mb-2 md:mb-0">{formatDate(period.endtime)}</div>
													<div className="w-[160px] min-w-[120px] mb-2 md:mb-0">
														<span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
													</div>
													<div className="flex-1 min-w-[250px] text-gray-700 text-base mb-2 md:mb-0 truncate" title={period.description}>{period.description || "-"}</div>
													<div className="w-[120px] min-w-[100px] flex justify-center">
														<button
															onClick={() => handleEdit(period)}
															className="inline-flex items-center gap-2 px-5 py-2 rounded bg-red-700 text-white text-base font-semibold hover:bg-red-800 transition"
														>
															<PencilSquareIcon className="w-6 h-6 inline" />
															Sửa
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
		</div>
	);
};

export default RegistrationPeriod;
