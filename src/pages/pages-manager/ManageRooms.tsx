import React, { useEffect, useMemo, useState } from "react";
import dormData from "@/assets/data.json";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getApprovedContracts, getResidentsByRoom } from "@/features/auth/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DormConfig {
  area_id: string;
  rooms: string[];
}

interface RoomStat {
  room: string;
  residents: number;
  max: number;
  area_id: string;
  floor: string;
}

interface Resident {
  username: string; // Mã sinh viên (student code)
  fullname: string;
  class: string;
  avatar: string;
  student_id: string; // user_id nội bộ hệ thống
}

const ManageRooms: React.FC = () => {
  const [roomStats, setRoomStats] = useState<RoomStat[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("B1");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  const dorms = useMemo(() => dormData.dorms as DormConfig[], []);
  const areaOptions = useMemo(() => dorms.map((d) => d.area_id), [dorms]);

  useEffect(() => {
    setLoading(true);
    getApprovedContracts()
      .then((contracts) => {
        // Build all rooms from data.json
        const allRooms: RoomStat[] = [];
        dorms.forEach((dorm) => {
          const max = dorm.area_id === "B2" || dorm.area_id === "B5" ? 8 : 4;
          dorm.rooms.forEach((room) => {
            const [, code] = room.split("-");
            const floor = code?.charAt(0) ?? "";
            allRooms.push({ room, residents: 0, max, area_id: dorm.area_id, floor });
          });
        });
        // Đếm số người ở từng phòng
        const roomMap: Record<string, number> = {};
        contracts.forEach((c: { room: string }) => {
          if (c.room) roomMap[c.room] = (roomMap[c.room] || 0) + 1;
        });
        // Gán số người vào từng phòng
          const stats: RoomStat[] = allRooms.map((r) => ({ ...r, residents: roomMap[r.room] || 0 }));
        setRoomStats(stats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
        }, [dorms]);

  const handleSelectRoom = (room: string) => {
    setSelectedRoom(room);
    setSelectedResident(null);
    setLoadingResidents(true);
    getResidentsByRoom(room)
      .then((data: Resident[]) => setResidents(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingResidents(false));
  };

  const floorsForSelectedArea = useMemo(() => {
    const dorm = dorms.find((d) => d.area_id === selectedArea);
    if (!dorm) return [] as string[];
    const floorSet = new Set<string>();
    dorm.rooms.forEach((room) => {
      const [, code] = room.split("-");
      const floor = code?.charAt(0) ?? "";
      if (floor) floorSet.add(floor);
    });
    return Array.from(floorSet).sort();
  }, [dorms, selectedArea]);

  const filteredRooms = useMemo(
    () =>
      roomStats.filter(
        (r) =>
          r.area_id === selectedArea && (selectedFloor === "all" || r.floor === selectedFloor),
      ),
    [roomStats, selectedArea, selectedFloor],
  );

  const getOccupancyVariant = (room: RoomStat) => {
    if (room.residents === 0) return "empty" as const;
    if (room.residents >= room.max) return "full" as const;
    return "partial" as const;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-red-700">Quản lý phòng ở</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Xem nhanh tình trạng phòng theo khu và tầng. Chọn một phòng để xem danh sách sinh
                  viên đang ở.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="w-full sm:w-44">
                  <p className="text-xs font-medium text-gray-500 mb-1">Khu ký túc xá</p>
                  <Select
                    value={selectedArea}
                    onValueChange={(value) => {
                      setSelectedArea(value);
                      setSelectedFloor("all");
                      setSelectedRoom(null);
                      setResidents([]);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Chọn khu" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaOptions.map((area) => (
                        <SelectItem key={area} value={area}>
                          KTX {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-44">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tầng</p>
                  <Select
                    value={selectedFloor}
                    onValueChange={(value) => {
                      setSelectedFloor(value);
                      setSelectedRoom(null);
                      setResidents([]);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tất cả tầng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả tầng</SelectItem>
                      {floorsForSelectedArea.map((floor) => (
                        <SelectItem key={floor} value={floor}>
                          Tầng {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 mb-4" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-gray-500 text-center py-10">Đang tải dữ liệu...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500 flex-wrap gap-2">
                  <span>
                    Hiển thị <strong>{filteredRooms.length}</strong> phòng tại khu <strong>{selectedArea}</strong>
                    {selectedFloor !== "all" && (
                      <>
                        {" "}- tầng <strong>{selectedFloor}</strong>
                      </>
                    )}
                    .
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                      Trống
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                      Còn chỗ
                    </Badge>
                    <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                      Đầy
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
                  {filteredRooms.map((room) => {
                    const occupancyVariant = getOccupancyVariant(room);
                    const isActive = room.room === selectedRoom;
                    const baseBorder =
                      occupancyVariant === "empty"
                        ? "border-green-300 bg-green-50"
                        : occupancyVariant === "full"
                        ? "border-red-300 bg-red-50"
                        : "border-amber-300 bg-amber-50";

                    return (
                      <button
                        key={room.room}
                        type="button"
                        onClick={() => handleSelectRoom(room.room)}
                        className={`relative flex flex-col items-start justify-between rounded-xl border p-3 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 ${baseBorder} ${isActive ? "ring-2 ring-red-500" : ""}`}
                        aria-label={`Xem sinh viên phòng ${room.room}`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-medium text-gray-500">KTX {room.area_id}</span>
                          <span className="text-xs text-gray-500">Tầng {room.floor}</span>
                        </div>
                        <div className="text-lg font-semibold text-red-700">{room.room}</div>
                        <div className="mt-1 text-xs text-gray-700">
                          {room.residents}/{room.max} sinh viên
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyVariant === "empty"
                                ? "bg-green-500"
                                : occupancyVariant === "full"
                                ? "bg-red-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, (room.residents / room.max) * 100)}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {selectedRoom && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full p-6 md:p-8 relative flex flex-col md:flex-row gap-6">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold"
                    onClick={() => {
                      setSelectedRoom(null);
                      setResidents([]);
                      setSelectedResident(null);
                    }}
                    aria-label="Đóng"
                    disabled={loadingResidents}
                  >
                    ×
                  </button>

                  <div className="md:w-1/2 w-full flex flex-col min-w-0">
                    <h3 className="text-xl font-bold mb-3 text-red-700">
                      Phòng {selectedRoom}
                    </h3>
                    {loadingResidents ? (
                      <div className="text-gray-500">Đang tải danh sách sinh viên...</div>
                    ) : residents.length === 0 ? (
                      <div className="text-gray-500">Không có sinh viên nào trong phòng này.</div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {residents.map((s) => (
                          <button
                            key={s.student_id}
                            type="button"
                            onClick={() => setSelectedResident(s)}
                            className={`flex w-full items-center gap-3 rounded-xl border bg-gray-50 p-3 text-left shadow-sm transition hover:bg-gray-100 ${
                              selectedResident?.student_id === s.student_id
                                ? "border-red-400 ring-1 ring-red-300"
                                : "border-gray-100"
                            }`}
                          >
                            <img
                              src={s.avatar}
                              alt={s.fullname}
                              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                            />
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">{s.fullname}</div>
                              <div className="text-gray-600 text-xs">Mã SV: {s.username}</div>
                              <div className="text-gray-500 text-xs">Lớp: {s.class}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:w-1/2 w-full border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin nội trú</h3>
                    {!selectedResident ? (
                      <p className="text-sm text-gray-500">
                        Chọn một sinh viên ở danh sách bên trái để xem thông tin nội trú chi tiết.
                      </p>
                    ) : (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Họ và tên</p>
                          <p className="text-base font-semibold text-gray-900">
                            {selectedResident.fullname}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Mã sinh viên</p>
                            <p className="text-sm text-gray-800">{selectedResident.username}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Lớp</p>
                            <p className="text-sm text-gray-800">{selectedResident.class}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Phòng</p>
                            <p className="text-sm text-gray-800">{selectedRoom}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Khu ký túc xá</p>
                            <p className="text-sm text-gray-800">
                              {selectedRoom?.split("-")[0] ?? ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Tầng</p>
                            <p className="text-sm text-gray-800">
                              {selectedRoom?.split("-")[1]?.charAt(0) ?? ""}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 text-xs text-gray-500 border-t border-dashed border-gray-200">
                          Các thông tin hợp đồng chi tiết (thời hạn, phí, ghi chú ...) có thể xem thêm
                          tại mục "Danh sách hợp đồng".
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageRooms;
