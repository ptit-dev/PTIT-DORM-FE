import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getContracts, verifyContract } from "@/features/auth/contractApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, X, Loader2, FileText } from "lucide-react";
import { DormApplication } from "@/model/DormApplication";
import { Contract, NullableStringFromDB } from "@/model/Contract";
import ContractPreview from "@/components/forms/ContractForm";

const statusMap: Record<string, string> = {
  temporary: "Chờ duyệt",
  approved: "Đã duyệt",
  canceled: "Đã hủy",
};
const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};
const genderMap: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dormFilter, setDormFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [modal, setModal] = useState<{ open: boolean; contract?: Contract }>({ open: false });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("approved");
  const [verifyNote, setVerifyNote] = useState("");
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);
  const [contractPreview, setContractPreview] = useState<{ open: boolean; contract?: Contract }>({ open: false });
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await getContracts();
      setContracts(res.data || []);
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
    fetchContracts();
    // eslint-disable-next-line
  }, []);

  const dormOptions = React.useMemo(() => {
    const set = new Set<string>();
    contracts.forEach((c) => {
      if (c.room) {
        const building = String(c.room).split("-")[0];
        if (building) set.add(building);
      }
    });
    return Array.from(set).sort();
  }, [contracts]);

  const roomOptions = React.useMemo(() => {
    const set = new Set<string>();
    contracts.forEach((c) => {
      if (c.room) {
        const room = String(c.room);
        const building = room.split("-")[0];
        if (dormFilter === "all" || building === dormFilter) {
          set.add(room);
        }
      }
    });
    return Array.from(set).sort();
  }, [contracts, dormFilter]);

  const contractStats = React.useMemo(
    () => ({
      total: contracts.length,
      approved: contracts.filter((c) => c.status === "approved").length,
      temporary: contracts.filter((c) => c.status === "temporary").length,
      unpaid: contracts.filter((c) => c.status_payment === "unpaid").length,
    }),
    [contracts],
  );

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

  const openModal = (contract: Contract) => {
    setModal({ open: true, contract });
    setVerifyStatus("approved");
    setVerifyNote("");
  };

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.dorm_application?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dorm_application?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || c.status_payment === paymentFilter;
    const building = c.room ? String(c.room).split("-")[0] : "";
    const matchesDorm = dormFilter === "all" || building === dormFilter;
    const matchesRoom = roomFilter === "all" || (c.room && String(c.room) === roomFilter);
    return matchesSearch && matchesStatus && matchesPayment && matchesDorm && matchesRoom;
  });

  const handleVerify = async () => {
    if (!modal.contract) return;
    setVerifyLoading(true);
    try {
      await verifyContract(String(modal.contract.id), { status: verifyStatus, note: verifyNote });
      setModal({ open: false });
      fetchContracts();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Danh sách hợp đồng ký túc xá</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Tổng số hợp đồng</span>
                <span className="mt-1 text-xl font-semibold text-red-700">{contractStats.total}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Đã duyệt</span>
                <span className="mt-1 text-xl font-semibold text-emerald-600">{contractStats.approved}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Chờ duyệt</span>
                <span className="mt-1 text-xl font-semibold text-amber-600">{contractStats.temporary}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Chưa thanh toán</span>
                <span className="mt-1 text-xl font-semibold text-gray-700">{contractStats.unpaid}</span>
              </div>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã SV, tên, phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                className="border rounded-lg px-4 py-2 text-sm bg-white min-w-[120px]"
                value={dormFilter}
                onChange={(e) => setDormFilter(e.target.value)}
              >
                <option value="all">Tất cả KTX</option>
                {dormOptions.map((dorm) => (
                  <option key={dorm} value={dorm}>{dorm}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-4 py-2 text-sm bg-white min-w-[140px]"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="all">Tất cả phòng</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-4 py-2 text-sm bg-white min-w-[150px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái duyệt</option>
                <option value="temporary">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="canceled">Đã hủy</option>
              </select>
              <select
                className="border rounded-lg px-4 py-2 text-sm bg-white min-w-[170px]"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái thanh toán</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
              </select>
            </div>

            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-gray-400 text-center py-10">
                {contracts.length === 0 ? "Chưa có hợp đồng nào." : "Không tìm thấy hợp đồng phù hợp."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Mã SV</th>
                      <th className="p-4 text-left">Họ tên</th>
                      <th className="p-4 text-left">Phòng</th>
                      <th className="p-4 text-left">Đối tượng ưu tiên</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-left">Thanh toán</th>
                      <th className="p-4 text-left">Thời hạn</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((c) => (
                      <tr key={String(c.id)} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold text-blue-700">{c.dorm_application?.student_id || "—"}</td>
                        <td className="p-4">{c.dorm_application?.full_name || "—"}</td>
                        <td className="p-4 font-semibold text-red-700">{String(c.room)}</td>
                        <td className="p-4">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {c.dorm_application?.priority_group || "Không"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'canceled' ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>{statusMap[c.status]}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${c.status_payment === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{paymentMap[c.status_payment]}</span>
                        </td>
                        <td className="p-4 text-xs">{new Date(c.start_date as string | number | Date).toLocaleDateString("vi-VN")} - {new Date(c.end_date as string | number | Date).toLocaleDateString("vi-VN")}</td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 w-24" onClick={() => openModal(c)}>
                              Xem chi tiết
                            </button>
                            {c.status === 'approved' && c.status_payment === 'paid' && (
                              <button 
                                className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 w-28" 
                                onClick={() => setContractPreview({ open: true, contract: c })}
                              >
                                Xem hợp đồng
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 text-sm text-gray-500 border-t">
                  Hiển thị {filteredContracts.length} / {contracts.length} hợp đồng
                </div>
              </div>
            )}
          </div>
          {/* Modal xem/duyệt hợp đồng */}
          <Dialog open={modal.open} onOpenChange={(open) => !open && setModal({ open: false })}>
            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-red-700">
                  Thông tin chi tiết hợp đồng ký túc xá
                </DialogTitle>
              </DialogHeader>

              {modal.contract && (
                <form className="space-y-6 mt-4">
                  {/* Ảnh giấy tờ */}
                  <div className="flex flex-wrap gap-8 items-center justify-center mb-2">
                    {modal.contract.dorm_application?.avatar_front && (
                      <div className="flex flex-col items-center">
                        <img 
                          src={modal.contract.dorm_application.avatar_front} 
                          alt="CCCD mặt trước" 
                          className="w-40 h-56 rounded border object-cover shadow cursor-pointer hover:opacity-80 transition" 
                          onClick={() => setPreviewFile({ url: modal.contract!.dorm_application!.avatar_front!, title: 'CCCD mặt trước' })}
                        />
                        <span className="mt-2 text-xs text-gray-600">CCCD mặt trước</span>
                      </div>
                    )}
                    {modal.contract.dorm_application?.avatar_back && (
                      <div className="flex flex-col items-center">
                        <img 
                          src={modal.contract.dorm_application.avatar_back} 
                          alt="CCCD mặt sau" 
                          className="w-40 h-56 rounded border object-cover shadow cursor-pointer hover:opacity-80 transition" 
                          onClick={() => setPreviewFile({ url: modal.contract!.dorm_application!.avatar_back!, title: 'CCCD mặt sau' })}
                        />
                        <span className="mt-2 text-xs text-gray-600">CCCD mặt sau</span>
                      </div>
                    )}
                    {modal.contract.dorm_application?.priority_proof && (
                      <div className="flex flex-col items-center">
                        <img 
                          src={modal.contract.dorm_application.priority_proof} 
                          alt="Minh chứng ưu tiên" 
                          className="w-40 h-56 rounded border object-cover shadow cursor-pointer hover:opacity-80 transition" 
                          onClick={() => setPreviewFile({ url: modal.contract!.dorm_application!.priority_proof!, title: 'Minh chứng ưu tiên' })}
                        />
                        <span className="mt-2 text-xs text-gray-600">Minh chứng ưu tiên</span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      {getImageBillUrl(modal.contract.image_bill) ? (
                        <img 
                          src={getImageBillUrl(modal.contract.image_bill) as string} 
                          alt="Ảnh thanh toán" 
                          className="w-40 h-56 rounded border object-cover shadow cursor-pointer hover:opacity-80 transition" 
                          onClick={() => setPreviewFile({ url: getImageBillUrl(modal.contract!.image_bill) as string, title: 'Minh chứng thanh toán' })}
                        />
                      ) : (
                        <div className="w-40 h-56 rounded border border-red-200 bg-red-50 flex flex-col items-center justify-center text-center p-4 shadow-sm">
                          <p className="text-xs font-medium text-red-700">Chưa có ảnh minh chứng thanh toán</p>
                        </div>
                      )}
                      <span className="mt-2 text-xs font-semibold text-gray-600">Minh chứng thanh toán</span>
                    </div>
                  </div>

                  {/* Thông tin cá nhân */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Mã sinh viên</label>
                      <Input value={modal.contract.dorm_application?.student_id || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Họ tên</label>
                      <Input value={modal.contract.dorm_application?.full_name || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Ngày sinh</label>
                      <Input value={modal.contract.dorm_application?.dob ? new Date(modal.contract.dorm_application.dob).toLocaleDateString("vi-VN") : ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Giới tính</label>
                      <Input value={genderMap[modal.contract.dorm_application?.gender] || modal.contract.dorm_application?.gender || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">CCCD</label>
                      <Input value={modal.contract.dorm_application?.cccd || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Ngày cấp</label>
                      <Input value={modal.contract.dorm_application?.cccd_issue_date ? new Date(modal.contract.dorm_application.cccd_issue_date).toLocaleDateString("vi-VN") : ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-gray-800">Nơi cấp CCCD</label>
                    <Input value={modal.contract.dorm_application?.cccd_issue_place || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                  </div>

                  {/* Thông tin liên hệ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Số điện thoại</label>
                      <Input value={modal.contract.dorm_application?.phone || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Email</label>
                      <Input value={modal.contract.dorm_application?.email || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Quê quán</label>
                      <Input value={modal.contract.dorm_application?.hometown || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  {/* Thông tin học tập */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Lớp</label>
                      <Input value={modal.contract.dorm_application?.class || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Khóa</label>
                      <Input value={modal.contract.dorm_application?.course || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Hệ đào tạo</label>
                      <Input value={modal.contract.dorm_application?.admission_type || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Ngành học</label>
                      <Input value={modal.contract.dorm_application?.faculty || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  {/* Thông tin cá nhân bổ sung */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Dân tộc</label>
                      <Input value={modal.contract.dorm_application?.ethnicity || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Tôn giáo</label>
                      <Input value={modal.contract.dorm_application?.religion || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  {/* Người bảo lãnh */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Họ tên người bảo lãnh</label>
                      <Input value={modal.contract.dorm_application?.guardian_name || "Không có"} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">SĐT người bảo lãnh</label>
                      <Input value={modal.contract.dorm_application?.guardian_phone || "Không có"} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  {/* Đối tượng ưu tiên */}
                  <div className="space-y-2">
                    <label className="font-semibold text-gray-800">Đối tượng ưu tiên</label>
                    <Input value={modal.contract.dorm_application?.priority_group || "Không thuộc diện ưu tiên"} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                  </div>

                  {/* Thông tin hợp đồng */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-bold text-red-700 mb-4">Thông tin hợp đồng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Khu KTX mong muốn</label>
                        <Input value={modal.contract.dorm_application?.preferred_site || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Tòa nhà mong muốn</label>
                        <Input value={modal.contract.dorm_application?.preferred_dorm || ""} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Phòng được xếp</label>
                        <Input value={modal.contract.room || ""} readOnly disabled className="font-bold text-red-700 disabled:opacity-100" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Trạng thái hợp đồng</label>
                        <Input value={statusMap[modal.contract.status] || modal.contract.status} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Trạng thái thanh toán</label>
                        <Input value={paymentMap[modal.contract.status_payment] || modal.contract.status_payment} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Phí hàng tháng</label>
                        <Input value={`${modal.contract.monthly_fee?.toLocaleString("vi-VN")}đ`} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Tổng tiền</label>
                        <Input value={`${modal.contract.total_amount?.toLocaleString("vi-VN")}đ`} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Ngày bắt đầu</label>
                        <Input value={new Date(modal.contract.start_date as string).toLocaleDateString("vi-VN")} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold text-gray-800">Ngày kết thúc</label>
                        <Input value={new Date(modal.contract.end_date as string).toLocaleDateString("vi-VN")} readOnly disabled className="disabled:text-gray-900 disabled:opacity-100" />
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Ghi chú từ đơn đăng ký</label>
                      <Textarea value={modal.contract.dorm_application?.notes || "Không có ghi chú"} readOnly disabled rows={3} className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-gray-800">Ghi chú hợp đồng</label>
                      <Textarea value={modal.contract.note || "Không có ghi chú"} readOnly disabled rows={3} className="disabled:text-gray-900 disabled:opacity-100" />
                    </div>
                  </div>

                  {/* Form duyệt hợp đồng */}
                  {modal.contract.status === 'temporary' && modal.contract.status_payment === 'paid' && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-bold text-red-700 mb-4">Duyệt hợp đồng</h3>
                      <div className={`space-y-4 ${verifyLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-semibold text-gray-800">Trạng thái duyệt</label>
                            <Select value={verifyStatus} onValueChange={setVerifyStatus} disabled={verifyLoading}>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">Duyệt hợp đồng</SelectItem>
                                <SelectItem value="canceled">Không duyệt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-semibold text-gray-800">Ghi chú</label>
                            <Textarea
                              placeholder="Nhập ghi chú (nếu có)"
                              value={verifyNote}
                              onChange={e => setVerifyNote(e.target.value)}
                              disabled={verifyLoading}
                              className="resize-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setModal({ open: false })} disabled={verifyLoading}>
                            Đóng
                          </Button>
                          <Button type="button" variant="destructive" onClick={handleVerify} disabled={verifyLoading}>
                            {verifyLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Xác nhận duyệt
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {modal.contract.status === 'temporary' && modal.contract.status_payment !== 'paid' && (
                    <div className="border-t pt-4">
                      <div className="text-center text-red-700">Học viên chưa thanh toán, hợp đồng chưa thể duyệt.</div>
                      <div className="flex justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setModal({ open: false })}>
                          Đóng
                        </Button>
                      </div>
                    </div>
                  )}

                  {modal.contract.status !== 'temporary' && (
                    <div className="flex justify-end pt-4">
                      <Button type="button" variant="outline" onClick={() => setModal({ open: false })}>
                        Đóng
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal preview ảnh */}
          <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
            <DialogContent className="max-w-5xl w-full max-h-[95vh] p-0 overflow-hidden">
              <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 pr-12">
                <DialogTitle className="text-lg font-semibold text-red-700 truncate pr-4">
                  {previewFile?.title}
                </DialogTitle>
                <a
                  href={previewFile?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors whitespace-nowrap"
                >
                  Mở tab mới
                </a>
              </DialogHeader>
              <div className="flex-1 overflow-auto bg-gray-100" style={{ height: 'calc(95vh - 80px)' }}>
                <div className="flex items-center justify-center p-4 min-h-full">
                  <img
                    src={previewFile?.url}
                    alt={previewFile?.title}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={contractPreview.open} onOpenChange={(open) => !open && setContractPreview({ open: false })}>
            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {contractPreview.contract && contractPreview.contract.dorm_application && (
                <ContractPreview 
                  contract={contractPreview.contract} 
                  onBack={() => setContractPreview({ open: false })} 
                />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default ContractList;
