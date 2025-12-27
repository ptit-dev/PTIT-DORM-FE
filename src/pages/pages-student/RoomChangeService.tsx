import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import dormData from "@/assets/data.json";
import { getMyRoomMembers, getResidentsByRoom } from "@/features/auth/api";
import {
  CreateRoomTransferRequestPayload,
  RoomTransferRequest,
  createRoomTransferRequest,
  getRoomTransferRequests,
  peerConfirmRoomTransferRequest,
} from "@/features/auth/roomTransferApi";

interface DormConfig {
  area_id: string;
  rooms: string[];
}

interface Resident {
  username: string; // Mã sinh viên (student code)
  fullname: string;
  class: string;
  avatar: string;
  student_id: string; // user_id nội bộ hệ thống
}

const RoomChangeService: React.FC = () => {
  const user = useMemo(() => JSON.parse(localStorage.getItem("ptit_user") || "null"), []);
  const { toast } = useToast();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentArea, setCurrentArea] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [residentsError, setResidentsError] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [requests, setRequests] = useState<RoomTransferRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  const token = useMemo(() => localStorage.getItem("ptit_access_token") || "", []);
  const dorms = useMemo(() => dormData.dorms as DormConfig[], []);

  const loadRequests = async () => {
    if (!token || !user?.user_id) return;
    setLoadingList(true);
    setError(null);
    try {
      const all = await getRoomTransferRequests();
      const mine = all.filter(
        (r) => r.requester_user_id === user.user_id || r.target_user_id === user.user_id,
      );
      setRequests(mine);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể tải danh sách yêu cầu";
      setError(msg);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMyRoom = async () => {
      setLoadingRooms(true);
      setRoomsError(null);
      try {
        const res = await getMyRoomMembers();
        const roomCode = (res as { room?: string }).room;
        if (roomCode) {
          setCurrentRoom(roomCode);
          const [areaId] = roomCode.split("-");
          setCurrentArea(areaId || null);
          const dorm = dorms.find((d) => d.area_id === areaId);
          setAvailableRooms(dorm ? dorm.rooms : []);
        } else {
          setRoomsError(
            "Bạn chưa có phòng ở nào được duyệt, không thể gửi yêu cầu chuyển phòng.",
          );
        }
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Không thể lấy thông tin phòng hiện tại của bạn.";
        setRoomsError(msg);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchMyRoom();
  }, [dorms]);

  if (!user || !user.user_id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar roles={user?.roles} />
          <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 text-center text-red-600 font-semibold">
              Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
            </div>
          </main>
        </div>
      </div>
    );
  }
  const handleSelectRoom = (roomCode: string) => {
    if (!currentArea) return;
    setSelectedRoom(roomCode);
    setSelectedResident(null);
    setResidents([]);
    setResidentsError(null);
    setStep(1);
    setLoadingResidents(true);
    getResidentsByRoom(roomCode)
      .then((data: Resident[]) => {
        setResidents(data);
      })
      .catch((e: Error) => {
        setResidentsError(e.message);
      })
      .finally(() => setLoadingResidents(false));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Thiếu token đăng nhập",
        description: "Vui lòng đăng nhập lại để thực hiện chức năng này.",
      });
      return;
    }
    if (!selectedRoom || !selectedResident || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng chọn phòng, sinh viên và nhập lý do.",
      });
      return;
    }

    const payload: CreateRoomTransferRequestPayload = {
      requester_user_id: user.user_id,
      target_user_id: selectedResident.student_id,
      target_room_id: selectedRoom,
      transfer_time: new Date().toISOString(),
      reason: reason.trim(),
    };

    setSubmitting(true);
    try {
      await createRoomTransferRequest(payload);
      toast({
        title: "Gửi yêu cầu thành công",
        description: "Yêu cầu chuyển phòng đã được gửi đến bạn cùng phòng và quản lý.",
      });
      setStep(0);
      setSelectedRoom(null);
      setSelectedResident(null);
      setReason("");
      loadRequests();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gửi yêu cầu thất bại";
      toast({ variant: "destructive", title: "Lỗi", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePeerConfirm = async (id: string, status: "accepted" | "rejected") => {
    if (!token) return;
    try {
      await peerConfirmRoomTransferRequest(id, status);
      toast({
        title: status === "accepted" ? "Đã chấp nhận" : "Đã từ chối",
        description: "Bạn đã phản hồi yêu cầu chuyển phòng.",
      });
      loadRequests();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể cập nhật trạng thái";
      toast({ variant: "destructive", title: "Lỗi", description: msg });
    }
  };

  const formatStatus = (s: string) => {
    switch (s) {
      case "accepted":
        return "Đã chấp nhận";
      case "rejected":
        return "Đã từ chối";
      default:
        return "Đang chờ";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    Yêu cầu chuyển phòng giữa hai sinh viên
                  </h2>
                  <p className="text-sm text-gray-600">
                    Bạn (Sinh viên A) có thể gửi yêu cầu đổi phòng với một sinh viên khác (Sinh viên B).
                    Sau khi bạn cùng phòng xác nhận và quản lý duyệt, phòng sẽ được hoán đổi tự động.
                  </p>
                </div>
                <div className="flex justify-center md:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRequestsModalOpen(true)}
                    className="relative inline-flex items-center gap-2"
                  >
                    <span>Danh sách yêu cầu</span>
                    <span className="inline-flex items-center justify-center rounded-full bg-red-700 text-white text-xs font-semibold w-6 h-6">
                      {requests.length}
                    </span>
                  </Button>
                </div>
              </div>
              {/* Stepper */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      step === 0 ? "bg-red-700" : "bg-gray-300"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`h-1 w-8 ${step > 0 ? "bg-red-700" : "bg-gray-300"} rounded`}
                  ></span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      step === 1 ? "bg-red-700" : "bg-gray-300"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`h-1 w-8 ${step > 1 ? "bg-red-700" : "bg-gray-300"} rounded`}
                  ></span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      step === 2 ? "bg-red-700" : "bg-gray-300"
                    }`}
                  >
                    3
                  </div>
                </div>
              </div>

              {loadingRooms ? (
                <div className="text-gray-600 text-center">
                  Đang tải thông tin phòng hiện tại của bạn...
                </div>
              ) : roomsError ? (
                <div className="text-red-600 text-center">{roomsError}</div>
              ) : !currentRoom || !currentArea ? (
                <div className="text-gray-500 text-center">
                  Bạn chưa có phòng ở nào được duyệt nên không thể gửi yêu cầu chuyển phòng.
                </div>
              ) : (
                <>
                  {step === 0 && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        Bước 1: Chọn phòng muốn chuyển đến
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Khu ký túc xá hiện tại của bạn: {" "}
                        <span className="font-semibold text-red-700">KTX {currentArea}</span>, phòng {" "}
                        <span className="font-semibold text-red-700">{currentRoom}</span>. Bạn chỉ có
                        thể chọn phòng trong cùng khu ký túc xá.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {availableRooms.map((roomCode) => {
                          const [, code] = roomCode.split("-");
                          const floor = code?.charAt(0) ?? "";
                          const isCurrent = roomCode === currentRoom;
                          const isSelected = roomCode === selectedRoom;
                          return (
                            <button
                              key={roomCode}
                              type="button"
                              onClick={() => !isCurrent && handleSelectRoom(roomCode)}
                              className={`flex flex-col items-start rounded-xl border p-3 text-left transition shadow-sm ${
                                isCurrent
                                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                                  : isSelected
                                  ? "border-red-500 bg-red-50 ring-1 ring-red-300"
                                  : "bg-white hover:bg-red-50 hover:border-red-300"
                              }`}
                            >
                              <span className="text-xs text-gray-500 mb-1">Tầng {floor}</span>
                              <span className="text-lg font-semibold text-gray-900">{roomCode}</span>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {isCurrent && (
                                  <Badge
                                    variant="outline"
                                    className="border-gray-300 text-gray-600 text-[11px]"
                                  >
                                    Phòng hiện tại
                                  </Badge>
                                )}
                                {isSelected && !isCurrent && (
                                  <Badge
                                    variant="outline"
                                    className="border-red-400 text-red-700 text-[11px]"
                                  >
                                    Đã chọn
                                  </Badge>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        Bước 2: Chọn sinh viên muốn đổi phòng cùng
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Phòng mục tiêu: {" "}
                        <span className="font-semibold text-red-700">{selectedRoom}</span>
                      </p>
                      {loadingResidents ? (
                        <div className="text-gray-600 text-center">Đang tải danh sách nội trú...</div>
                      ) : residentsError ? (
                        <div className="text-red-600 text-center">{residentsError}</div>
                      ) : (
                        <>
                          {residents.filter((s) => s.student_id !== user.user_id).length === 0 ? (
                            <div className="text-gray-500 text-center">
                              Phòng này hiện chưa có sinh viên nào phù hợp để đổi phòng cùng bạn.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {residents
                                .filter((s) => s.student_id !== user.user_id)
                                .map((s) => {
                                  const isActive = selectedResident?.student_id === s.student_id;
                                  return (
                                    <button
                                      key={s.student_id}
                                      type="button"
                                      onClick={() => setSelectedResident(s)}
                                      className={`flex items-center gap-3 rounded-xl border p-3 text-left shadow-sm transition ${
                                        isActive
                                          ? "border-red-500 bg-red-50 ring-1 ring-red-300"
                                          : "border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-300"
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
                                  );
                                })}
                            </div>
                          )}
                          <div className="flex justify-between mt-6">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => {
                                setStep(0);
                                setSelectedResident(null);
                              }}
                            >
                              Quay lại chọn phòng
                            </Button>
                            <Button
                              type="button"
                              variant="ptit"
                              disabled={!selectedResident}
                              onClick={() => setStep(2)}
                            >
                              Tiếp tục
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {step === 2 && selectedRoom && selectedResident && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        Bước 3: Nhập lý do và gửi yêu cầu
                      </h3>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-sm text-gray-800">
                        <p className="mb-1">
                          Bạn đang ở phòng <span className="font-semibold">{currentRoom}</span> và muốn đổi
                          sang phòng <span className="font-semibold">{selectedRoom}</span>.
                        </p>
                        <p>
                          Sinh viên đổi phòng cùng: {" "}
                          <span className="font-semibold">{selectedResident.fullname}</span> (Mã SV: {" "}
                          <span className="font-mono">{selectedResident.username}</span>).
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lý do muốn đổi phòng
                        </label>
                        <Textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          placeholder="Mô tả rõ lý do muốn đổi phòng (ví dụ: muốn học nhóm cùng bạn, gần lớp học hơn, ... )"
                        />
                      </div>
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          disabled={submitting}
                        >
                          Quay lại chọn sinh viên
                        </Button>
                        <Button
                          type="button"
                          variant="ptit"
                          onClick={handleSubmit}
                          disabled={submitting || !reason.trim()}
                        >
                          {submitting ? "Đang gửi..." : "Gửi yêu cầu chuyển phòng"}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {isRequestsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
              onClick={() => setIsRequestsModalOpen(false)}
              aria-label="Đóng danh sách yêu cầu"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-red-700 mb-2 text-center">
              Các yêu cầu đổi phòng liên quan đến bạn
            </h3>
            {error && <div className="text-red-600 mb-3 text-sm text-center">{error}</div>}
            {loadingList ? (
              <div className="text-gray-600 text-center">Đang tải danh sách...</div>
            ) : requests.length === 0 ? (
              <div className="text-gray-500 text-center">Chưa có yêu cầu chuyển phòng nào.</div>
            ) : (
              <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {requests.map((r) => {
                  const isRequester = r.requester_user_id === user.user_id;
                  const isTarget = r.target_user_id === user.user_id;
                  const canPeerConfirm = isTarget && r.peer_confirm_status === "pending";

                  return (
                    <div
                      key={r.id}
                      className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-50"
                    >
                      <div className="space-y-1 text-sm">
                        <div className="font-semibold text-gray-800">
                          {isRequester ? "Yêu cầu do bạn gửi" : "Yêu cầu gửi đến bạn"}
                        </div>
                        <div>
                          <span className="font-medium">Phòng mục tiêu:</span> {r.target_room_id}
                        </div>
                        <div>
                          <span className="font-medium">Thời gian chuyển:</span>{" "}
                          {new Date(r.transfer_time).toLocaleString("vi-VN")}
                        </div>
                        <div>
                          <span className="font-medium">Lý do:</span> {r.reason}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="outline">
                            Bạn cùng phòng: {formatStatus(r.peer_confirm_status)}
                          </Badge>
                          <Badge variant="outline">
                            Quản lý: {formatStatus(r.manager_confirm_status)}
                          </Badge>
                        </div>
                      </div>
                      {canPeerConfirm && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePeerConfirm(r.id, "rejected")}
                          >
                            Từ chối
                          </Button>
                          <Button
                            size="sm"
                            variant="ptit"
                            onClick={() => handlePeerConfirm(r.id, "accepted")}
                          >
                            Đồng ý
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomChangeService;
