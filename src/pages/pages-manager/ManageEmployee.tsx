import React, { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, UserCog } from "lucide-react";

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

interface Manager {
	staff_id: string;
	fullname: string;
	phone: string;
	cccd: string;
	dob?: string;
	province: string;
	commune: string;
	detail_address: string;
	email: string;
	username: string;
	avatar?: string;
}

const ManageEmployee: React.FC = () => {
	const [managers, setManagers] = useState<Manager[]>([]);
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
	const [searchTerm, setSearchTerm] = useState("");
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

	const fetchManagers = async () => {
		setLoading(true);
		try {
			const res = await getManagers();
			setManagers((res as Manager[]) || []);
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

	const filteredManagers = useMemo(() => {
		if (!searchTerm.trim()) return managers;
		const term = searchTerm.toLowerCase();
		return managers.filter((m) =>
			m.fullname.toLowerCase().includes(term) ||
			m.email.toLowerCase().includes(term) ||
			m.phone.toLowerCase().includes(term) ||
			m.username.toLowerCase().includes(term)
		);
	}, [managers, searchTerm]);



	const openAdd = () => {
		setEditId(null);
		setForm(initialForm);
		setAvatarFile(null);
		setErrors({});
		setModalOpen(true);
	};
	const openEdit = (m: Manager) => {
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
										<UserCog className="h-5 w-5" />
									</div>
									<div>
										<CardTitle className="text-xl sm:text-2xl font-semibold text-red-800">
											Quản lý nhân sự KTX
										</CardTitle>
										<p className="text-xs sm:text-sm text-gray-500 mt-1">
											Danh sách và thông tin cán bộ quản lý KTX PTIT.
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0 pb-4 sm:pb-6">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-xs sm:text-sm text-gray-500">
										Tổng số nhân sự: <span className="font-semibold text-red-700">{managers.length}</span>
									</p>
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
										<div className="relative w-full sm:w-64">
											<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
											<Input
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												placeholder="Tìm theo tên, email, SĐT..."
												className="pl-9 text-sm"
											/>
										</div>
										<Button
											type="button"
											className="bg-red-700 hover:bg-red-800 text-white shadow-sm h-9 px-4 text-sm font-semibold flex items-center gap-2 justify-center"
											onClick={openAdd}
										>
											<Plus className="h-4 w-4" />
											Thêm nhân viên
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{loading ? (
							<div className="flex items-center justify-center py-16 text-gray-500">
								<Loader2 className="h-6 w-6 animate-spin text-red-600 mr-2" />
								Đang tải dữ liệu nhân sự...
							</div>
						) : error ? (
							<Card className="border-red-200 bg-red-50/80 rounded-2xl">
								<CardContent className="py-4 text-sm text-red-700 text-center">
									{error}
								</CardContent>
							</Card>
						) : managers.length === 0 ? (
							<Card className="border-dashed border-gray-200 bg-white/60 rounded-2xl">
								<CardContent className="py-10 text-center text-sm text-gray-500">
									Chưa có nhân viên nào. Hãy thêm nhân viên đầu tiên.
								</CardContent>
							</Card>
						) : filteredManagers.length === 0 ? (
							<Card className="border-gray-200 bg-white rounded-2xl">
								<CardContent className="py-10 text-center text-sm text-gray-500">
									Không tìm thấy nhân viên phù hợp với từ khóa tìm kiếm.
								</CardContent>
							</Card>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredManagers.map((m) => (
									<div
										key={m.staff_id}
										className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-md hover:border-red-100 transition"
									>
										<div className="flex items-center gap-4">
											<img
												src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullname)}`}
												alt={m.fullname}
												className="w-16 h-16 rounded-full object-cover border"
											/>
											<div className="flex-1 min-w-0">
												<div className="font-semibold text-lg text-red-700 truncate">{m.fullname}</div>
												<div className="text-gray-700 text-sm truncate">
													{m.email}
													<span className="ml-2 text-xs text-gray-400">({m.username})</span>
												</div>
												<div className="text-gray-500 text-xs">SĐT: {m.phone} · CCCD: {m.cccd}</div>
											</div>
										</div>
										<div className="text-gray-500 text-xs mt-1">
											Địa chỉ: {m.detail_address}, {m.commune}, {m.province}
										</div>
										<div className="text-gray-500 text-xs">
											Ngày sinh: {m.dob ? new Date(m.dob).toLocaleDateString("vi-VN") : ""}
										</div>
										<div className="flex gap-3 mt-2">
											<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => openEdit(m)}
													className="h-8 px-3 text-xs border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700"
												>
													Sửa
												</Button>
											<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => { setDeleteId(m.staff_id); setConfirmDelete(true); }}
													className="h-8 px-3 text-xs border-gray-200 bg-gray-50 text-gray-700 hover:bg-red-50 hover:border-red-200"
												>
													Xóa
												</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
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
