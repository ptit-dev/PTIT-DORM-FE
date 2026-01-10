import React, { useEffect, useState } from "react";
import { getMyContracts, renewalContract } from "@/features/auth/api";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ContractCard from "@/components/ui/contract-card";
import ContractDetailModal from "@/components/forms/ContractDetailModal";
import { FileText } from "lucide-react";
import { Contract } from "@/model/Contract";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import { getMyContractCancelRequests } from "@/features/auth/contractCancelApi";

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
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [cancelRequests, setCancelRequests] = useState<LocalCancelRequest[]>([]);
  const [showCodeMap, setShowCodeMap] = useState<Record<string, boolean>>({});
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [renewalModal, setRenewalModal] = useState<{ open: boolean; contract?: Contract }>({ open: false });
  const [renewalForm, setRenewalForm] = useState<{
    semester: string;
    image_bill: string;
    note: string;
  }>({ semester: '1', image_bill: '', note: '' });
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; title: string; description: string; type: "success" | "error" }>({
    open: false,
    title: "",
    description: "",
    type: "success",
  });

  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "approved").length;
  const unpaidContracts = contracts.filter((c) => c.status_payment === "unpaid").length;

  const showNotification = (title: string, description: string, type: "success" | "error") => {
    setNotification({ open: true, title, description, type });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [contractsRes, cancelRes] = await Promise.all([
          getMyContracts(),
          getMyContractCancelRequests(),
        ]);
        setContracts(contractsRes);
        setCancelRequests(
          cancelRes.map((c) => ({
            contract_id: c.contract_id,
            status: c.status,
            reason: c.reason,
            manager_note: c.manager_note,
          })),
        );
      } catch (e: unknown) {
        if (e instanceof Error) {
          showNotification("Lỗi", e.message, "error");
        } else {
          showNotification("Lỗi", "Đã xảy ra lỗi khi tải dữ liệu hợp đồng.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleShowCode = (id: string | number) => {
    const key = String(id);
    setShowCodeMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyCode = (code: string | number) => {
    const key = String(code);
    navigator.clipboard.writeText(String(code));
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    showNotification("Thành công", "Đã sao chép mã hợp đồng!", "success");
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  const handleCancelRequestSubmit = (request: LocalCancelRequest) => {
    setCancelRequests((prev) => [...prev.filter((req) => req.contract_id !== request.contract_id), request]);
  };

  const handlePaymentSuccess = () => {
    setSelectedContract(null);
    getMyContracts().then(setContracts).catch(console.error);
  };

  const isContractExpired = (contract: Contract): boolean => {
    // Ưu tiên trạng thái từ backend
    if (contract.status === "expired") return true;

    // Fallback: tự tính theo ngày kết thúc
    if (!contract.end_date) return false;
    return new Date(contract.end_date) < new Date();
  };

  const calculateRenewalEndDate = (semester: string): string => {
    const today = new Date();
    const startDate = today;
    let monthsToAdd = 5; // Mặc định cho kỳ 1, 2

    if (semester === '3') {
      monthsToAdd = 1.5; // 1 tháng rưỡi = 45 ngày
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 45);
      return endDate.toISOString().split('T')[0];
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    return endDate.toISOString().split('T')[0];
  };

  const calculateRenewalAmount = (semester: string, monthlyFee?: number): number => {
    if (!monthlyFee) return 0;
    if (semester === '3') {
      return Math.round(monthlyFee * 1.5);
    }
    return monthlyFee * 5;
  };

  const handleRenewalSubmit = async () => {
    if (!renewalModal.contract) return;
    
    setRenewalLoading(true);
    try {
      const endDate = calculateRenewalEndDate(renewalForm.semester);
      const totalAmount = calculateRenewalAmount(renewalForm.semester, renewalModal.contract.monthly_fee);

      await renewalContract(String(renewalModal.contract.id), {
        semester: renewalForm.semester,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate,
        total_amount: totalAmount,
        image_bill: renewalForm.image_bill,
        note: renewalForm.note,
      });

      showNotification("Thành công", "Gia hạn hợp đồng thành công!", "success");
      setRenewalModal({ open: false });
      setRenewalForm({ semester: '1', image_bill: '', note: '' });
      getMyContracts().then(setContracts).catch(console.error);
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi khi gia hạn hợp đồng.", "error");
      }
    } finally {
      setRenewalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-red-700">
                      Hợp đồng của tôi
                    </h2>
                    <p className="text-xs text-gray-500">
                      Theo dõi trạng thái hợp đồng và thanh toán
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-blue-100">
                    <span className="text-xs text-blue-600 font-medium">Tổng</span>
                    <span className="text-lg font-bold text-blue-700">{totalContracts}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-green-100">
                    <span className="text-xs text-green-600 font-medium">Hiệu lực</span>
                    <span className="text-lg font-bold text-green-700">{activeContracts}</span>
                  </div>
                  <div className="bg-red-50 rounded-lg px-3 py-2 flex items-center gap-2 border border-red-100">
                    <span className="text-xs text-red-600 font-medium">Chưa TT</span>
                    <span className="text-lg font-bold text-red-700">{unpaidContracts}</span>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-gray-500 text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                Đang tải dữ liệu...
              </div>
            ) : contracts.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                <p className="text-gray-500">Bạn chưa có hợp đồng nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {contracts.map((c) => {
                  const codeId = String(c.code ?? c.id);
                  const isExpired = isContractExpired(c);
                  return (
                    <div key={c.id} className="relative">
                      <ContractCard
                        contract={c}
                        isCodeVisible={showCodeMap[codeId] || false}
                        isCopied={copiedMap[codeId] || false}
                        onToggleCode={() => toggleShowCode(c.id)}
                        onCopyCode={() => copyCode(codeId)}
                        onViewDetail={() => setSelectedContract(c)}
                      />
                      {isExpired && (
                        <button
                          onClick={() => {
                            setRenewalModal({ open: true, contract: c });
                            setRenewalForm({ semester: '1', image_bill: '', note: '' });
                          }}
                          className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full hover:from-red-600 hover:to-red-700 transition shadow-lg animate-pulse"
                        >
                          Gia hạn ngay
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedContract && (
            <ContractDetailModal
              contract={selectedContract}
              cancelRequests={cancelRequests}
              onClose={() => setSelectedContract(null)}
              onCancelRequestSubmit={handleCancelRequestSubmit}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}

          {renewalModal.open && renewalModal.contract && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setRenewalModal({ open: false })}
                  aria-label="Đóng"
                  disabled={renewalLoading}
                >×</button>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-red-700 mb-2">Gia hạn hợp đồng</h3>
                  <p className="text-sm text-gray-600">
                    Phòng: <span className="font-semibold">{renewalModal.contract.room}</span>
                  </p>
                </div>

                <form className={`space-y-5 ${renewalLoading ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={(e) => {
                  e.preventDefault();
                  handleRenewalSubmit();
                }}>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Chọn học kỳ <span className="text-red-600">*</span></label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                      value={renewalForm.semester}
                      onChange={(e) => setRenewalForm({ ...renewalForm, semester: e.target.value })}
                      required
                      disabled={renewalLoading}
                    >
                      <option value="1">Học kỳ 1 (5 tháng)</option>
                      <option value="2">Học kỳ 2 (5 tháng)</option>
                      <option value="3">Học kỳ 3 (1 tháng rưỡi)</option>
                    </select>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-red-700 mb-3">Chi tiết gia hạn:</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>• Ngày bắt đầu: <span className="font-semibold">{new Date().toLocaleDateString('vi-VN')}</span></p>
                      <p>• Ngày kết thúc: <span className="font-semibold">{new Date(calculateRenewalEndDate(renewalForm.semester)).toLocaleDateString('vi-VN')}</span></p>
                      <p>• Phí hàng tháng: <span className="font-semibold">{(renewalModal.contract.monthly_fee || 0).toLocaleString('vi-VN')}đ</span></p>
                    </div>
                    <div className="border-t-2 border-red-200 pt-3 mt-3">
                      <p className="font-bold text-red-700">Tổng tiền: <span className="text-2xl text-red-700">{calculateRenewalAmount(renewalForm.semester, renewalModal.contract.monthly_fee).toLocaleString('vi-VN')}đ</span></p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Ảnh hóa đơn tiền KTX <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      placeholder="Nhập URL ảnh hoặc đường dẫn file"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                      value={renewalForm.image_bill}
                      onChange={(e) => setRenewalForm({ ...renewalForm, image_bill: e.target.value })}
                      required
                      disabled={renewalLoading}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Ghi chú (không bắt buộc)</label>
                    <textarea
                      placeholder="Thêm ghi chú nếu cần thiết..."
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none resize-none"
                      rows={3}
                      value={renewalForm.note}
                      onChange={(e) => setRenewalForm({ ...renewalForm, note: e.target.value })}
                      disabled={renewalLoading}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => setRenewalModal({ open: false })}
                      disabled={renewalLoading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition"
                      disabled={renewalLoading}
                    >
                      {renewalLoading ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <NotificationDialog
        open={notification.open}
        onOpenChange={(open) => setNotification((prev) => ({ ...prev, open }))}
        title={notification.title}
        description={notification.description}
        type={notification.type}
      />
    </div>
  );
};

export default MyContract;