import React, { useEffect, useState } from "react";
import { getMyContracts } from "@/features/auth/api";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ContractCard from "@/components/ui/contract-card";
import ContractDetailModal from "@/components/forms/ContractDetailModal";
import { FileText } from "lucide-react";
import { Contract } from "@/model/Contract";
import { NotificationDialog } from "@/components/ui/notification-dialog";

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
    setLoading(true);
    getMyContracts()
      .then((contractsRes) => {
        setContracts(contractsRes);
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          showNotification("Lỗi", e.message, "error");
        } else {
          showNotification("Lỗi", "Đã xảy ra lỗi khi tải dữ liệu hợp đồng.", "error");
        }
      })
      .finally(() => setLoading(false));
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
                  return (
                    <ContractCard
                      key={c.id}
                      contract={c}
                      isCodeVisible={showCodeMap[codeId] || false}
                      isCopied={copiedMap[codeId] || false}
                      onToggleCode={() => toggleShowCode(c.id)}
                      onCopyCode={() => copyCode(codeId)}
                      onViewDetail={() => setSelectedContract(c)}
                    />
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