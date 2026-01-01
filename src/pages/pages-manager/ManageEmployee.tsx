import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import { AddressField } from "@/components/forms/AddressField";
import { validateEmployeeField } from "@/utils/employeeValidation";
import {
	getManagers,
	createManager,
	updateManager,
	deleteManager,
} from "@/features/auth/managerApi";

const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => {
	if (!message) return null;
	return <span className="text-red-500 text-xs mt-1">{message}</span>;
};

interface FormFieldProps {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	colSpan?: boolean;
	value: string;
	error?: string;
	onChange: (value: string) => void;
	helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
	label,
	name,
	type = "text",
	placeholder,
	required,
	disabled,
	readOnly,
	colSpan,
	value,
	error,
	onChange,
	helperText
}) => (
	<div className={`flex flex-col gap-2 ${colSpan ? 'md:col-span-2' : ''}`}>
		<label className="font-medium text-gray-700">
			{label} {required && <span className="text-red-500">*</span>}
		</label>
		<input 
			className={`border rounded px-3 py-2 ${readOnly ? 'bg-gray-100' : ''} ${error ? 'border-red-500' : ''}`}
			type={type}
			placeholder={placeholder || label}
			required={required}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			disabled={disabled}
			readOnly={readOnly}
		/>
		<ErrorMessage message={error} />
		{helperText && <span className="text-gray-500 text-xs">{helperText}</span>}
	</div>
);

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
	const [managers, setManagers] = useState<{ [key: string]: unknown }[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState(initialForm);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [dialog, setDialog] = useState<{ open: boolean; type: 'error' | 'success'; title: string; description: string }>({ open: false, type: 'error', title: '', description: '' });
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

	const fetchManagers = async () => {
		setLoading(true);
		try {
			const res = await getManagers();
			setManagers(res || []);
		} catch (e: unknown) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("Đã xảy ra lỗi không xác định.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchManagers();
	}, []);



	const openAdd = () => {
		setEditId(null);
		setForm(initialForm);
		setAvatarFile(null);
		setErrors({});
		setModalOpen(true);
	};
	const openEdit = (m: { [key: string]: unknown }) => {
		setEditId(m.staff_id as string);
		setForm({
			fullname: m.fullname as string,
			phone: m.phone as string,
			cccd: m.cccd as string,
			dob: m.dob ? (m.dob as string).slice(0, 10) : "",
			province: m.province as string,
			commune: m.commune as string,
			detail_address: m.detail_address as string,
			email: m.email as string,
			username: m.username as string,
		});
		setAvatarFile(null);
		setErrors({});
		setModalOpen(true);
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		
		const newErrors: { [key: string]: string } = {};
		Object.keys(form).forEach(key => {
			const error = validateEmployeeField(key, form[key as keyof typeof form]);
			if (error) newErrors[key] = error;
		});
		
		if (!editId && !avatarFile) {
			newErrors.avatar = 'Ảnh đại diện bắt buộc khi tạo mới';
		}
		
		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) {
			const errorMessages = Object.values(newErrors).join(', ');
			setDialog({ open: true, type: 'error', title: 'Vui lòng kiểm tra lại các trường nhập liệu', description: errorMessages });
			setSubmitting(false);
			return;
		}
		
		const data = new FormData();
		Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
		if (avatarFile) data.append("avatar", avatarFile);
		
		console.log("Form data being submitted:", Object.fromEntries(data.entries()));
		
		try {
			if (editId) {
				await updateManager(editId, data);
				setDialog({ open: true, type: 'success', title: 'Thành công', description: 'Cập nhật thông tin nhân viên thành công' });
			} else {
				await createManager(data);
				setDialog({ open: true, type: 'success', title: 'Thành công', description: 'Thêm nhân viên mới thành công' });
			}
			setModalOpen(false);
			fetchManagers();
		} catch (e: unknown) {
			if (e instanceof Error) {
				setDialog({ open: true, type: 'error', title: 'Có lỗi xảy ra', description: e.message });
			} else {
				setDialog({ open: true, type: 'error', title: 'Lỗi', description: 'Đã xảy ra lỗi không xác định' });
			}
		} finally {
			setSubmitting(false);
		}
	};
	const handleDelete = async () => {
		if (!deleteId) return;
		setSubmitting(true);
		try {
			await deleteManager(deleteId);
			setDialog({ open: true, type: 'success', title: 'Thành công', description: 'Xóa nhân viên thành công' });
			setDeleteId(null);
			setConfirmDelete(false);
			fetchManagers();
		} catch (e: unknown) {
			if (e instanceof Error) {
				setDialog({ open: true, type: 'error', title: 'Có lỗi xảy ra', description: e.message });
			} else {
				setDialog({ open: true, type: 'error', title: 'Lỗi', description: 'Đã xảy ra lỗi không xác định' });
			}
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
									<div key={String(m.staff_id)} className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-lg transition">
										<div className="flex items-center gap-4">
											<img
												src={String(m.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(String(m.fullname))}`}
												alt={String(m.fullname)}
												className="w-20 h-20 rounded-full object-cover border"
											/>
											<div className="flex-1 min-w-0">
												<div className="font-semibold text-xl text-red-700 truncate">{String(m.fullname)}</div>
												<div className="text-gray-700 text-sm truncate">{String(m.email)} <span className="ml-2 text-xs text-gray-400">({String(m.username)})</span></div>
												<div className="text-gray-500 text-xs">SĐT: {String(m.phone)} | CCCD: {String(m.cccd)}</div>
											</div>
										</div>
										<div className="text-gray-500 text-xs mt-1">Địa chỉ: {String(m.detail_address)}, {String(m.commune)}, {String(m.province)}</div>
										<div className="text-gray-500 text-xs">Ngày sinh: {m.dob ? new Date(m.dob as string).toLocaleDateString() : ''}</div>
										<div className="flex gap-3 mt-2">
											<button
												className="px-4 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
												onClick={() => openEdit(m)}
											>
												Sửa
											</button>
											<button
												className="px-4 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
												onClick={() => { setDeleteId(String(m.staff_id)); setConfirmDelete(true); }}
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
											<label className="font-medium text-gray-700">
												Ảnh đại diện {!editId && <span className="text-red-500">*</span>}
											</label>
											<input 
												className={`border rounded px-3 py-2 ${errors.avatar ? 'border-red-500' : ''}`} 
												type="file" 
												accept="image/*" 
												onChange={e => {
													const file = e.target.files?.[0] || null;
													setAvatarFile(file);
													if (!editId && !file) {
														setErrors(prev => ({ ...prev, avatar: 'Ảnh đại diện bắt buộc khi tạo mới' }));
													} else {
														const { avatar, ...rest } = errors;
														setErrors(rest);
													}
												}} 
												disabled={submitting} 
											/>
											{errors.avatar && <span className="text-red-500 text-xs mt-1">{errors.avatar}</span>}
											{avatarFile && (
												<div className="flex items-center gap-2 mt-2">
													<img src={URL.createObjectURL(avatarFile)} alt="avatar preview" className="w-16 h-16 rounded-full object-cover border" />
													<span className="text-xs text-gray-500">Ảnh xem trước</span>
												</div>
											)}
										</div>
										<FormField
											label="Họ tên"
											name="fullname"
											value={form.fullname}
											onChange={(value) => {
												setForm(f => ({ ...f, fullname: value }));
												const error = validateEmployeeField('fullname', value);
												setErrors(prev => ({ ...prev, fullname: error }));
											}}
											error={errors.fullname}
											required
											disabled={submitting}
										/>
										<FormField
											label="Số điện thoại"
											name="phone"
											value={form.phone}
											onChange={(value) => {
												setForm(f => ({ ...f, phone: value }));
												const error = validateEmployeeField('phone', value);
												setErrors(prev => ({ ...prev, phone: error }));
											}}
											error={errors.phone}
											required
											disabled={submitting}
										/>
										<FormField
											label="CCCD"
											name="cccd"
											value={form.cccd}
											onChange={(value) => {
												setForm(f => ({ ...f, cccd: value }));
												const error = validateEmployeeField('cccd', value);
												setErrors(prev => ({ ...prev, cccd: error }));
											}}
											error={errors.cccd}
											required
											disabled={submitting}
										/>
										<FormField
											label="Ngày sinh"
											name="dob"
											type="date"
											value={form.dob}
											onChange={(value) => {
												setForm(f => ({ ...f, dob: value }));
												const error = validateEmployeeField('dob', value);
												setErrors(prev => ({ ...prev, dob: error }));
											}}
											error={errors.dob}
											required
											disabled={submitting}
										/>
										
										<AddressField
											provinceValue={form.province}
											wardValue={form.commune}
											onProvinceChange={(code, name) => {
												setForm(f => ({ ...f, province: name, commune: '' }));
												const error = validateEmployeeField('province', name);
												setErrors(prev => ({ ...prev, province: error }));
											}}
											onWardChange={(code, name) => {
												setForm(f => ({ ...f, commune: name }));
												const error = validateEmployeeField('commune', name);
												setErrors(prev => ({ ...prev, commune: error }));
											}}
											provinceError={errors.province}
											wardError={errors.commune}
											disabled={submitting}
											required={true}
										/>
										
										<FormField
											label="Địa chỉ chi tiết"
											name="detail_address"
											value={form.detail_address}
											onChange={(value) => {
												setForm(f => ({ ...f, detail_address: value }));
												const error = validateEmployeeField('detail_address', value);
												setErrors(prev => ({ ...prev, detail_address: error }));
											}}
											error={errors.detail_address}
											required
											disabled={submitting}
											colSpan
										/>
										<FormField
											label="Email"
											name="email"
											type="email"
											value={form.email}
											onChange={(value) => {
												setForm(f => ({ ...f, email: value }));
												const error = validateEmployeeField('email', value);
												setErrors(prev => ({ ...prev, email: error }));
											}}
											error={errors.email}
											required
											disabled={submitting}
										/>
										<FormField
											label="Tên đăng nhập"
											name="username"
											value={form.username}
											onChange={(value) => {
												setForm(f => ({ ...f, username: value }));
												const error = validateEmployeeField('username', value);
												setErrors(prev => ({ ...prev, username: error }));
											}}
											error={errors.username}
											required
											disabled={submitting}
											readOnly={!!editId}
											helperText={editId ? "Tên đăng nhập không thể thay đổi" : undefined}
										/>
									</div>
									<div className="flex justify-end gap-3 mt-8">
										<button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setModalOpen(false)} disabled={submitting}>Hủy</button>
										{(() => {
											const hasErrors = Object.keys(errors).some(key => errors[key]);
											const hasEmptyFields = Object.keys(form).some(key => !form[key as keyof typeof form]);
											const needsAvatar = !editId && !avatarFile;
											const isFormValid = !hasErrors && !hasEmptyFields && !needsAvatar;
											
											return (
												<button 
													type="submit" 
													className={`px-6 py-2 rounded font-semibold transition flex items-center gap-2 ${
														isFormValid 
															? 'bg-red-700 text-white hover:bg-red-800' 
															: 'bg-gray-300 text-gray-500 cursor-not-allowed'
													}`}
													disabled={submitting || !isFormValid}
												>
													{submitting && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
													{editId ? "Lưu" : "Thêm"}
												</button>
											);
										})()}
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
			
			<NotificationDialog
				open={dialog.open}
				onOpenChange={(open) => setDialog({ ...dialog, open })}
				title={dialog.title}
				description={dialog.description}
				type={dialog.type}
			/>
		</div>
	);
};

export default ManageEmployee;
