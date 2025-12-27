import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import {
	getDormAreas,
	createDormArea,
	updateDormArea,
	deleteDormArea,
} from "@/features/auth/api";

interface DormAreaType {
	id: string;
	image: string;
	name: string;
	branch: string;
	address: string;
	fee: number;
	description: string;
	status: string;
}

type DormAreaModalState = {
	open: boolean;
	data: DormAreaType | null;
};


const DormArea: React.FC = () => {
	const [areas, setAreas] = useState<DormAreaType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [modal, setModal] = useState<DormAreaModalState>({ open: false, data: null });
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [actionLoading, setActionLoading] = useState<boolean>(false);
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

	const fetchAreas = () => {
		setLoading(true);
		getDormAreas()
			.then((res: DormAreaType[] | { data: DormAreaType[] }) => {
				if (Array.isArray(res)) {
					setAreas(res);
				} else if ('data' in res && Array.isArray(res.data)) {
					setAreas(res.data);
				} else {
					setAreas([]);
				}
			})
			.catch((e: unknown) => {
				if (e instanceof Error) {
					setError(e.message);
				} else {
					setError("Đã xảy ra lỗi không xác định");
				}
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchAreas();
	}, []);

	// Handle create/edit submit
	const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setActionLoading(true);
		const form = e.currentTarget;
		const formData = new FormData(form);
		const data: Omit<DormAreaType, "id"> = {
			name: formData.get("name")?.toString() || "",
			branch: formData.get("branch")?.toString() || "",
			address: formData.get("address")?.toString() || "",
			fee: Number(formData.get("fee")),
			description: formData.get("description")?.toString() || "",
			image: formData.get("image")?.toString() || "",
			status: formData.get("status")?.toString() || "active",
		};
		try {
			if (modal.data && modal.data.id) {
				await updateDormArea(modal.data.id, data);
			} else {
				await createDormArea(data);
			}
			setModal({ open: false, data: null });
			fetchAreas();
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message || "Lỗi thao tác");
			} else {
				alert("Lỗi thao tác");
			}
		} finally {
			setActionLoading(false);
		}
	};

	// Handle delete
	const handleDelete = async () => {
		if (!deleteId) return;
		setActionLoading(true);
		try {
			await deleteDormArea(deleteId);
			setDeleteId(null);
			fetchAreas();
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message || "Lỗi xóa khu KTX");
			} else {
				alert("Lỗi xóa khu KTX");
			}
		} finally {
			setActionLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Header user={user} />
			<div className="flex flex-1">
				{/* Modal create/edit */}
				{modal.open && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<form
							className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative animate-fadeIn"
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
							<h3 className="text-2xl font-bold text-red-700 mb-6 text-center">{modal.data ? "Chỉnh sửa" : "Thêm mới"} khu ký túc xá</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
								<div>
									<label className="block font-semibold mb-1 text-red-700">Tên khu</label>
									<input name="name" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.name || ""} required />
								</div>
								<div>
									<label className="block font-semibold mb-1 text-red-700">Chi nhánh</label>
									<input name="branch" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.branch || ""} required />
								</div>
								<div>
									<label className="block font-semibold mb-1 text-red-700">Địa chỉ</label>
									<input name="address" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.address || ""} required />
								</div>
								<div>
									<label className="block font-semibold mb-1 text-red-700">Giá phòng (VNĐ/tháng)</label>
									<input name="fee" type="number" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.fee?.toString() || "0"} required min={0} />
								</div>
								<div className="md:col-span-2">
									<label className="block font-semibold mb-1 text-red-700">Mô tả</label>
									<textarea name="description" className="w-full border rounded px-3 py-2 min-h-[40px]" defaultValue={modal.data?.description || ""} />
								</div>
								<div className="md:col-span-2">
									<label className="block font-semibold mb-1 text-red-700">Ảnh (URL)</label>
									<input name="image" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.image || ""} required />
								</div>
								<div className="md:col-span-2">
									<label className="block font-semibold mb-1 text-red-700">Trạng thái</label>
									<select name="status" className="w-full border rounded px-3 py-2" defaultValue={modal.data?.status || "active"}>
										<option value="active">Đang hoạt động</option>
										<option value="inactive">Tạm dừng</option>
									</select>
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
				{/* Modal xác nhận xóa */}
				{deleteId && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn flex flex-col items-center">
							<h3 className="text-xl font-bold text-red-700 mb-4">Xác nhận xóa khu ký túc xá?</h3>
							<div className="mb-6 text-gray-700">Bạn có chắc chắn muốn xóa khu này không? Thao tác này không thể hoàn tác.</div>
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
					<div className="max-w-7xl mx-auto">
						<div className="flex justify-between items-center mb-8">
							<h2 className="text-3xl font-bold text-red-700">Danh sách các khu ký túc xá</h2>
							<button
								className="px-5 py-2 rounded bg-red-700 text-white font-bold hover:bg-red-800 shadow"
								onClick={() => setModal({ open: true, data: null })}
							>
								+ Thêm khu mới
							</button>
						</div>
						{loading ? (
							<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
						) : error ? (
							<div className="text-red-500 text-lg text-center py-10">{error}</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{areas.map((area) => (
									<div
										key={area.id}
										className="bg-white rounded-2xl shadow-lg border border-red-100 p-0 flex flex-col hover:shadow-2xl transition overflow-hidden"
									>
										<div className="relative w-full h-48 bg-gray-100">
											<img
												src={area.image}
												alt={area.name}
												className="object-cover w-full h-full"
											/>
											{area.status === "active" ? (
												<span className="absolute top-3 right-3 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Đang hoạt động</span>
											) : (
												<span className="absolute top-3 right-3 bg-gray-300 text-gray-700 text-xs font-bold px-3 py-1 rounded-full shadow">Tạm dừng</span>
											)}
										</div>
										<div className="flex-1 flex flex-col p-6 gap-2">
											<div className="flex items-center gap-3 mb-1">
												<div className="text-2xl font-bold text-red-700">{area.name}</div>
												<div className="text-sm bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold">{area.branch}</div>
											</div>
											<div className="text-gray-700 text-[15px] mb-1"><span className="font-semibold text-red-700">Địa chỉ:</span> {area.address}</div>
											<div className="text-gray-700 text-[15px] mb-1"><span className="font-semibold text-red-700">Giá phòng:</span> <span className="text-lg font-bold text-red-700">{area.fee.toLocaleString()}đ</span> /tháng</div>
											<div className="text-gray-700 text-[15px] mb-2"><span className="font-semibold text-red-700">Mô tả:</span> {area.description}</div>
											<div className="flex gap-2 mt-2">
												<button
													className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm"
													onClick={() => setModal({ open: true, data: area })}
												>
													Sửa
												</button>
												<button
													className="px-4 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700 text-sm"
													onClick={() => setDeleteId(area.id)}
												>
													Xóa
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default DormArea;
