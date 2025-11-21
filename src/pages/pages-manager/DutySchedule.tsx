
// Trang quản lý lịch trực quản túc với FullCalendar, Sidebar, Header
import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';


import {
  getDutySchedules,
  createDutySchedule,
  updateDutySchedule,
  deleteDutySchedule,
} from '@/features/auth/dutyApi';
import { getManagers } from '@/features/auth/managerApi';

const AREA_OPTIONS = [
  { value: 'B1', label: 'Khu B1' },
  { value: 'B2', label: 'Khu B2' },
  { value: 'B5', label: 'Khu B5' },
  { value: 'B0', label: 'Khu B0 - Ngọc Trục' },
];

const DutySchedulePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [area, setArea] = useState('B1');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', area_id: 'B1', description: '', staff_id: '' });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]); // TODO: lấy từ API nhân viên
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const token = localStorage.getItem("ptit_access_token") || '';


  // Lấy danh sách cán bộ quản túc từ API, gọi lại mỗi khi mở modal
  const fetchStaff = async () => {
    try {
      const res = await getManagers(token);
      setStaffList(res || []);
    } catch (e) {
      setStaffList([]);
    }
  };
  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line
  }, []);

  // Gọi lại khi mở modal thêm/sửa
  useEffect(() => {
    if (modalOpen) fetchStaff();
    // eslint-disable-next-line
  }, [modalOpen]);

  // Lấy lịch trực từ API
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getDutySchedules(token);
      setAllSchedules(res || []);
    } catch (e: any) {
      // eslint-disable-next-line
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line
  }, []);

  // Lọc lịch trực theo khu vực
  useEffect(() => {
    const filtered = allSchedules.filter((s) => s.area_id === area);
    setEvents(
      filtered.map((s) => ({
        id: s.id,
        title: `${s.staff.fullname}`,
        start: s.date,
        allDay: true,
        extendedProps: { ...s },
        backgroundColor: '#f87171',
        borderColor: '#f87171',
      }))
    );
  }, [allSchedules, area]);

  const openAdd = (dateStr = '') => {
    setEditId(null);
    setForm({ date: dateStr, area_id: area, description: '', staff_id: '' });
    setModalOpen(true);
  };
  const openEdit = (event: any) => {
    const s = event.extendedProps;
    setEditId(s.id);
    setForm({
      date: s.date,
      area_id: s.area_id,
      description: s.description,
      staff_id: s.staff.id,
    });
    setModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateDutySchedule(editId, form, token);
      } else {
        await createDutySchedule(form, token);
      }
      setModalOpen(false);
      fetchSchedules();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await deleteDutySchedule(deleteId, token);
      setDeleteId(null);
      setConfirmDelete(false);
      fetchSchedules();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold text-red-700">Lịch trực quản túc</h2>
              <div className="flex gap-3 items-center">
                <label className="font-medium mr-2">Chọn khu:</label>
                <select className="border rounded px-3 py-2 text-red-700 font-semibold" value={area} onChange={e => setArea(e.target.value)}>
                  {AREA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button className="px-5 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition" onClick={() => openAdd()}>Thêm lịch trực</button>
              </div>
            </div>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              locales={[viLocale]}
              locale="vi"
              events={events}
              height="auto"
              eventDisplay="block"
              eventContent={renderEventContent}
              dateClick={(info) => openAdd(info.dateStr)}
              eventClick={(info) => openEdit(info.event)}
            />
          </div>
          {/* Modal thêm/sửa lịch trực */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 relative">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                  onClick={() => setModalOpen(false)}
                  aria-label="Đóng"
                  disabled={loading}
                >×</button>
                <h3 className="text-xl font-bold text-red-700 mb-4 text-center">{editId ? "Sửa lịch trực" : "Thêm lịch trực"}</h3>
                <form className={`space-y-4 ${loading ? 'opacity-60 pointer-events-none' : ''}`} onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Ngày trực</label>
                    <input className="border rounded px-3 py-2" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} disabled={loading} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Khu vực</label>
                    <select className="border rounded px-3 py-2" value={form.area_id} onChange={e => setForm(f => ({ ...f, area_id: e.target.value }))} disabled={loading}>
                      {AREA_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Cán bộ trực</label>
                    <select className="border rounded px-3 py-2" value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} disabled={loading} required>
                      <option value="">-- Chọn cán bộ --</option>
                      {staffList.map(staff => (
                        <option key={staff.staff_id || staff.id} value={staff.staff_id || staff.id}>
                          {staff.full_name || staff.fullname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-gray-700">Mô tả</label>
                    <input className="border rounded px-3 py-2" placeholder="Ghi chú, mô tả..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={loading} />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setModalOpen(false)} disabled={loading}>Hủy</button>
                    <button type="submit" className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition flex items-center gap-2" disabled={loading}>
                      {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                      {editId ? "Lưu" : "Thêm"}
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
                  disabled={loading}
                >×</button>
                <div className="text-lg font-semibold text-red-700 mb-4">Bạn có chắc chắn muốn xóa lịch trực này?</div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={() => setConfirmDelete(false)} disabled={loading}>Hủy</button>
                  <button className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition" onClick={handleDelete} disabled={loading}>
                    {loading && <svg className="animate-spin h-5 w-5 text-white inline-block mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
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


function renderEventContent(eventInfo: any) {
  const s = eventInfo.event.extendedProps;
  return (
    <div className="truncate text-xs font-semibold px-2 py-1 rounded flex items-center gap-2" style={{background: eventInfo.backgroundColor || '#f87171', color: '#fff'}}>
      {s && s.staff && s.staff.avatar && (
        <img src={s.staff.avatar} alt={s.staff.fullname} className="w-5 h-5 rounded-full object-cover border inline-block" />
      )}
      <span>{eventInfo.event.title}</span>
    </div>
  );
}

export default DutySchedulePage;
