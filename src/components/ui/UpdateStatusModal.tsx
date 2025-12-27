import React, { useState } from "react";

interface UpdateStatusModalProps {
  open: boolean;
  currentStatus?: string;
  onClose: () => void;
  onConfirm: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "non-active", label: "Non-active" },
  { value: "inactive", label: "Inactive" },
];

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ open, currentStatus, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(currentStatus || "active");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-xl flex flex-col gap-4">
        <h2 className="text-lg font-bold text-center">Cập nhật trạng thái tài khoản</h2>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-blue-600"
              />
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
            type="button"
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            onClick={() => onConfirm(selected)}
            type="button"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
