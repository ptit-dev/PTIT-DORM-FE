import React, { useEffect, useState } from "react";
import { verifyContractCancelRequest, ContractCancelRequest } from "@/features/auth/contractCancelApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CancelVerifyModalProps {
  request: ContractCancelRequest | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelVerifyModal: React.FC<CancelVerifyModalProps> = ({ request, open, onClose, onSuccess }) => {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [managerNote, setManagerNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus("approved");
    setManagerNote("");
  }, [request, open]);

  const handleSubmit = async () => {
    if (!request) return;
    setLoading(true);
    try {
      await verifyContractCancelRequest(request.id, { status, manager_note: managerNote });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duyệt yêu cầu hủy hợp đồng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Trạng thái</label>
            <select
              className="w-full border rounded p-2 mt-1"
              value={status}
              onChange={e => setStatus(e.target.value as "approved" | "rejected")}
              disabled={loading}
            >
              <option value="approved">Chấp thuận hủy hợp đồng</option>
              <option value="rejected">Từ chối yêu cầu</option>
            </select>
          </div>
          <div>
            <label className="font-semibold">Ghi chú quản lý</label>
            <Textarea
              value={managerNote}
              onChange={e => setManagerNote(e.target.value)}
              placeholder="Nhập ghi chú (nếu có)"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Đóng</Button>
            <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelVerifyModal;
