import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getMyRoomElectricBills, confirmElectricBill, uploadElectricBillPaymentProof, createElectricBillComplaint } from "@/features/auth/studentElectricBillApi";


const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

type Bill = {
  id: string | number;
  month: string;
  prev_electric: number;
  curr_electric: number;
  amount: number;
  payment_status: string;
  payment_proof?: string;
  is_confirmed: boolean;
  // Add any other fields you expect from the API
};

const MyRoomElectricBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const [payingId, setPayingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [complaintModal, setComplaintModal] = useState<{ open: boolean, billId?: string }>({ open: false });
  const [complaintNote, setComplaintNote] = useState("");
  const [complaintFile, setComplaintFile] = useState<File | null>(null);
  const [complaintLoading, setComplaintLoading] = useState(false);

  // Xác nhận hóa đơn
  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    try {
      await confirmElectricBill(id);
      // reload bills
      const res = await getMyRoomElectricBills();
      setBills(res || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setConfirmingId(null);
    }
  };

  // Thanh toán hóa đơn (upload minh chứng)
  const handlePayment = async (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files && target.files[0];
      if (!file) return;
      setPayingId(id);
      setUploading(true);
      try {
        await uploadElectricBillPaymentProof(id, file);
        // reload bills
        const res = await getMyRoomElectricBills();
        setBills(res || []);
      } catch (e: unknown) {
        if (e instanceof Error) {
          alert(e.message);
        } else {
          alert("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setPayingId(null);
        setUploading(false);
      }
    };
    input.click();
  };

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const res = await getMyRoomElectricBills();
        setBills(res || []);
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
    fetchBills();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">Hóa đơn tiền điện phòng bạn</h2>
            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
            ) : bills.length === 0 ? (
              <div className="text-gray-400 text-center py-10">Chưa có hóa đơn nào.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Tháng</th>
                      <th className="p-4 text-left">Chỉ số cũ</th>
                      <th className="p-4 text-left">Chỉ số mới</th>
                      <th className="p-4 text-left">Số tiền</th>
                      <th className="p-4 text-left">Thanh toán</th>
                      <th className="p-4 text-left">Minh chứng</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        <td className="p-4 font-semibold">{b.month}</td>
                        <td className="p-4">{b.prev_electric}</td>
                        <td className="p-4">{b.curr_electric}</td>
                        <td className="p-4">{b.amount?.toLocaleString()}đ</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{paymentMap[b.payment_status]}</span>
                        </td>
                        <td className="p-4">
                          {b.payment_proof ? (
                            <a href={b.payment_proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Xem</a>
                          ) : (
                            <span className="text-gray-400">Chưa có</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-row gap-3 min-w-[260px] justify-center">
                            <button
                              className="px-4 py-2 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
                              disabled={b.is_confirmed || confirmingId === b.id}
                              onClick={() => handleConfirm(String(b.id))}
                            >
                              {confirmingId === b.id ? 'Đang xác nhận...' : (b.is_confirmed ? 'Đã xác nhận' : 'Xác nhận')}
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                              disabled={!b.is_confirmed || b.payment_status === 'paid' || uploading}
                              onClick={() => handlePayment(String(b.id))}
                            >
                              {payingId === b.id && uploading ? 'Đang tải...' : (b.payment_status === 'paid' ? 'Đã thanh toán' : 'Thanh toán')}
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500"
                              onClick={() => setComplaintModal({ open: true, billId: String(b.id) })}
                              disabled={b.is_confirmed}
                            >
                              Khiếu nại
                            </button>
                                {/* Modal khiếu nại hóa đơn */}
                                {complaintModal.open && (
                                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
                                      <button
                                        className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                                        onClick={() => { setComplaintModal({ open: false }); setComplaintNote(""); setComplaintFile(null); }}
                                        aria-label="Đóng"
                                        disabled={complaintLoading}
                                      >×</button>
                                      <h3 className="text-xl font-bold text-red-700 mb-4 text-center">Khiếu nại hóa đơn điện</h3>
                                      <form
                                        className={`space-y-4 ${complaintLoading ? 'opacity-60 pointer-events-none' : ''}`}
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          if (!complaintNote.trim()) {
                                            alert('Vui lòng nhập nội dung khiếu nại!');
                                            return;
                                          }
                                          if (!complaintModal.billId) {
                                            alert('Không xác định được hóa đơn để khiếu nại!');
                                            return;
                                          }
                                          setComplaintLoading(true);
                                          try {
                                            await createElectricBillComplaint({
                                              electric_bill_id: complaintModal.billId,
                                              note: complaintNote,
                                              proof: complaintFile || undefined,
                                              student_id: user?.user_id,
                                            });
                                            setComplaintModal({ open: false });
                                            setComplaintNote("");
                                            setComplaintFile(null);
                                            // reload bills nếu cần
                                            alert('Gửi khiếu nại thành công!');
                                          } catch (e: unknown) {
                                            if (e instanceof Error) {
                                              alert(e.message);
                                            } else {
                                              alert("Đã xảy ra lỗi không xác định.");
                                            }
                                          } finally {
                                            setComplaintLoading(false);
                                          }
                                        }}
                                      >
                                        <div>
                                          <label className="block font-medium mb-1">Nội dung khiếu nại <span className="text-red-600">*</span></label>
                                          <textarea
                                            className="border rounded px-3 py-2 w-full min-h-[80px]"
                                            value={complaintNote}
                                            onChange={e => setComplaintNote(e.target.value)}
                                            required
                                            disabled={complaintLoading}
                                          />
                                        </div>
                                        <div>
                                          <label className="block font-medium mb-1">Ảnh minh chứng (tùy chọn)</label>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setComplaintFile(e.target.files?.[0] || null)}
                                            disabled={complaintLoading}
                                          />
                                          {complaintFile && <div className="text-xs text-gray-500 mt-1">{complaintFile.name}</div>}
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                          <button
                                            type="button"
                                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                            onClick={() => { setComplaintModal({ open: false }); setComplaintNote(""); setComplaintFile(null); }}
                                            disabled={complaintLoading}
                                          >Hủy</button>
                                          <button
                                            type="submit"
                                            className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
                                            disabled={complaintLoading}
                                          >
                                            {complaintLoading ? 'Đang gửi...' : 'Gửi khiếu nại'}
                                          </button>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyRoomElectricBills;
