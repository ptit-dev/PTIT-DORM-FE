import React from "react";
import { Eye, EyeOff, Copy, Check, FileText } from "lucide-react";
import { DormApplication } from "@/model/DormApplication";
import { Contract, NullableStringFromDB } from "@/model/Contract";

const statusMap: Record<string, { label: string; color: string }> = {
	temporary: { label: "Tạm thời", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
	approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700 border-green-300" },
	canceled: { label: "Đã hủy", color: "bg-gray-200 text-gray-600 border-gray-300" },
};

const paymentMap: Record<string, { label: string; color: string }> = {
	unpaid: { label: "Chưa TT", color: "bg-red-100 text-red-700 border-red-300" },
	paid: { label: "Đã Thanh toán", color: "bg-green-100 text-green-700 border-green-300" },
};

interface ContractCardProps {
	contract: Contract;
	isCodeVisible: boolean;
	isCopied: boolean;
	onToggleCode: () => void;
	onCopyCode: () => void;
	onViewDetail: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({
	contract,
	isCodeVisible,
	isCopied,
	onToggleCode,
	onCopyCode,
	onViewDetail,
}) => {
	const maskContractCode = (code: string | number) => {
		const codeStr = String(code);
		if (codeStr.length <= 8) return "••••";
		return codeStr.slice(0, 4) + "••••" + codeStr.slice(-4);
	};

	const codeId = String(contract.code ?? contract.id);

	// Format date ngắn gọn: 01/01/26
	const formatShortDate = (dateStr: string | undefined) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" });
	};

	return (
		<div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-lg hover:border-red-200 transition-all duration-200">
			{/* Row 1: Room + Amount + Badges */}
			<div className="flex items-center justify-between gap-2 mb-2">
				<div className="flex items-center gap-2 min-w-0">
					<div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<FileText size={16} className="text-red-600" />
					</div>
					<div className="min-w-0">
						<div className="text-[10px] text-gray-400">Phòng</div>
						<div className="text-base font-bold text-red-700 leading-tight">{String(contract.room)}</div>
					</div>
				</div>
				<div className="text-right flex-shrink-0">
					<div className="text-[10px] text-gray-400">Tổng tiền</div>
					<div className="text-sm font-bold text-red-600">{contract.total_amount?.toLocaleString()}đ</div>
				</div>
			</div>

			{/* Row 2: Time range */}
			<div className="flex items-center gap-2 mb-2 text-xs">
				<div className="flex-1 bg-gray-50 rounded px-2 py-1.5 flex items-center justify-center gap-1">
					<span className="text-gray-400">Từ</span>
					<span className="font-semibold text-gray-700">{formatShortDate(contract.start_date)}</span>
					<span className="text-gray-300 mx-0.5">→</span>
					<span className="font-semibold text-gray-700">{formatShortDate(contract.end_date)}</span>
				</div>
				<div className="flex gap-1 flex-shrink-0">
					<span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${statusMap[contract.status]?.color || "bg-gray-100 text-gray-700"}`}>
						{statusMap[contract.status]?.label || contract.status}
					</span>
					<span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${paymentMap[contract.status_payment]?.color || "bg-gray-100 text-gray-700"}`}>
						{paymentMap[contract.status_payment]?.label || contract.status_payment}
					</span>
				</div>
			</div>

			{/* Row 3: Contract Code */}
			<div className="bg-gray-50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 mb-2">
				<span className="text-[10px] text-gray-400 flex-shrink-0">Mã HĐ:</span>
				<span className="text-xs font-mono font-semibold text-gray-700 truncate flex-1" title={isCodeVisible ? codeId : undefined}>
					{isCodeVisible ? codeId : maskContractCode(codeId)}
				</span>
				<button onClick={onToggleCode} className="p-0.5 hover:bg-gray-200 rounded transition" title={isCodeVisible ? "Ẩn" : "Hiện"}>
					{isCodeVisible ? <EyeOff size={12} className="text-gray-400" /> : <Eye size={12} className="text-gray-400" />}
				</button>
				<button onClick={onCopyCode} className="p-0.5 hover:bg-gray-200 rounded transition" title="Copy">
					{isCopied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-gray-400" />}
				</button>
			</div>

			{/* Action Button */}
			<button
				type="button"
				className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-sm flex items-center justify-center gap-1"
				onClick={onViewDetail}
			>
				<Eye size={12} />
				Xem chi tiết
			</button>
		</div>
	);
};

export default ContractCard;
