import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
	getManagers,
	createManager,
	updateManager,
	deleteManager,
} from "@/features/auth/managerApi";

const initialForm = {
	fullname: "",
	phone: "",
	cccd: "",
	dob: "",
	province: "",
	commune: "",
	detail_address: "",
	email: "",
	username: "",
};

const ManageEmployee: React.FC = () => {
	const [managers, setManagers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState(initialForm);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
	const token = localStorage.getItem("ptit_access_token") || "";

	const fetchManagers = async () => {
		setLoading(true);
		try {
			const res = await getManagers(token);
			setManagers(res || []);
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchManagers();
		// eslint-disable-next-line
	}, []);

	const openAdd = () => {
		setEditId(null);
		setForm(initialForm);
		setAvatarFile(null);
		setModalOpen(true);
	};
	const openEdit = (m: any) => {
		setEditId(m.staff_id);
		setForm({
			fullname: m.fullname,
			phone: m.phone,
			cccd: m.cccd,
			dob: m.dob ? m.dob.slice(0, 10) : "",
			province: m.province,
			commune: m.commune,
			detail_address: m.detail_address,
			email: m.email,
			username: m.username,
		});
		setAvatarFile(null);
		setModalOpen(true);
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		const data = new FormData();
		Object.entries(form).forEach(([k, v]) => data.append(k, v));
		if (avatarFile) data.append("avatar", avatarFile);
		try {
			if (editId) {
				await updateManager(editId, data, token);
			} else {
				await createManager(data, token);
			}
			setModalOpen(false);
			fetchManagers();
		} catch (e: any) {
			alert(e.message);
		} finally {
			setSubmitting(false);
		}
	};
	const handleDelete = async () => {
		if (!deleteId) return;
		setSubmitting(true);
		try {
			await deleteManager(deleteId, token);
			setDeleteId(null);
			setConfirmDelete(false);
			fetchManagers();
		} catch (e: any) {
			alert(e.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Header user={user} />
			<div className="flex flex-1">
				<Sidebar roles={user?.roles} />
				<main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
					<div className="max-w-6xl mx-auto">
						<div className="flex justify-between items-center mb-8">
							<h2 className="text-3xl font-bold tracking-wide text-red-700">Danh sách cán bộ quản túc</h2>
							<button
								className="px-5 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
								onClick={openAdd}
							>
								Thêm nhân viên
							</button>
						</div>
						{loading ? (
							<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
						) : error ? (
							<div className="text-red-500 text-lg text-center py-10">{error}</div>
						) : managers.length === 0 ? (
							<div className="text-gray-400 text-center py-10">Chưa có nhân viên nào.</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{managers.map((m) => (
									<div key={m.staff_id} className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-lg transition">
										<div className="flex items-center gap-4">
											<img
												src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullname)}`}
												alt={m.fullname}
												className="w-20 h-20 rounded-full object-cover border"
											/>
											<div className="flex-1 min-w-0">
												<div className="font-semibold text-xl text-red-700 truncate">{m.fullname}</div>
												<div className="text-gray-700 text-sm truncate">{m.email} <span className="ml-2 text-xs text-gray-400">({m.username})</span></div>
												<div className="text-gray-500 text-xs">SĐT: {m.phone} | CCCD: {m.cccd}</div>
											</div>
										</div>
										<div className="text-gray-500 text-xs mt-1">Địa chỉ: {m.detail_address}, {m.commune}, {m.province}</div>
										<div className="text-gray-500 text-xs">Ngày sinh: {m.dob ? new Date(m.dob).toLocaleDateString() : ''}</div>
										<div className="flex gap-3 mt-2">
											<button
												className="px-4 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
												onClick={() => openEdit(m)}
											>
												Sửa
											</button>
											<button
												className="px-4 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
												onClick={() => { setDeleteId(m.staff_id); setConfirmDelete(true); }}
											>
												Xóa
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
					{/* Modal thêm/sửa nhân viên */}
					{modalOpen && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
							<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-10 relative">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
									onClick={() => setModalOpen(false)}
									aria-label="Đóng"
									disabled={submitting}
								>
									×
								</button>
								<h3 className="text-2xl font-bold text-red-700 mb-6 text-center">{editId ? "Sửa thông tin" : "Thêm nhân viên"}</h3>
								<form className={`space-y-6 ${submitting ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={handleSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="flex flex-col gap-2 md:col-span-2">
											<label className="font-medium text-gray-700">Ảnh đại diện</label>
											<input className="border rounded px-3 py-2" type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} disabled={submitting} />
											{avatarFile && (
												<div className="flex items-center gap-2 mt-2">
													<img src={URL.createObjectURL(avatarFile)} alt="avatar preview" className="w-16 h-16 rounded-full object-cover border" />
													<span className="text-xs text-gray-500">Ảnh xem trước</span>
												</div>
											)}
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Họ tên</label>
											<input className="border rounded px-3 py-2" placeholder="Họ tên" required value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Số điện thoại</label>
											<input className="border rounded px-3 py-2" placeholder="Số điện thoại" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">CCCD</label>
											<input className="border rounded px-3 py-2" placeholder="CCCD" required value={form.cccd} onChange={e => setForm(f => ({ ...f, cccd: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Ngày sinh</label>
											<input className="border rounded px-3 py-2" type="date" placeholder="Ngày sinh" required value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Tỉnh/TP</label>
											<input className="border rounded px-3 py-2" placeholder="Tỉnh/TP" required value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Xã/Phường</label>
											<input className="border rounded px-3 py-2" placeholder="Xã/Phường" required value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2 md:col-span-2">
											<label className="font-medium text-gray-700">Địa chỉ chi tiết</label>
											<input className="border rounded px-3 py-2" placeholder="Địa chỉ chi tiết" required value={form.detail_address} onChange={e => setForm(f => ({ ...f, detail_address: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Email</label>
											<input className="border rounded px-3 py-2" type="email" placeholder="Email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={submitting} />
										</div>
										<div className="flex flex-col gap-2">
											<label className="font-medium text-gray-700">Tên đăng nhập</label>
											<input className="border rounded px-3 py-2" placeholder="Tên đăng nhập" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={submitting} />
										</div>
									</div>
									<div className="flex justify-end gap-3 mt-8">
										<button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setModalOpen(false)} disabled={submitting}>Hủy</button>
										<button type="submit" className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition flex items-center gap-2" disabled={submitting}>
											{submitting && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
											{editId ? "Lưu" : "Thêm"}
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
					{/* Modal xác nhận xóa */}
					{confirmDelete && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
							<div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
								<button
									className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
									onClick={() => setConfirmDelete(false)}
									aria-label="Đóng"
									disabled={submitting}
								>
									×
								</button>
								<div className="text-lg font-semibold text-red-700 mb-4">Bạn có chắc chắn muốn xóa nhân viên này?</div>
								<div className="flex justify-end gap-3">
									<button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setConfirmDelete(false)} disabled={submitting}>Hủy</button>
									<button className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition" onClick={handleDelete} disabled={submitting}>
										{submitting && <svg className="animate-spin h-5 w-5 text-white inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
										Xóa
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

export default ManageEmployee;
