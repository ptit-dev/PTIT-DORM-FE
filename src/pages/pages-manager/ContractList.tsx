import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getContracts, verifyContract } from "@/features/auth/contractApi";

const statusMap: Record<string, string> = {
  temporary: "Chờ duyệt",
  approved: "Đã duyệt",
  canceled: "Đã hủy",
};
const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

const ContractList: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; contract?: any }>({ open: false });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState("approved");
  const [verifyNote, setVerifyNote] = useState("");
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const token = localStorage.getItem("ptit_access_token") || "";

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await getContracts(token);
      setContracts(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line
  }, []);

  const openModal = (contract: any) => {
    setModal({ open: true, contract });
    setVerifyStatus("approved");
    setVerifyNote("");
  };

  const handleVerify = async () => {
    if (!modal.contract) return;
    setVerifyLoading(true);
    try {
      await verifyContract(modal.contract.id, { status: verifyStatus, note: verifyNote }, token);
      setModal({ open: false });
      fetchContracts();
    } catch (e: any) {
      alert(e.message);
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
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-3xl font-bold text-red-700 mb-6">Danh sách hợp đồng ký túc xá</h2>
            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
            ) : contracts.length === 0 ? (
              <div className="text-gray-400 text-center py-10">Chưa có hợp đồng nào.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Phòng</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-left">Thanh toán</th>
                      <th className="p-4 text-left">Thời hạn</th>
                      <th className="p-4 text-left">Tổng tiền</th>
                      <th className="p-4 text-left">Ngày tạo</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold text-red-700">{c.room}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'approved' ? 'bg-green-100 text-green-700' : c.status === 'canceled' ? 'bg-gray-200 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>{statusMap[c.status]}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${c.status_payment === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{paymentMap[c.status_payment]}</span>
                        </td>
                        <td className="p-4 text-xs">{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</td>
                        <td className="p-4">{c.total_amount?.toLocaleString()}đ</td>
                        <td className="p-4 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-center">
                          <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 mr-2" onClick={() => openModal(c)}>
                            Xem/duyệt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Modal xem/duyệt hợp đồng */}
          {modal.open && modal.contract && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8 relative flex flex-col md:flex-row gap-8">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setModal({ open: false })}
                  aria-label="Đóng"
                  disabled={verifyLoading}
                >×</button>
                {/* Thông tin hợp đồng bên trái */}
                <div className="flex-1 min-w-0 space-y-2 text-sm">
                  <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Chi tiết hợp đồng</h3>
                  <div><b>Phòng:</b> {modal.contract.room}</div>
                  <div><b>Trạng thái:</b> {statusMap[modal.contract.status]}</div>
                  <div><b>Thanh toán:</b> {paymentMap[modal.contract.status_payment]}</div>
                  <div><b>Thời hạn:</b> {new Date(modal.contract.start_date).toLocaleDateString()} - {new Date(modal.contract.end_date).toLocaleDateString()}</div>
                  <div><b>Tổng tiền:</b> {modal.contract.total_amount?.toLocaleString()}đ</div>
                  <div><b>Ngày tạo:</b> {new Date(modal.contract.created_at).toLocaleDateString()}</div>
                  <div><b>Ghi chú:</b> {modal.contract.note || <span className="italic text-gray-400">Không có</span>}</div>
                  {modal.contract.image_bill && (
                    <div><b>Ảnh minh chứng:</b><br /><img src={modal.contract.image_bill} alt="bill" className="w-full max-w-xs rounded border mt-1" /></div>
                  )}
                </div>
                {/* Form duyệt bên phải */}
                {modal.contract.status === 'temporary' && (
                  <form className={`flex-1 min-w-0 flex flex-col justify-between space-y-4 ${verifyLoading ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={e => { e.preventDefault(); handleVerify(); }}>
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-gray-700">Trạng thái duyệt</label>
                      <select className="border rounded px-3 py-2" value={verifyStatus} onChange={e => setVerifyStatus(e.target.value)} disabled={verifyLoading}>
                        <option value="approved">Duyệt hợp đồng</option>
                        <option value="canceled">Không duyệt</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-medium text-gray-700">Ghi chú</label>
                      <input className="border rounded px-3 py-2" placeholder="Ghi chú (nếu có)" value={verifyNote} onChange={e => setVerifyNote(e.target.value)} disabled={verifyLoading} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setModal({ open: false })} disabled={verifyLoading}>Đóng</button>
                      <button type="submit" className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition flex items-center gap-2" disabled={verifyLoading}>
                        {verifyLoading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                        Xác nhận
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ContractList;
