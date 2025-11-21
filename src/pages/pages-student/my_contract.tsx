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


const MyContract: React.FC = () => {
	const [contracts, setContracts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedContract, setSelectedContract] = useState<any | null>(null);
	const [modalStep, setModalStep] = useState<0 | 1 | 2>(0); // 0: xem chi tiết, 1: thanh toán, 2: kết quả
	const [paymentProof, setPaymentProof] = useState<File | null>(null);
	const [note, setNote] = useState("");
	const [uploading, setUploading] = useState(false);
	const [resultMsg, setResultMsg] = useState<string | null>(null);
	const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
	const token = localStorage.getItem("ptit_access_token") || "";


	useEffect(() => {
		setLoading(true);
		getMyContracts()
			.then((res) => setContracts(res))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, []);

	// Reset modal step when open/close
	useEffect(() => {
		if (selectedContract) {
			setModalStep(0);
			setPaymentProof(null);
			setNote("");
			setResultMsg(null);
		}
	}, [selectedContract]);

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString();
	};

	return (
		<div className="min-h-screen flex flex-col bg-white">
			<Header user={user} />
			<div className="flex flex-1">
				<Sidebar roles={user?.roles} />
				<main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-3xl font-bold text-center mb-8 tracking-wide text-red-700">Hợp đồng ký túc xá của tôi</h2>
						{loading ? (
							<div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
						) : error ? (
							<div className="text-red-500 text-lg text-center py-10">{error}</div>
						) : contracts.length === 0 ? (
							<div className="text-gray-500 text-lg text-center py-10">Bạn chưa có hợp đồng nào.</div>
						) : (
							<div className="space-y-6">
								{contracts.map((c) => (
									<div key={c.id} className="bg-white rounded-xl shadow border border-red-100 p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-lg transition">
										<div className="flex-1">
											<div className="text-lg font-semibold text-red-700 mb-1">Mã hợp đồng: {c.code || c.id}</div>
											<div className="text-gray-700 text-sm mb-1">Phòng: <span className="font-medium">{c.room}</span></div>
											<div className="text-gray-700 text-sm mb-1">Thời hạn: <span className="font-medium">{formatDate(c.start_date)} - {formatDate(c.end_date)}</span></div>
											<div className="text-gray-700 text-sm mb-1">Tổng tiền: <span className="font-semibold text-red-700">{c.total_amount?.toLocaleString()}đ</span></div>
											<div className="text-gray-700 text-sm mb-1">Trạng thái: <span className={`font-semibold px-2 py-1 rounded ${statusMap[c.status]?.color || "bg-gray-100 text-gray-700"}`}>{statusMap[c.status]?.label || c.status}</span></div>
											<div className="text-gray-700 text-sm mb-1">Thanh toán: <span className={`font-semibold px-2 py-1 rounded ${paymentMap[c.status_payment]?.color || "bg-gray-100 text-gray-700"}`}>{paymentMap[c.status_payment]?.label || c.status_payment}</span></div>
										</div>
										<div className="flex flex-col gap-2 min-w-[120px] items-end">
											<button
												className="px-4 py-2 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition"
												onClick={() => setSelectedContract(c)}
												aria-label="Xem chi tiết hợp đồng"
											>
												Xem chi tiết
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

								{/* Modal chi tiết hợp đồng với stepper và các bước */}
								{selectedContract && (
									<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn">
										<div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative">
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
												<div className="flex items-center gap-2">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 0 ? 'bg-red-600' : 'bg-gray-300'}`}>1</div>
													<span className={`h-1 w-8 ${modalStep > 0 ? 'bg-red-600' : 'bg-gray-300'} rounded`}></span>
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 1 ? 'bg-red-600' : 'bg-gray-300'}`}>2</div>
													<span className={`h-1 w-8 ${modalStep > 1 ? 'bg-red-600' : 'bg-gray-300'} rounded`}></span>
													<div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${modalStep === 2 ? 'bg-red-600' : 'bg-gray-300'}`}>3</div>
												</div>
											</div>
											{/* Nội dung từng bước */}
											{modalStep === 0 && (
												<>
													<h3 className="text-xl font-bold text-red-700 mb-4 text-center">Chi tiết hợp đồng & đơn nguyện vọng</h3>
													<div className="mb-4">
														<div className="font-semibold text-gray-700 mb-1">Mã hợp đồng: <span className="font-normal">{selectedContract.code || selectedContract.id}</span></div>
														<div className="font-semibold text-gray-700 mb-1">Phòng: <span className="font-normal">{selectedContract.room}</span></div>
														<div className="font-semibold text-gray-700 mb-1">Thời hạn: <span className="font-normal">{formatDate(selectedContract.start_date)} - {formatDate(selectedContract.end_date)}</span></div>
														<div className="font-semibold text-gray-700 mb-1">Tổng tiền: <span className="font-normal">{selectedContract.total_amount?.toLocaleString()}đ</span></div>
														<div className="font-semibold text-gray-700 mb-1">Trạng thái: <span className={`font-normal ${statusMap[selectedContract.status]?.color || "bg-gray-100 text-gray-700"}`}>{statusMap[selectedContract.status]?.label || selectedContract.status}</span></div>
														<div className="font-semibold text-gray-700 mb-1">Thanh toán: <span className={`font-normal ${paymentMap[selectedContract.status_payment]?.color || "bg-gray-100 text-gray-700"}`}>{paymentMap[selectedContract.status_payment]?.label || selectedContract.status_payment}</span></div>
														{selectedContract.image_bill && (
															<a href={selectedContract.image_bill} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Xem minh chứng thanh toán</a>
														)}
														{selectedContract.note && <div className="text-xs text-gray-500 italic mt-1">{selectedContract.note}</div>}
													</div>
													<div className="border-t pt-4 mt-4">
														<h4 className="text-lg font-semibold text-red-600 mb-2">Thông tin đơn nguyện vọng</h4>
														{selectedContract.dorm_application ? (
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div>
																	<div className="font-semibold text-gray-700 mb-1">Họ tên: <span className="font-normal">{selectedContract.dorm_application.full_name}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Mã SV: <span className="font-normal">{selectedContract.dorm_application.student_id}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Lớp: <span className="font-normal">{selectedContract.dorm_application.class}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Khoa: <span className="font-normal">{selectedContract.dorm_application.faculty}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">SĐT: <span className="font-normal">{selectedContract.dorm_application.phone}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Email: <span className="font-normal">{selectedContract.dorm_application.email}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Địa chỉ: <span className="font-normal">{selectedContract.dorm_application.hometown}</span></div>
																	<div className="font-semibold text-gray-700 mb-1">Nhóm ưu tiên: <span className="font-normal">{selectedContract.dorm_application.priority_group || "-"}</span></div>
																	{selectedContract.dorm_application.priority_proof && (
																		<a href={selectedContract.dorm_application.priority_proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Xem minh chứng ưu tiên</a>
																	)}
																</div>
																<div className="flex flex-col gap-2 items-center">
																	{selectedContract.dorm_application.avatar_front && (
																		<div className="flex flex-col items-center">
																			<img src={selectedContract.dorm_application.avatar_front} alt="avatar_front" className="w-24 h-32 object-cover rounded-lg border mb-1" />
																			<span className="text-xs text-gray-500">CCCD mặt trước</span>
																		</div>
																	)}
																	{selectedContract.dorm_application.avatar_back && (
																		<div className="flex flex-col items-center">
																			<img src={selectedContract.dorm_application.avatar_back} alt="avatar_back" className="w-24 h-32 object-cover rounded-lg border mb-1" />
																			<span className="text-xs text-gray-500">CCCD mặt sau</span>
																		</div>
																	)}
																</div>
															</div>
														) : (
															<div className="text-gray-500 italic">Không có thông tin đơn nguyện vọng.</div>
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
																await confirmContract(selectedContract.id, { image_bill: paymentProof, note }, token);
																setResultMsg('Gửi minh chứng thành công! Hợp đồng sẽ được xác nhận sau khi quản lý kiểm tra.');
																setModalStep(2);
															} catch (err: any) {
																setResultMsg(err.message || 'Có lỗi xảy ra khi gửi minh chứng.');
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
