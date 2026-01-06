import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';
import { EventApi } from '@fullcalendar/core';
import { EventContentArg } from '@fullcalendar/core';
import { NotificationDialog } from "@/components/ui/notification-dialog";

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

type Staff = {
  id: string;
  staff_id?: string;
  full_name?: string;
  fullname?: string;
  avatar?: string;
};

type DutySchedule = {
  id: string;
  date: string;
  area_id: string;
  description: string;
  staff: Staff;
};

const DutySchedulePage: React.FC = () => {
  const [events, setEvents] = useState<import('@fullcalendar/core').EventInput[]>([]);
  const [allSchedules, setAllSchedules] = useState<DutySchedule[]>([]);
  const [area, setArea] = useState('B1');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', area_id: 'B1', description: '', staff_id: '' });
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const [notification, setNotification] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error";
  }>({
    open: false,
    title: "",
    description: "",
    type: "success",
  });

  const showNotification = (title: string, description: string, type: "success" | "error") => {
    setNotification({ open: true, title, description, type });
  };

  const fetchStaff = async () => {
    try {
      const res = await getManagers();
      setStaffList(res || []);
    } catch (e) {
      setStaffList([]);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (modalOpen) fetchStaff();
  }, [modalOpen]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getDutySchedules();
      setAllSchedules(res || []);
      const filtered = (res || []).filter((s: DutySchedule) => s.area_id === area);
      setEvents(
        filtered.map((s: DutySchedule) => ({
          id: s.id,
          title: `${s.staff.fullname ?? s.staff.full_name ?? ''}`,
          start: s.date,
          allDay: true,
          extendedProps: { ...s },
          backgroundColor: '#f87171',
          borderColor: '#f87171',
        }))
      );
    } catch (e) {
      if (e instanceof Error) {
        showNotification("Lỗi", e.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

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

  const openEdit = (event: EventApi) => {
    const s = event.extendedProps as DutySchedule;
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
        await updateDutySchedule(editId, form);
        showNotification("Thành công", "Cập nhật lịch trực thành công.", "success");
      } else {
        await createDutySchedule(form);
        showNotification("Thành công", "Thêm lịch trực thành công.", "success");
      }
      setModalOpen(false);
      fetchSchedules();
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await deleteDutySchedule(deleteId);
      setDeleteId(null);
      setConfirmDelete(false);
      fetchSchedules();
      showNotification("Thành công", "Xóa lịch trực thành công.", "success");
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
                    {editId && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
                        onClick={() => { setDeleteId(editId); setModalOpen(false); setConfirmDelete(true); }}
                        disabled={loading}
                      >
                        Xóa
                      </button>
                    )}
                    <button type="submit" className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition flex items-center gap-2" disabled={loading}>
                      {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                      {editId ? "Lưu" : "Thêm"}
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
                  disabled={loading}
                >×</button>
                <div className="text-lg font-semibold text-red-700 mb-4">Bạn có chắc chắn muốn xóa lịch trực này?</div>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={() => setConfirmDelete(false)}
                    disabled={loading}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
                    onClick={handleDelete}
                    disabled={loading}
                  >
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

  function renderEventContent(eventInfo: EventContentArg) {
    const s = eventInfo.event.extendedProps;
    return (
      <div className="truncate text-xs font-semibold px-2 py-1 rounded flex items-center gap-2" style={{ background: eventInfo.backgroundColor || '#f87171', color: '#fff' }}>
        {s && s.staff && s.staff.avatar && (
          <img src={s.staff.avatar} alt={s.staff.fullname} className="w-5 h-5 rounded-full object-cover border inline-block" />
        )}
        <span>{eventInfo.event.title}</span>
      </div>
    );
  }
};
export default DutySchedulePage;