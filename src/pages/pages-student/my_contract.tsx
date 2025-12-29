import React, { useEffect, useState } from "react";
import { getMyContracts } from "@/features/auth/api";
import { confirmContract } from "@/features/auth/studentContractApi";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const statusMap: Record<string, { label: string; color: string }> = {
	temporary: { label: "Tạm thời", color: "bg-yellow-100 text-yellow-700" },
	approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700" },
	canceled: { label: "Đã hủy", color: "bg-gray-200 text-gray-600" },
};
const paymentMap: Record<string, { label: string; color: string }> = {
	unpaid: { label: "Chưa thanh toán", color: "bg-red-100 text-red-700" },
	paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-700" },
};


type DormApplication = {
	username?: string;
	full_name: string;
	student_id?: string;
	class: string;
	faculty: string;
	phone: string;
	email: string;
	hometown: string;
	priority_group?: string;
	priority_proof?: string;
	avatar_front?: string;
	avatar_back?: string;
};

type NullableStringFromDB = {
	String?: string;
	Valid?: boolean;
} | null;

type Contract = {
	id: string | number;
	code?: string;
	room?: string;
	start_date?: string;
	end_date?: string;
	total_amount?: number;
	status: string;
	status_payment: string;
	image_bill?: string | NullableStringFromDB;
	note?: string;
	dorm_application?: DormApplication;
};

type LocalCancelStatus = "pending" | "approved" | "rejected";

type LocalCancelRequest = {
	contract_id: string;
	status: LocalCancelStatus;
	reason: string;
	manager_note?: string;
};

const MyContract: React.FC = () => {
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
	const [modalStep, setModalStep] = useState<0 | 1 | 2>(0); // 0: xem chi tiết, 1: thanh toán, 2: kết quả
	const [paymentProof, setPaymentProof] = useState<File | null>(null);
	const [note, setNote] = useState("");
	const [uploading, setUploading] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	const [cancelRequests, setCancelRequests] = useState<LocalCancelRequest[]>([]);
	const [cancelReason, setCancelReason] = useState("");
	const [cancelSubmitting, setCancelSubmitting] = useState(false);
	const [cancelError, setCancelError] = useState<string | null>(null);
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

	const totalContracts = contracts.length;
	const activeContracts = contracts.filter((c) => c.status === "approved").length;
	const unpaidContracts = contracts.filter((c) => c.status_payment === "unpaid").length;


	useEffect(() => {
		setLoading(true);
		getMyContracts()
			.then((contractsRes) => {
				setContracts(contractsRes);
			})
			.catch((e: unknown) => {
				if (e instanceof Error) {
					setError(e.message);
				} else {
					setError("Đã xảy ra lỗi khi tải dữ liệu hợp đồng.");
				}
			})
			.finally(() => setLoading(false));
	}, []);

	// Reset modal step when open/close
	useEffect(() => {
		if (selectedContract) {
			setModalStep(0);
			setPaymentProof(null);
			setNote("");
			setResultMsg(null);
			setCancelReason("");
			setCancelError(null);
		}
	}, [selectedContract]);

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString();
	};

	const getImageBillUrl = (imageBill: Contract["image_bill"]) => {
		if (!imageBill) return null;
		if (typeof imageBill === "string") {
			return imageBill || null;
		}
		if (typeof imageBill === "object" && imageBill !== null) {
			const maybe = imageBill as NullableStringFromDB;
			if (maybe?.Valid && typeof maybe.String === "string" && maybe.String.trim() !== "") {
				return maybe.String;
			}
		}
		return null;
	};

	const handleSubmitCancelRequest = () => {
		if (!selectedContract) return;
		if (!cancelReason.trim()) {
			setCancelError("Vui lòng nhập lý do muốn hủy hợp đồng.");
			return;
		}
		setCancelSubmitting(true);
		setCancelError(null);
		window.setTimeout(() => {
			const created: LocalCancelRequest = {
				contract_id: String(selectedContract.id),
				status: "pending",
				reason: cancelReason.trim(),
			};
			setCancelRequests((prev) => [
				...prev.filter((req) => req.contract_id !== created.contract_id),
				created,
			]);
			setResultMsg("Đã gửi yêu cầu hủy hợp đồng (giả lập). Vui lòng chờ quản lý duyệt.");
			setCancelSubmitting(false);
		}, 800);
	};

	const currentCancelRequest = selectedContract
		? cancelRequests.find((req) => req.contract_id === String(selectedContract.id))
		: undefined;

	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Header user={user} />
			<div className="flex flex-1">
				<Sidebar roles={user?.roles} />
				<main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
					<div className="max-w-5xl mx-auto space-y-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h2 className="text-3xl font-bold tracking-wide text-red-700 mb-1">
									Hợp đồng ký túc xá của tôi
								</h2>
								<p className="text-sm text-gray-600 max-w-xl">
									Theo dõi trạng thái hợp đồng, thanh toán và yêu cầu hủy hợp đồng của bạn một cách tập trung.
								</p>
							</div>
							<div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
								<div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex flex-col">
									<span className="text-gray-500">Tổng hợp đồng</span>
									<span className="text-lg font-semibold text-gray-900">{totalContracts}</span>
								</div>
								<div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex flex-col">
									<span className="text-gray-500">Đang hiệu lực</span>
									<span className="text-lg font-semibold text-emerald-700">{activeContracts}</span>
								</div>
								<div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-2 flex flex-col">
									<span className="text-gray-500">Chưa thanh toán</span>
									<span className="text-lg font-semibold text-red-700">{unpaidContracts}</span>
								</div>
							</div>
						</div>
							{loading ? (
								<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
							) : error ? (
								<div className="text-red-500 text-lg text-center py-10">{error}</div>
							) : contracts.length === 0 ? (
								<div className="text-gray-500 text-lg text-center py-10">Bạn chưa có hợp đồng nào.</div>
							) : (
								<div className="space-y-5">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
										{contracts.map((c) => (
											<div
												key={c.id as string | number}
												className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between gap-4 hover:shadow-xl hover:border-red-200 transition"
											>
												<div className="flex items-start justify-between gap-3">
													<div className="space-y-1">
														<div className="text-[11px] uppercase tracking-wide text-gray-400">Mã hợp đồng</div>
														<div className="text-lg font-semibold text-gray-900">
															{String(c.code ?? c.id)}
														</div>
														<div className="text-sm text-gray-600">
															Phòng <span className="font-semibold text-red-700">{String(c.room)}</span>
														</div>
													</div>
													<div className="flex flex-col items-end gap-2">
														<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMap[c.status]?.color || "bg-gray-100 text-gray-700"}`}>
															{statusMap[c.status]?.label || c.status}
														</span>
														<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${paymentMap[c.status_payment]?.color || "bg-gray-100 text-gray-700"}`}>
															{paymentMap[c.status_payment]?.label || c.status_payment}
														</span>
													</div>
											</div>
											<div className="mt-3 space-y-1 text-xs text-gray-600">
												<div>
													<span className="font-medium text-gray-700">Thời hạn:&nbsp;</span>
													<span>
														{formatDate(String(c.start_date))} - {formatDate(String(c.end_date))}
													</span>
												</div>
												<div>
													<span className="font-medium text-gray-700">Tổng tiền:&nbsp;</span>
													<span className="font-semibold text-red-700">{c.total_amount?.toLocaleString()}đ</span>
												</div>
											</div>
											<div className="mt-4 flex justify-between items-center">
												<div className="text-[11px] text-gray-400">
													Nhấn để xem chi tiết hợp đồng
												</div>
												<button
													type="button"
													className="px-4 py-2 rounded-full bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition shadow-sm"
													onClick={() => setSelectedContract(c)}
													aria-label="Xem chi tiết hợp đồng"
												>
													Xem chi tiết
												</button>
											</div>
										</div>
										))}
									</div>
								</div>
							)}
					</div>

								{/* Modal chi tiết hợp đồng với stepper và các bước */}
								{selectedContract && (
									<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn px-2">
										<div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 md:p-8 relative">
											<button
												className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
												onClick={() => setSelectedContract(null)}
												aria-label="Đóng"
												tabIndex={0}
											>
												×
											</button>
											{/* Stepper tiến trình */}
											<div className="flex items-center justify-center mb-6">
												<div className="flex items-center gap-3 text-xs md:text-sm">
													<div className="flex flex-col items-center gap-1">
														<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 0 ? 'bg-red-600' : 'bg-gray-300'}`}>1</div>
														<span className="text-gray-600">Chi tiết</span>
													</div>
													<span className={`h-0.5 w-8 ${modalStep > 0 ? 'bg-red-600' : 'bg-gray-300'} rounded`}></span>
													<div className="flex flex-col items-center gap-1">
														<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 1 ? 'bg-red-600' : 'bg-gray-300'}`}>2</div>
														<span className="text-gray-600">Thanh toán</span>
													</div>
													<span className={`h-0.5 w-8 ${modalStep > 1 ? 'bg-red-600' : 'bg-gray-300'} rounded`}></span>
													<div className="flex flex-col items-center gap-1">
														<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 2 ? 'bg-red-600' : 'bg-gray-300'}`}>3</div>
														<span className="text-gray-600">Hoàn tất</span>
													</div>
												</div>
											</div>
											{/* Nội dung từng bước */}
											{modalStep === 0 && (
												<>
													<h3 className="text-xl md:text-2xl font-bold text-red-700 mb-4 text-center">Chi tiết hợp đồng & đơn nguyện vọng</h3>
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
														<div className="md:col-span-2 bg-gray-50 rounded-xl p-4 space-y-2">
															<div className="flex flex-wrap items-center justify-between gap-2">
																<div>
																	<div className="text-xs uppercase tracking-wide text-gray-500">Mã hợp đồng</div>
																	<div className="text-lg font-semibold text-gray-900">{selectedContract.code || selectedContract.id}</div>
																</div>
																<div className="text-sm text-gray-600">
																	<span className="font-medium">Phòng:&nbsp;</span>
																	<span className="font-semibold text-red-700">{selectedContract.room}</span>
																</div>
															</div>
															<div className="text-sm text-gray-700">
																<span className="font-medium">Thời hạn:&nbsp;</span>
																<span>{formatDate(selectedContract.start_date)} - {formatDate(selectedContract.end_date)}</span>
															</div>
															<div className="text-sm text-gray-700">
																<span className="font-medium">Tổng tiền:&nbsp;</span>
																<span className="font-semibold text-red-700">{selectedContract.total_amount?.toLocaleString()}đ</span>
															</div>
															<div className="flex flex-wrap gap-2 mt-2">
																<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMap[selectedContract.status]?.color || "bg-gray-100 text-gray-700"}`}>
																	{statusMap[selectedContract.status]?.label || selectedContract.status}
																</span>
																<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentMap[selectedContract.status_payment]?.color || "bg-gray-100 text-gray-700"}`}>
																	{paymentMap[selectedContract.status_payment]?.label || selectedContract.status_payment}
																</span>
															</div>
															{getImageBillUrl(selectedContract.image_bill) && (
																<a
																	href={getImageBillUrl(selectedContract.image_bill) as string}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-block mt-2 text-xs text-blue-600 hover:underline"
																>
																	Xem minh chứng thanh toán
																</a>
															)}
															{selectedContract.note && <div className="text-xs text-gray-500 italic mt-1">{selectedContract.note}</div>}
														</div>
														<div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
															{selectedContract.dorm_application?.avatar_front && (
																<div className="flex flex-col items-center">
																	<img src={selectedContract.dorm_application.avatar_front} alt="avatar_front" className="w-20 h-28 object-cover rounded-lg border mb-1" />
																	<span className="text-xs text-gray-500">CCCD mặt trước</span>
																</div>
															)}
															{selectedContract.dorm_application?.avatar_back && (
																<div className="flex flex-col items-center">
																	<img src={selectedContract.dorm_application.avatar_back} alt="avatar_back" className="w-20 h-28 object-cover rounded-lg border mb-1" />
																	<span className="text-xs text-gray-500">CCCD mặt sau</span>
																</div>
															)}
															{!selectedContract.dorm_application?.avatar_front && !selectedContract.dorm_application?.avatar_back && (
																<span className="text-xs text-gray-500">Không có ảnh CCCD</span>
															)}
														</div>
													</div>
													<div className="border-t pt-4 mt-2">
														<h4 className="text-lg font-semibold text-red-600 mb-3">Thông tin đơn nguyện vọng</h4>
														{selectedContract.dorm_application ? (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div className="space-y-1 text-sm text-gray-700">
																	<div>
																		<span className="font-medium">Họ tên:&nbsp;</span>
																		<span>{selectedContract.dorm_application.full_name}</span>
																	</div>
																	<div>
																		<span className="font-medium">Mã SV:&nbsp;</span>
																		<span>{selectedContract.dorm_application.username || selectedContract.dorm_application.student_id}</span>
																	</div>
																	<div>
																		<span className="font-medium">Lớp:&nbsp;</span>
																		<span>{selectedContract.dorm_application.class}</span>
																	</div>
																	<div>
																		<span className="font-medium">Khoa:&nbsp;</span>
																		<span>{selectedContract.dorm_application.faculty}</span>
																	</div>
																	<div>
																		<span className="font-medium">SĐT:&nbsp;</span>
																		<span>{selectedContract.dorm_application.phone}</span>
																	</div>
																	<div>
																		<span className="font-medium">Email:&nbsp;</span>
																		<span>{selectedContract.dorm_application.email}</span>
																	</div>
																	<div>
																		<span className="font-medium">Địa chỉ:&nbsp;</span>
																		<span>{selectedContract.dorm_application.hometown}</span>
																	</div>
																	<div>
																		<span className="font-medium">Nhóm ưu tiên:&nbsp;</span>
																		<span>{selectedContract.dorm_application.priority_group || "-"}</span>
																	</div>
																	{selectedContract.dorm_application.priority_proof && (
																		<a
																			href={selectedContract.dorm_application.priority_proof}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="inline-block mt-1 text-xs text-blue-600 hover:underline"
																		>
																			Xem minh chứng ưu tiên
																		</a>
																	)}
																</div>
																<div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3">
																	<h4 className="text-sm font-semibold text-red-700 flex items-center justify-between">
																		<span>Yêu cầu hủy hợp đồng</span>
																		<span className="text-[11px] text-gray-500">(Giả lập phía sinh viên)</span>
																	</h4>
																	{selectedContract.status !== "approved" ? (
																		<p className="text-xs md:text-sm text-gray-600">
																			Bạn chỉ có thể gửi yêu cầu hủy khi hợp đồng đang ở trạng thái
																			<span className="font-semibold"> đã duyệt</span>.
																		</p>
																	) : currentCancelRequest ? (
																		<div className="text-xs md:text-sm text-gray-700 space-y-1">
																			<p>
																				Trạng thái yêu cầu hiện tại:
																				<span className="ml-1 font-semibold">
																					{currentCancelRequest.status === "pending" && "Đang chờ duyệt"}
																					{currentCancelRequest.status === "approved" && "Đã được chấp thuận"}
																					{currentCancelRequest.status === "rejected" && "Đã bị từ chối"}
																				</span>
																			</p>
																			<p className="text-xs text-gray-500">
																				Lý do đã gửi: {currentCancelRequest.reason}
																			</p>
																			{currentCancelRequest.manager_note && (
																				<p className="text-xs text-gray-500">
																					Ghi chú của quản lý: {currentCancelRequest.manager_note}
																				</p>
																			)}
																		</div>
																	) : (
																		<div className="space-y-3">
																			<p className="text-xs md:text-sm text-gray-700">
																				Nếu bạn không còn nhu cầu ở KTX, hãy gửi yêu cầu hủy hợp đồng để quản lý xem xét.
																			</p>
																			<textarea
																				className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
																				rows={3}
																				placeholder="Nhập lý do muốn hủy hợp đồng..."
																				value={cancelReason}
																				onChange={(event) => setCancelReason(event.target.value)}
																				disabled={cancelSubmitting}
																			/>
																			{cancelError && (
																				<div className="text-xs text-red-600">{cancelError}</div>
																			)}
																			<div className="flex justify-end">
																				<button
																						type="button"
																						className="px-4 py-2 rounded-full bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition disabled:opacity-60"
																						onClick={handleSubmitCancelRequest}
																						disabled={cancelSubmitting}
																					>
																						{cancelSubmitting ? "Đang gửi..." : "Gửi yêu cầu hủy hợp đồng"}
																					</button>
																			</div>
																		</div>
																	)}
																</div>
															</div>
														) : (
															<div className="text-gray-500 italic text-sm">Không có thông tin đơn nguyện vọng.</div>
														)}
													</div>
													{/* Nếu chưa thanh toán thì có nút chuyển sang bước thanh toán */}
													{selectedContract.status_payment === 'unpaid' && (
														<div className="mt-6 flex justify-center">
															<button
																className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
																onClick={() => setModalStep(1)}
															>
																Thanh toán
															</button>
														</div>
													)}
												</>
											)}
											{modalStep === 1 && (
												<>
													<h3 className="text-xl font-bold text-red-700 mb-4 text-center">Xác nhận thanh toán hợp đồng</h3>
													<form
														className="space-y-4"
														onSubmit={async (e) => {
															e.preventDefault();
															if (!paymentProof) return;
															setUploading(true);
															try {
																await confirmContract(String(selectedContract.id), { image_bill: paymentProof, note });
																setResultMsg('Gửi minh chứng thành công! Hợp đồng sẽ được xác nhận sau khi quản lý kiểm tra.');
																setModalStep(2);
															} catch (err: unknown) {
																const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi minh chứng.';
																setResultMsg(errorMsg);
																setModalStep(2);
															} finally {
																setUploading(false);
															}
														}}
													>
														<div>
															<label className="block font-semibold mb-1">Minh chứng thanh toán (ảnh):</label>
															<input
																type="file"
																accept="image/*"
																required
																onChange={e => setPaymentProof(e.target.files?.[0] || null)}
																className="block w-full border rounded px-2 py-1"
															/>
															{paymentProof && (
																<img src={URL.createObjectURL(paymentProof)} alt="preview" className="mt-2 w-32 h-32 object-cover rounded border" />
															)}
														</div>
														<div>
															<label className="block font-semibold mb-1">Ghi chú (nếu có):</label>
															<textarea
																className="w-full border rounded px-2 py-1"
																rows={2}
																value={note}
																onChange={e => setNote(e.target.value)}
																placeholder="Ghi chú cho quản lý..."
															/>
														</div>
														<div className="flex justify-between mt-6">
															<button
																type="button"
																className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
																onClick={() => setModalStep(0)}
																disabled={uploading}
															>
																Quay lại
															</button>
															<button
																type="submit"
																className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
																disabled={uploading || !paymentProof}
															>
																{uploading ? 'Đang gửi...' : 'Xác nhận hợp đồng'}
															</button>
														</div>
													</form>
												</>
											)}
											{modalStep === 2 && (
												<div className="flex flex-col items-center justify-center min-h-[200px]">
													<div className="text-green-600 text-3xl mb-4">✔</div>
													<div className="text-lg font-semibold mb-2">{resultMsg || 'Đã gửi minh chứng thanh toán!'}</div>
													<button
														className="mt-6 px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
														onClick={() => setSelectedContract(null)}
													>
														Đóng
													</button>
												</div>
											)}
										</div>
									</div>
								)}
				</main>
			</div>
		</div>
	);
};

export default MyContract;
