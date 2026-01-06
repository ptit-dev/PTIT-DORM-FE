import { resolveElectricBillComplaint } from "@/features/auth/electricBillComplaintApi";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  getElectricBills,
  createElectricBill,
  updateElectricBill,
  deleteElectricBill,
  getElectricBillComplaints,
} from "@/features/auth/electricBillApi";

const paymentMap: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
};


// Danh sách KTX và phòng
const DORMS = [
  { area_id: "B1", rooms: [
    "B1-101", "B1-102", "B1-103", "B1-104", "B1-105", "B1-106", "B1-107", "B1-108", "B1-109", "B1-110",
    "B1-201", "B1-202", "B1-203", "B1-204", "B1-205", "B1-206", "B1-207", "B1-208", "B1-209", "B1-210",
    "B1-301", "B1-302", "B1-303", "B1-304", "B1-305", "B1-306", "B1-307", "B1-308", "B1-309", "B1-310",
    "B1-401", "B1-402", "B1-403", "B1-404", "B1-405", "B1-406", "B1-407", "B1-408", "B1-409", "B1-410",
    "B1-501", "B1-502", "B1-503", "B1-504", "B1-505", "B1-506", "B1-507", "B1-508", "B1-509", "B1-510"
  ]},
  { area_id: "B2", rooms: [
    "B2-101", "B2-102", "B2-103", "B2-104", "B2-105", "B2-106", "B2-107", "B2-108", "B2-109", "B2-110",
    "B2-201", "B2-202", "B2-203", "B2-204", "B2-205", "B2-206", "B2-207", "B2-208", "B2-209", "B2-210",
    "B2-301", "B2-302", "B2-303", "B2-304", "B2-305", "B2-306", "B2-307", "B2-308", "B2-309", "B2-310",
    "B2-401", "B2-402", "B2-403", "B2-404", "B2-405", "B2-406", "B2-407", "B2-408", "B2-409", "B2-410",
    "B2-501", "B2-502", "B2-503", "B2-504", "B2-505", "B2-506", "B2-507", "B2-508", "B2-509", "B2-510"
  ]},
  { area_id: "B5", rooms: [
    "B5-101", "B5-102", "B5-103", "B5-104", "B5-105", "B5-106", "B5-107", "B5-108", "B5-109", "B5-110",
    "B5-201", "B5-202", "B5-203", "B5-204", "B5-205", "B5-206", "B5-207", "B5-208", "B5-209", "B5-210",
    "B5-301", "B5-302", "B5-303", "B5-304", "B5-305", "B5-306", "B5-307", "B5-308", "B5-309", "B5-310",
    "B5-401", "B5-402", "B5-403", "B5-404", "B5-405", "B5-406", "B5-407", "B5-408", "B5-409", "B5-410",
    "B5-501", "B5-502", "B5-503", "B5-504", "B5-505", "B5-506", "B5-507", "B5-508", "B5-509", "B5-510"
  ]},
  { area_id: "B0", rooms: [
    "B0-101", "B0-102", "B0-103", "B0-104", "B0-105", "B0-106", "B0-107", "B0-108", "B0-109", "B0-110",
    "B0-201", "B0-202", "B0-203", "B0-204", "B0-205", "B0-206", "B0-207", "B0-208", "B0-209", "B0-210",
    "B0-301", "B0-302", "B0-303", "B0-304", "B0-305", "B0-306", "B0-307", "B0-308", "B0-309", "B0-310",
    "B0-401", "B0-402", "B0-403", "B0-404", "B0-405", "B0-406", "B0-407", "B0-408", "B0-409", "B0-410",
    "B0-501", "B0-502", "B0-503", "B0-504", "B0-505", "B0-506", "B0-507", "B0-508", "B0-509", "B0-510"
  ]},
];

type ElectricBill = {
  id: string;
  area_id?: string; // Added area_id to support form and logic
  room_id: string;
  month: string;
  prev_electric: number | null;
  curr_electric: number | null;
  amount: number | null;
  is_confirmed: boolean;
  payment_status: 'unpaid' | 'paid';
  payment_proof?: string;
  // Add other fields as needed
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
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; bill?: ElectricBill; mode: 'add' | 'edit' }>({ open: false, mode: 'add' });
  const [complaints, setComplaints] = useState<ElectricBillComplaint[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState<string | null>(null);
      const [complaintActionLoading, setComplaintActionLoading] = useState<string | null>(null);
    // Handle accept/reject complaint
    const handleResolveComplaint = async (complaintId: string, status: 'accepted' | 'rejected') => {
      setComplaintActionLoading(complaintId + status);
      try {
        await resolveElectricBillComplaint({ complaint_id: complaintId, status });
        await fetchComplaints();
        // Update modal complaints after action
        if (complaintModal.bill) {
          const updated = complaints.filter((c) => c.electric_bill_id === complaintModal.bill.id);
          setComplaintModal((prev) => ({ ...prev, complaints: updated }));
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          alert(e.message);
        } else {
          alert("Đã xảy ra lỗi không xác định.");
        }
      } finally {
        setComplaintActionLoading(null);
      }
    };
  // Complaint modal state
  const [complaintModal, setComplaintModal] = useState<{ open: boolean; bill?: ElectricBill; complaints?: ElectricBillComplaint[] }>({ open: false });
  const [form, setForm] = useState<Partial<ElectricBill>>({
    area_id: '',
    room_id: '',
    month: '',
    prev_electric: null,
    curr_electric: null,
    amount: null,
    is_confirmed: false,
    payment_status: '',
    payment_proof: '',
  } as unknown as Partial<ElectricBill>);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const [dormFilter, setDormFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  // Lấy danh sách phòng theo area_id
  const rooms = form.area_id ? (DORMS.find(d => d.area_id === form.area_id)?.rooms || []) : [];


  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getElectricBills();
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

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await getElectricBillComplaints();
      setComplaints(res || []);
      setComplaintsError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setComplaintsError(e.message);
      } else {
        setComplaintsError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setComplaintsLoading(false);
    }
  };


  useEffect(() => {
    fetchBills();
    fetchComplaints();
    // eslint-disable-next-line
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
      amount: null,
      is_confirmed: false,
      payment_status: 'unpaid', // để rỗng
      payment_proof: '',
    });
  };
  const openEdit = (bill: ElectricBill) => {
    setModal({ open: true, bill, mode: 'edit' });
    setForm({ ...bill });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Không gửi area_id khi gọi API, ép kiểu số cho các trường số
      const submitData = { ...form };
      delete submitData.area_id;
      submitData.prev_electric = String(form.prev_electric) === '' || form.prev_electric === null ? null : parseInt(String(form.prev_electric), 10);
      submitData.curr_electric = String(form.curr_electric) === '' || form.curr_electric === null ? null : parseInt(String(form.curr_electric), 10);
      submitData.amount = String(form.amount) === '' || form.amount === null ? null : parseInt(String(form.amount), 10);
      if (modal.mode === 'add') {
        await createElectricBill(submitData);
      } else if (modal.mode === 'edit' && modal.bill) {
        await updateElectricBill(modal.bill.id, submitData);
      }
      setModal({ open: false, mode: 'add' });
      fetchBills();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Đã xảy ra lỗi không xác định.");
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
            ) : error ? (
              <div className="text-red-500 text-lg text-center py-10">{error}</div>
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
                                    {/* Modal xem khiếu nại hóa đơn */}
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
                                                  {/* Action buttons for manager */}
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
          {/* Modal thêm/sửa hóa đơn */}
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
                    {/* Chọn KTX */}
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
                    {/* Chọn phòng theo KTX */}
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
                    <input className="border rounded px-3 py-2" type="number" placeholder="Chỉ số cũ" required value={form.prev_electric ?? ''} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, prev_electric: e.target.value === '' ? null : Number(e.target.value) }))} disabled={submitting} />
                    <input className="border rounded px-3 py-2" type="number" placeholder="Chỉ số mới" required value={form.curr_electric ?? ''} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, curr_electric: e.target.value === '' ? null : Number(e.target.value) }))} disabled={submitting} />
                    <input className="border rounded px-3 py-2" type="number" placeholder="Số tiền" required value={form.amount ?? ''} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, amount: e.target.value === '' ? null : Number(e.target.value) }))} disabled={submitting} />
                    {/* Chỉ hiện trạng thái thanh toán và minh chứng khi sửa */}
                    {modal.mode === 'edit' && (
                      <>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="font-medium text-gray-700">Trạng thái thanh toán</label>
                          <select className="border rounded px-3 py-2" value={form.payment_status} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, payment_status: e.target.value as 'unpaid' | 'paid' }))} disabled={submitting}>
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                          </select>
                        </div>
                        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Link minh chứng thanh toán (nếu có)" value={form.payment_proof} onChange={e => setForm((f: Partial<ElectricBill>) => ({ ...f, payment_proof: e.target.value }))} disabled={submitting} />
                      </>
                    )}
                  </div>
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
          {/* Modal xác nhận xóa */}
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
    </div>
  );
};

export default ElectricBillList;
