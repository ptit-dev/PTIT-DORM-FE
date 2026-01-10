import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import dormData from "@/assets/data.json";
import {
  getElectricBills,
  createElectricBill,
  updateElectricBill,
  deleteElectricBill,
  getElectricBillComplaints,
} from "@/features/auth/electricBillApi";
import { resolveElectricBillComplaint } from "@/features/auth/electricBillComplaintApi";
import { NotificationDialog } from "@/components/ui/notification-dialog";

const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};

const DORMS = dormData.dorms as Array<{ area_id: string; rooms: string[] }>;

type ElectricBill = {
  id: string;
  area_id?: string;
  room_id: string;
  month: string;
  prev_electric: number | null;
  curr_electric: number | null;
  amount: number | null;
  is_confirmed: boolean;
  payment_status: 'unpaid' | 'paid';
  payment_proof?: string;
};

type ElectricBillComplaint = {
  id: string;
  electric_bill_id: string;
  student_name?: string;
  student_id?: string;
  note: string;
  proof?: string;
  created_at?: string;
  status: 'pending' | 'accepted' | 'rejected';
};

const ElectricBillList: React.FC = () => {
  const [bills, setBills] = useState<ElectricBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; bill?: ElectricBill; mode: 'add' | 'edit' }>({ open: false, mode: 'add' });
  const [complaints, setComplaints] = useState<ElectricBillComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintActionLoading, setComplaintActionLoading] = useState<string | null>(null);
  const [complaintModal, setComplaintModal] = useState<{ open: boolean; bill?: ElectricBill; complaints?: ElectricBillComplaint[] }>({ open: false });
  const [form, setForm] = useState<Partial<ElectricBill>>({
    area_id: '',
    room_id: '',
    month: '',
    prev_electric: null,
    curr_electric: null,
  } as unknown as Partial<ElectricBill>);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dormFilter, setDormFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [notification, setNotification] = useState<{ open: boolean; title: string; description: string; type: "success" | "error" }>({
    open: false,
    title: "",
    description: "",
    type: "success",
  });
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const rooms = form.area_id ? (DORMS.find(d => d.area_id === form.area_id)?.rooms || []) : [];

  const showNotification = (title: string, description: string, type: "success" | "error") => {
    setNotification({ open: true, title, description, type });
  };

  const handleResolveComplaint = async (complaintId: string, status: 'accepted' | 'rejected') => {
    setComplaintActionLoading(complaintId + status);
    try {
      await resolveElectricBillComplaint({ complaint_id: complaintId, status });
      await fetchComplaints();
      if (complaintModal.bill) {
        const updated = complaints.filter((c) => c.electric_bill_id === complaintModal.bill.id);
        setComplaintModal((prev) => ({ ...prev, complaints: updated }));
      }
      showNotification("Thành công", "Đã xử lý khiếu nại.", "success");
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setComplaintActionLoading(null);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getElectricBills();
      setBills(res || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await getElectricBillComplaints();
      setComplaints(res || []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setComplaintsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchComplaints();
  }, []);

  const dormOptions = useMemo(() => {
    const set = new Set<string>();
    bills.forEach((b) => {
      if (b.room_id) {
        const building = b.room_id.split("-")[0];
        if (building) set.add(building);
      }
    });
    return Array.from(set).sort();
  }, [bills]);

  const roomOptions = useMemo(() => {
    const set = new Set<string>();
    bills.forEach((b) => {
      if (b.room_id) {
        const room = b.room_id;
        const building = room.split("-")[0];
        if (dormFilter === "all" || building === dormFilter) {
          set.add(room);
        }
      }
    });
    return Array.from(set).sort();
  }, [bills, dormFilter]);

  const billStats = useMemo(
    () => ({
      total: bills.length,
      paid: bills.filter((b) => b.payment_status === "paid").length,
      unpaid: bills.filter((b) => b.payment_status === "unpaid").length,
      confirmed: bills.filter((b) => b.is_confirmed).length,
    }),
    [bills],
  );

  const filteredBills = useMemo(
    () =>
      bills.filter((b) => {
        const building = b.room_id ? b.room_id.split("-")[0] : "";
        const matchesDorm = dormFilter === "all" || building === dormFilter;
        const matchesRoom = roomFilter === "all" || b.room_id === roomFilter;
        return matchesDorm && matchesRoom;
      }),
    [bills, dormFilter, roomFilter],
  );

  const openAdd = () => {
    setModal({ open: true, mode: 'add' });
    setForm({
      area_id: '',
      room_id: '',
      month: '',
      prev_electric: null,
      curr_electric: null,
    });
  };
  const openEdit = (bill: ElectricBill) => {
    setModal({ open: true, bill, mode: 'edit' });
    

    let prevElectric = bill.prev_electric;
    if (bill.month) {
      const [year, month] = bill.month.split('-');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      let prevMonth = monthNum - 1;
      let prevYear = yearNum;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = yearNum - 1;
      }
      
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      const prevBill = bills.find(b => b.room_id === bill.room_id && b.month === prevMonthStr);
      
      if (prevBill && prevBill.curr_electric) {
        prevElectric = prevBill.curr_electric;
      }
    }
    
    setForm({ ...bill, prev_electric: prevElectric });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.curr_electric !== null && form.prev_electric !== null && form.curr_electric < form.prev_electric) {
      showNotification("Lỗi", "Số điện cuối kỳ phải >= số điện đầu kỳ", "error");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        room_id: form.room_id,
        month: form.month,
        prev_electric: Number(form.prev_electric),
        curr_electric: Number(form.curr_electric),
      };
      
      if (modal.mode === 'add') {
        await createElectricBill(submitData);
        showNotification("Thành công", "Thêm hóa đơn thành công.", "success");
      } else if (modal.mode === 'edit' && modal.bill) {
        await updateElectricBill(modal.bill.id, submitData);
        showNotification("Thành công", "Cập nhật hóa đơn thành công.", "success");
      }
      setModal({ open: false, mode: 'add' });
      fetchBills();
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      await deleteElectricBill(deleteId);
      setDeleteId(null);
      setConfirmDelete(false);
      fetchBills();
      showNotification("Thành công", "Xóa hóa đơn thành công.", "success");
    } catch (e: unknown) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      } else {
        showNotification("Lỗi", "Đã xảy ra lỗi không xác định.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-red-700">Danh sách hóa đơn tiền điện</h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Quản lý, theo dõi và xử lý hóa đơn tiền điện theo từng phòng KTX.
                </p>
              </div>
              <button
                className="px-5 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition text-sm"
                onClick={openAdd}
              >
                Thêm hóa đơn
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Tổng số hóa đơn</span>
                <span className="mt-1 text-xl font-semibold text-red-700">{billStats.total}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Đã thanh toán</span>
                <span className="mt-1 text-xl font-semibold text-emerald-600">{billStats.paid}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Chưa thanh toán</span>
                <span className="mt-1 text-xl font-semibold text-amber-600">{billStats.unpaid}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col">
                <span className="text-xs text-gray-500">Đã sinh viên xác nhận</span>
                <span className="mt-1 text-xl font-semibold text-gray-700">{billStats.confirmed}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 text-sm">
              <select
                className="border rounded-lg px-4 py-2 bg-white min-w-[140px]"
                value={dormFilter}
                onChange={(e) => setDormFilter(e.target.value)}
              >
                <option value="all">Tất cả KTX</option>
                {dormOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                className="border rounded-lg px-4 py-2 bg-white min-w-[160px]"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="all">Tất cả phòng</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="text-gray-500 text-lg text-center py-10">Đang tải dữ liệu...</div>
            ) : filteredBills.length === 0 ? (
              <div className="text-gray-400 text-center py-10">Chưa có hóa đơn nào.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left">Phòng</th>
                      <th className="p-4 text-left">Tháng</th>
                      <th className="p-4 text-left">Chỉ số cũ</th>
                      <th className="p-4 text-left">Chỉ số mới</th>
                      <th className="p-4 text-left">Số tiền</th>
                      <th className="p-4 text-left">Thanh toán</th>
                      <th className="p-4 text-left">Xác nhận</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b) => {
                      const billComplaints = complaints.filter((c) => c.electric_bill_id === b.id);
                      return (
                        <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                          <td className="p-4 font-semibold text-red-700">{b.room_id}</td>
                          <td className="p-4">{b.month}</td>
                          <td className="p-4">{b.prev_electric}</td>
                          <td className="p-4">{b.curr_electric}</td>
                          <td className="p-4">{b.amount?.toLocaleString()}đ</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{paymentMap[b.payment_status]}</span>
                          </td>
                          <td className="p-4 text-center">
                            {b.is_confirmed ? <span className="text-green-600 font-bold">✔</span> : <span className="text-gray-400">Chưa</span>}
                          </td>
                          <td className="p-4 text-center flex flex-col gap-1 items-center">
                            <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 mr-2" onClick={() => openEdit(b)}>
                              Sửa
                            </button>
                            <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300" onClick={() => { setDeleteId(b.id); setConfirmDelete(true); }}>
                              Xóa
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 mt-1"
                              disabled={billComplaints.length === 0}
                              onClick={() => setComplaintModal({ open: true, bill: b, complaints: billComplaints })}
                            >
                              Xem khiếu nại ({billComplaints.length})
                            </button>
                            {complaintModal.open && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 relative">
                                  <button
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                                    onClick={() => setComplaintModal({ open: false })}
                                    aria-label="Đóng"
                                  >×</button>
                                  <h3 className="text-xl font-bold text-yellow-700 mb-4 text-center">Khiếu nại hóa đơn phòng {complaintModal.bill?.room_id} ({complaintModal.bill?.month})</h3>
                                  {complaintModal.complaints && complaintModal.complaints.length > 0 ? (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                      {complaintModal.complaints.map((c, idx) => (
                                        <div key={c.id} className="border rounded-lg p-4 bg-gray-50">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-700">#{idx + 1} - {c.student_name || c.student_id}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {c.status === 'pending' ? 'Chờ xử lý' : c.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                            </span>
                                          </div>
                                          <div className="mb-2"><span className="font-medium">Nội dung:</span> {c.note}</div>
                                          {c.proof && (
                                            <div className="mb-2">
                                              <span className="font-medium">Ảnh minh chứng:</span><br />
                                              <a href={c.proof} target="_blank" rel="noopener noreferrer">
                                                <img src={c.proof} alt="Ảnh minh chứng khiếu nại" className="max-h-40 mt-1 rounded border" />
                                              </a>
                                            </div>
                                          )}
                                          {c.created_at && <div className="text-xs text-gray-400">Gửi lúc: {new Date(c.created_at).toLocaleString()}</div>}
                                          {c.status === 'pending' && (
                                            <div className="flex gap-2 mt-2">
                                              <button
                                                className="px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-60"
                                                disabled={complaintActionLoading === c.id + 'accepted'}
                                                onClick={() => handleResolveComplaint(c.id, 'accepted')}
                                              >
                                                {complaintActionLoading === c.id + 'accepted' ? 'Đang duyệt...' : 'Chấp nhận'}
                                              </button>
                                              <button
                                                className="px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                                                disabled={complaintActionLoading === c.id + 'rejected'}
                                                onClick={() => handleResolveComplaint(c.id, 'rejected')}
                                              >
                                                {complaintActionLoading === c.id + 'rejected' ? 'Đang từ chối...' : 'Từ chối'}
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-center">Không có khiếu nại nào cho hóa đơn này.</div>
                                  )}
                                  <div className="flex justify-end mt-6">
                                    <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setComplaintModal({ open: false })}>Đóng</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {modal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setModal({ open: false, mode: 'add' })}
                  aria-label="Đóng"
                  disabled={submitting}
                >×</button>
                <h3 className="text-xl font-bold text-red-700 mb-4 text-center">{modal.mode === 'add' ? 'Thêm hóa đơn' : 'Sửa hóa đơn'}</h3>
                <form className={`space-y-4 ${submitting ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-1">Khu KTX</label>
                      <select
                        className="border rounded px-3 py-2 w-full"
                        required
                        value={form.area_id}
                        onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, area_id: e.target.value, room_id: '' }))}
                        disabled={submitting}
                      >
                        <option value="">-- Chọn khu --</option>
                        {DORMS.map(d => (
                          <option key={d.area_id} value={d.area_id}>{d.area_id}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-medium text-gray-700 mb-1">Phòng</label>
                      <select
                        className="border rounded px-3 py-2 w-full"
                        required
                        value={form.room_id}
                        onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, room_id: e.target.value }))}
                        disabled={submitting || !form.area_id}
                      >
                        <option value="">-- Chọn phòng --</option>
                        {rooms.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <input className="border rounded px-3 py-2" type="month" placeholder="Tháng" required value={form.month} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, month: e.target.value }))} disabled={submitting} />
                    <input className="border rounded px-3 py-2" type="number" min="0" placeholder="Chỉ số cũ (kWh)" required value={form.prev_electric ?? ''} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, prev_electric: e.target.value === '' ? null : Number(e.target.value) }))} disabled={submitting} />
                    <input className="border rounded px-3 py-2" type="number" min="0" placeholder="Chỉ số mới (kWh)" required value={form.curr_electric ?? ''} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, curr_electric: e.target.value === '' ? null : Number(e.target.value) }))} disabled={submitting} />
                  </div>

                  {form.prev_electric !== null && form.prev_electric !== undefined && form.curr_electric !== null && form.curr_electric !== undefined && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-2">
                      <h4 className="font-bold text-red-700 mb-3">Chi tiết tính toán tiền điện:</h4>
                      {(() => {
                        const usage = (form.curr_electric || 0) - (form.prev_electric || 0);
                        const tier2 = Math.min(Math.max(usage - 100, 0), 50);
                        const tier3 = Math.max(usage - 150, 0);
                        const amount = tier2 * 2000 + tier3 * 3000;
                        
                        return (
                          <>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>• Sử dụng: <span className="font-semibold text-lg text-red-700">{usage} kWh</span></p>
                              {usage <= 100 && (
                                <p className="text-green-600 font-medium">• 1-100 kWh: Miễn phí ✓</p>
                              )}
                              {usage > 100 && (
                                <>
                                  <p>• 1-100 kWh: Miễn phí (0đ)</p>
                                  <p>• 101-{100 + tier2} kWh: {tier2} kWh × 2,000đ = <span className="font-semibold">{(tier2 * 2000).toLocaleString('vi-VN')}đ</span></p>
                                  {tier3 > 0 && (
                                    <p>• 151+ kWh: {tier3} kWh × 3,000đ = <span className="font-semibold">{(tier3 * 3000).toLocaleString('vi-VN')}đ</span></p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="border-t-2 border-red-200 pt-3 mt-3">
                              <p className="font-bold text-red-700">Tổng tiền: <span className="text-2xl text-red-700">{amount.toLocaleString('vi-VN')}đ</span></p>
                              <p className="text-xs text-gray-500 mt-1">* Backend sẽ tự tính, giá trị hiển thị chỉ mang tính tham khảo</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setModal({ open: false, mode: 'add' })} disabled={submitting}>Hủy</button>
                    <button type="submit" className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition" disabled={submitting}>
                      {submitting ? 'Đang lưu...' : (modal.mode === 'add' ? 'Thêm' : 'Lưu')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setConfirmDelete(false)}
                  aria-label="Đóng"
                  disabled={submitting}
                >×</button>
                <div className="text-lg font-semibold text-red-700 mb-4">Bạn có chắc chắn muốn xóa hóa đơn này?</div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setConfirmDelete(false)} disabled={submitting}>Hủy</button>
                  <button className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition" onClick={handleDelete} disabled={submitting}>
                    {submitting && <svg className="animate-spin h-5 w-5 text-white inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                    Xóa
                  </button>
                </div>
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

export default ElectricBillList;