import React, { useState } from "react";
import {
	X,
	Eye,
	EyeOff,
	Copy,
	Check,
	FileText,
	ZoomIn,
	ArrowLeft,
	CreditCard,
	XCircle,
	Calendar,
	User,
	Home,
	Phone,
	Mail,
	MapPin,
	Award,
	GraduationCap,
	Building,
} from "lucide-react";
import { confirmContract } from "@/features/auth/studentContractApi";
import { useToast } from "@/hooks/use-toast";
import ContractPreview from "./ContractForm";
import { DormApplication } from "@/model/DormApplication";
import { Contract, NullableStringFromDB } from "@/model/Contract";

type LocalCancelStatus = "pending" | "approved" | "rejected";

type LocalCancelRequest = {
	contract_id: string;
	status: LocalCancelStatus;
	reason: string;
	manager_note?: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
	temporary: { label: "Tạm thời", color: "bg-yellow-100 text-yellow-700 border border-yellow-300" },
	approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700 border border-green-300" },
	canceled: { label: "Đã hủy", color: "bg-gray-100 text-gray-600 border border-gray-300" },
};

const paymentMap: Record<string, { label: string; color: string }> = {
	unpaid: { label: "Chưa thanh toán", color: "bg-red-100 text-red-700 border border-red-300" },
	paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-700 border border-green-300" },
};

interface ContractDetailModalProps {
	contract: Contract;
	cancelRequests: LocalCancelRequest[];
	onClose: () => void;
	onCancelRequestSubmit: (request: LocalCancelRequest) => void;
	onPaymentSuccess: () => void;
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
	contract,
	cancelRequests,
	onClose,
	onCancelRequestSubmit,
	onPaymentSuccess,
}) => {
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState<"detail" | "preview" | "payment" | "cancel">("detail");
	const [paymentProof, setPaymentProof] = useState<File | null>(null);
	const [note, setNote] = useState("");
	const [uploading, setUploading] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [cancelSubmitting, setCancelSubmitting] = useState(false);
	const [cancelError, setCancelError] = useState<string | null>(null);
	const [showCode, setShowCode] = useState(false);
	const [copied, setCopied] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString("vi-VN");
	};

	const maskContractCode = (code: string | number) => {
		const codeStr = String(code);
		if (codeStr.length <= 8) return "••••";
		return codeStr.slice(0, 4) + "••••" + codeStr.slice(-4);
	};

	const copyCode = (code: string | number) => {
		navigator.clipboard.writeText(String(code));
		setCopied(true);
		toast({ title: "Đã sao chép mã hợp đồng!", duration: 2000 });
		setTimeout(() => setCopied(false), 1500);
	};

	const getImageBillUrl = (imageBill: Contract["image_bill"]) => {
		if (!imageBill) return null;
		if (typeof imageBill === "string") return imageBill || null;
		if (typeof imageBill === "object" && imageBill !== null) {
			const maybe = imageBill as NullableStringFromDB;
			if (maybe?.Valid && typeof maybe.String === "string" && maybe.String.trim() !== "") {
				return maybe.String;
			}
		}
		return null;
	};

	const handleSubmitPayment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!paymentProof) return;
		setUploading(true);
		try {
			await confirmContract(String(contract.id), { image_bill: paymentProof, note });
			toast({
				title: "Thành công!",
				description: "Gửi minh chứng thành công! Hợp đồng sẽ được xác nhận sau khi quản lý kiểm tra.",
				duration: 4000,
			});
			onPaymentSuccess();
		} catch (err: unknown) {
			const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi gửi minh chứng.";
			toast({
				title: "Lỗi!",
				description: errorMsg,
				variant: "destructive",
				duration: 4000,
			});
		} finally {
			setUploading(false);
		}
	};

	const handleSubmitCancelRequest = () => {
		if (!cancelReason.trim()) {
			setCancelError("Vui lòng nhập lý do muốn hủy hợp đồng.");
			return;
		}
		setCancelSubmitting(true);
		setCancelError(null);
		setTimeout(() => {
			const created: LocalCancelRequest = {
				contract_id: String(contract.id),
				status: "pending",
				reason: cancelReason.trim(),
			};
			onCancelRequestSubmit(created);
			toast({
				title: "Đã gửi yêu cầu!",
				description: "Yêu cầu hủy hợp đồng đã được gửi. Vui lòng chờ quản lý duyệt.",
				duration: 4000,
			});
			setCancelSubmitting(false);
			setActiveTab("detail");
		}, 800);
	};

	const currentCancelRequest = cancelRequests.find((req) => req.contract_id === String(contract.id));
	const codeId = String(contract.code ?? contract.id);

	const tabs = [
		{ key: "detail", label: "Chi tiết", icon: FileText, always: true },
		{ key: "preview", label: "Xem hợp đồng", icon: Eye, show: contract.status === "approved" && contract.status_payment === "paid" },
		{ key: "payment", label: "Thanh toán", icon: CreditCard, show: contract.status_payment === "unpaid" },
		{ key: "cancel", label: "Yêu cầu hủy", icon: XCircle, show: contract.status === "approved" || contract.status === "temporary" },
	];

	const images = [
		{ src: contract.dorm_application?.avatar_front, label: "CCCD mặt trước" },
		{ src: contract.dorm_application?.avatar_back, label: "CCCD mặt sau" },
		{ src: contract.dorm_application?.priority_proof, label: "Minh chứng ưu tiên" },
		{ src: getImageBillUrl(contract.image_bill), label: "Minh chứng thanh toán" },
	].filter((i) => i.src);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
			<div className="bg-white rounded-2xl shadow-2xl w-[85%] max-w-[1400px] h-[96vh] overflow-hidden relative flex flex-col">
				{/* Close Button */}
				<button
					className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-600 transition bg-white rounded-full p-1.5 shadow"
					onClick={onClose}
				>
					<X size={20} />
				</button>

				{/* Header */}
				<div className="bg-red-700 px-6 py-4 border-b border-red-900 flex-shrink-0">
					<h2 className="text-xl font-bold text-white mb-4 text-center">
						Hợp đồng ký túc xá
					</h2>

					{/* Tabs */}
					<div className="flex items-center justify-center gap-2">
						{tabs
							.filter((tab) => tab.always || tab.show)
							.map((tab, idx, arr) => (
								<React.Fragment key={tab.key}>
									<button
										onClick={() => setActiveTab(tab.key as typeof activeTab)}
										className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
											activeTab === tab.key
												? "bg-red-600 text-white shadow-md"
												: "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
										}`}
									>
										<tab.icon size={16} />
										{tab.label}
									</button>
									{idx < arr.length - 1 && (
										<div className="w-8 h-0.5 bg-gray-200 rounded" />
									)}
								</React.Fragment>
							))}
					</div>
				</div>

				{/* Content */}
				<div className="overflow-y-auto flex-1 p-4 bg-gray-50">
					{/* Tab: Detail */}
					{activeTab === "detail" && (
						<div className="space-y-3">
							{/* Contract Info Card */}
							<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
								{/* Code + Status Row */}
								<div className="flex items-center justify-between mb-">
									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-500">Mã HĐ:</span>
										<span className="text-sm font-bold text-gray-900 font-mono">
											{showCode ? codeId : maskContractCode(codeId)}
										</span>
										<button onClick={() => setShowCode(!showCode)} className="p-0.5 hover:bg-gray-100 rounded transition text-gray-400">
											{showCode ? <EyeOff size={14} /> : <Eye size={14} />}
										</button>
										<button onClick={() => copyCode(codeId)} className="p-0.5 hover:bg-gray-100 rounded transition text-gray-400">
											{copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
										</button>
									</div>
									<div className="flex gap-2">
										<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusMap[contract.status]?.color}`}>
											{statusMap[contract.status]?.label || contract.status}
										</span>
										<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentMap[contract.status_payment]?.color}`}>
											{paymentMap[contract.status_payment]?.label || contract.status_payment}
										</span>
									</div>
								</div>

								{/* 3 Info Cards */}
								<div className="grid grid-cols-3 gap-3">
									<div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
										<div className="text-xs text-gray-400 mb-1">Phòng</div>
										<div className="text-2xl font-bold text-red-600">{contract.room}</div>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
										<div className="text-xs text-gray-400 mb-1">Thời hạn</div>
										<div className="text-sm font-semibold text-gray-800">
											{formatDate(contract.start_date)} <span className="text-gray-400">→</span> {formatDate(contract.end_date)}
										</div>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
										<div className="text-xs text-gray-400 mb-1">Tổng tiền</div>
										<div className="text-xl font-bold text-green-600">{contract.total_amount?.toLocaleString()}đ</div>
									</div>
								</div>
							</div>

							{/* Two Column Layout */}
							<div className="flex flex-col lg:flex-row gap-3">
								{/* Left: Student Info + Note */}
								<div className="lg:w-[80%] flex flex-col">
									<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex-1">
										<h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 pb-2 border-b border-gray-100">
											<User size={16} className="text-red-500" />
											Thông tin sinh viên
										</h4>
										{contract.dorm_application ? (
											<div className="grid grid-cols-2 gap-2">
												<InfoRow icon={User} label="Họ tên" value={contract.dorm_application.full_name} />
												<InfoRow icon={GraduationCap} label="Mã SV" value={contract.dorm_application.username || contract.dorm_application.student_id} />
												<InfoRow icon={Building} label="Lớp" value={contract.dorm_application.class} />
												<InfoRow icon={Building} label="Khoa" value={contract.dorm_application.faculty} />
												<InfoRow icon={Phone} label="SĐT" value={contract.dorm_application.phone} />
												<InfoRow icon={Mail} label="Email" value={contract.dorm_application.email} />
												<InfoRow icon={MapPin} label="Quê" value={contract.dorm_application.hometown} />
												<InfoRow icon={Award} label="Ưu tiên" value={contract.dorm_application.priority_group || "Không"} />
											</div>
										) : (
											<div className="text-gray-500 italic text-sm py-4 text-center">Không có thông tin sinh viên</div>
										)}

										{/* Note - Ghi chú luôn hiển thị */}
										<div className="mt-3 pt-3 border-t border-gray-100">
											<h4 className="text-sm font-bold text-black-700 mb-1 flex items-center gap-2">
												<FileText size={14} className="text-black-500" />
												Ghi chú
											</h4>
											<p className="text-sm text-gray-600 bg-white rounded-lg p-2">{contract.note || "Không có ghi chú"}</p>
										</div>
									</div>
								</div>

								{/* Right: Images + Actions */}
								<div className="lg:w-[30%] flex flex-col">
									{/* Images Grid */}
									<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex-1">
										<h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 pb-2 border-b border-gray-100">
											<FileText size={16} className="text-red-500" />
											Minh chứng & Hình ảnh
										</h4>
										<div className="grid grid-cols-2 gap-3">
											{images.length > 0 ? (
												images.map((img, idx) => (
													<div key={idx} className="group cursor-pointer" onClick={() => setSelectedImage(img.src!)}>
														<div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-red-400 transition bg-gray-100 relative shadow-sm">
															<img src={img.src!} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
															<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
																<ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition" size={24} />
															</div>
														</div>
														<p className="text-xs text-center text-gray-600 mt-2 font-medium">{img.label}</p>
													</div>
												))
											) : (
												<>
													{[0, 1, 2, 3].map((i) => (
														<div key={i}>
															<div className="aspect-[4/3] rounded-lg bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
																<User size={36} className="text-gray-300" />
															</div>
															<p className="text-xs text-center text-gray-400 mt-2">
																{["CCCD mặt trước", "CCCD mặt sau", "Minh chứng ưu tiên", "Minh chứng thanh toán"][i]}
															</p>
														</div>
													))}
												</>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Xem hợp đồng - Center bottom */}
							{contract.status_payment === "paid" && (
								<div className="mt-3 flex justify-center">
									<button
										onClick={() => setActiveTab("preview")}
										className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
									>
										<Eye size={18} /> Xem hợp đồng
									</button>
								</div>
							)}

							{/* Quick Actions */}
							{contract.status_payment === "unpaid" && (
								<div className="mt-3 flex justify-center">
									<button
										onClick={() => setActiveTab("payment")}
										className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
									>
										<CreditCard size={16} /> Thanh toán ngay
									</button>
								</div>
							)}
							
						</div>
					)}

					{/* Tab: Preview */}
					{activeTab === "preview" && (
						<ContractPreview contract={contract} onBack={() => setActiveTab("detail")} />
					)}

					{/* Tab: Payment */}
					{activeTab === "payment" && (
						<div className="max-w-xl mx-auto">
							<div className="flex items-center gap-3 mb-4">
								<button
									className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
									onClick={() => setActiveTab("detail")}
								>
									<ArrowLeft size={18} />
								</button>
								<h3 className="text-lg font-bold text-red-700">Xác nhận thanh toán</h3>
							</div>

							<form className="space-y-4" onSubmit={handleSubmitPayment}>
								<div className="bg-white rounded-xl p-4 shadow-sm border">
									<label className="block font-medium mb-2 text-sm text-gray-700">
										Minh chứng thanh toán (ảnh) <span className="text-red-500">*</span>
									</label>
									<input
										type="file"
										accept="image/*"
										required
										onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
										className="block w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
									/>
									{paymentProof && (
										<div className="mt-3 flex justify-center">
											<img
												src={URL.createObjectURL(paymentProof)}
												alt="preview"
												className="max-w-[200px] h-auto rounded-lg border-2 border-red-200 shadow"
											/>
										</div>
									)}
								</div>

								<div className="bg-white rounded-xl p-4 shadow-sm border">
									<label className="block font-medium mb-2 text-sm text-gray-700">Ghi chú (nếu có)</label>
									<textarea
										className="w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
										rows={2}
										value={note}
										onChange={(e) => setNote(e.target.value)}
										placeholder="Ghi chú cho quản lý..."
									/>
								</div>

								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
										onClick={() => setActiveTab("detail")}
										disabled={uploading}
									>
										Hủy
									</button>
									<button
										type="submit"
										className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition shadow disabled:opacity-50"
										disabled={uploading || !paymentProof}
									>
										{uploading ? "Đang gửi..." : "Xác nhận thanh toán"}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Tab: Cancel Request */}
					{activeTab === "cancel" && (
						<div className="max-w-xl mx-auto">
							<div className="flex items-center gap-3 mb-4">
								<button
									className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
									onClick={() => setActiveTab("detail")}
								>
									<ArrowLeft size={18} />
								</button>
								<h3 className="text-lg font-bold text-red-700">Yêu cầu hủy hợp đồng</h3>
							</div>

							{contract.status !== "approved" && contract.status !== "temporary" ? (
								<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
									<p className="text-sm text-gray-700">
										Bạn chỉ có thể gửi yêu cầu hủy khi hợp đồng đang ở trạng thái <strong>đã duyệt</strong> hoặc <strong>tạm thời</strong>.
									</p>
								</div>
							) : currentCancelRequest ? (
								<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
									<p className="text-sm font-semibold text-gray-900">
										Trạng thái:
										<span className="ml-2 text-blue-700">
											{currentCancelRequest.status === "pending" && "Đang chờ duyệt"}
											{currentCancelRequest.status === "approved" && "Đã chấp thuận"}
											{currentCancelRequest.status === "rejected" && "Đã bị từ chối"}
										</span>
									</p>
									<p className="text-sm text-gray-700">
										<strong>Lý do:</strong> {currentCancelRequest.reason}
									</p>
									{currentCancelRequest.manager_note && (
										<p className="text-sm text-gray-700">
											<strong>Ghi chú quản lý:</strong> {currentCancelRequest.manager_note}
										</p>
									)}
								</div>
							) : (
								<div className="space-y-4">
									<div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
										<p className="text-sm text-gray-700 mb-3">
											Nếu bạn không còn nhu cầu ở KTX, hãy gửi yêu cầu hủy hợp đồng để quản lý xem xét.
										</p>
										<textarea
											className="w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
											rows={3}
											placeholder="Nhập lý do muốn hủy hợp đồng..."
											value={cancelReason}
											onChange={(e) => setCancelReason(e.target.value)}
											disabled={cancelSubmitting}
										/>
										{cancelError && <div className="mt-2 text-xs text-red-600">{cancelError}</div>}
									</div>

									<div className="flex justify-end gap-3">
										<button
											type="button"
											className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
											onClick={() => setActiveTab("detail")}
											disabled={cancelSubmitting}
										>
											Hủy
										</button>
										<button
											type="button"
											className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition shadow disabled:opacity-50"
											onClick={handleSubmitCancelRequest}
											disabled={cancelSubmitting}
										>
											{cancelSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Image Preview Modal */}
			{selectedImage && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
					<div className="relative max-w-4xl max-h-[85vh]">
						<button className="absolute -top-10 right-0 text-white hover:text-red-500 transition" onClick={() => setSelectedImage(null)}>
							<X size={28} />
						</button>
						<img src={selectedImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
					</div>
				</div>
			)}
		</div>
	);
};

// Helper Component
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string }> = ({ icon: Icon, label, value }) => (
	<div className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg">
		<Icon size={14} className="text-red-400 flex-shrink-0" />
		<span className="text-xs text-gray-500 w-14 flex-shrink-0">{label}:</span>
		<span className="text-sm text-gray-800 font-medium truncate">{value || "—"}</span>
	</div>
);

export default ContractDetailModal;
