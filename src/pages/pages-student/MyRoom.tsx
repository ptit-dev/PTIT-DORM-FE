import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getMyRoomMembers } from "@/features/auth/api";
import dormData from "@/assets/data.json";
import { Badge } from "@/components/ui/badge";

interface DormConfig {
  area_id: string;
  rooms: string[];
}

interface RoomMember {
  username: string; // Mã sinh viên
  fullname: string;
  class: string;
  avatar: string;
  student_id: string; // user_id nội bộ hệ thống
}

const MyRoom: React.FC = () => {
  const [room, setRoom] = useState<string | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const dorms = useMemo(() => dormData.dorms as DormConfig[], []);

  const roomMeta = useMemo(() => {
    if (!room) return null;
    const [areaId, code] = room.split("-");
    const floor = code?.charAt(0) ?? "";
    const dorm = dorms.find((d) => d.area_id === areaId);
    const max = areaId === "B2" || areaId === "B5" ? 8 : 4;
    return {
      areaId,
      floor,
      max,
      current: members.length,
    };
  }, [room, dorms, members.length]);

  useEffect(() => {
    setLoading(true);
    getMyRoomMembers()
      .then((res: { room: string; data: RoomMember[] }) => {
        setRoom(res.room || null);
        setMembers(res.data || []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-500 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Phòng ở của bạn</h2>
                <p className="text-sm text-red-100">
                  Thông tin tổng quan về phòng hiện tại và bạn cùng phòng.
                </p>
              </div>
              {room && roomMeta && (
                <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                  <div className="text-lg font-semibold">
                    Phòng <span className="font-bold">{room}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/50 bg-white/10 text-white text-xs">
                      KTX {roomMeta.areaId}
                    </Badge>
                    <Badge variant="outline" className="border-white/50 bg-white/10 text-white text-xs">
                      Tầng {roomMeta.floor}
                    </Badge>
                    <Badge variant="outline" className="border-white/50 bg-white/10 text-white text-xs">
                      {roomMeta.current}/{roomMeta.max} sinh viên
                    </Badge>
                  </div>
                  <div className="w-40 h-1.5 rounded-full bg-white/30 overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full bg-emerald-300"
                      style={{ width: `${Math.min(100, (roomMeta.current / roomMeta.max) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              {error && (
                <div className="text-red-600 mb-4" role="alert">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="text-gray-500 text-center">Đang tải dữ liệu...</div>
              ) : !room ? (
                <div className="text-gray-500 text-center">
                  Bạn chưa có phòng ở nào được duyệt.
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-4 text-red-700 text-left">Danh sách bạn cùng phòng</h3>
                  {members.length === 0 ? (
                    <div className="text-gray-500 text-center">
                      Không có thành viên nào khác trong phòng.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((s) => (
                        <div
                          key={s.student_id}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 shadow-sm"
                        >
                          <img
                            src={s.avatar}
                            alt={s.fullname}
                            className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                          />
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">{s.fullname}</div>
                            <div className="text-gray-600 text-xs">Mã SV: {s.username}</div>
                            <div className="text-gray-500 text-xs">Lớp: {s.class}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyRoom;
