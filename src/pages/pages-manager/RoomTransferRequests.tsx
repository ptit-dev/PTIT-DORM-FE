import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, Eye } from "lucide-react";
import {
  RoomTransferRequest,
  getRoomTransferRequests,
  managerConfirmRoomTransferRequest,
} from "@/features/auth/roomTransferApi";
import { NotificationDialog } from "@/components/ui/notification-dialog";

const RoomTransferRequests: React.FC = () => {
  const user = useMemo(() => JSON.parse(localStorage.getItem("ptit_user") || "null"), []);

  const [requests, setRequests] = useState<RoomTransferRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [dormFilter, setDormFilter] = useState<string>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
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

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRoomTransferRequests();
      setRequests(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể tải danh sách yêu cầu";
      showNotification("Lỗi", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dormOptions = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.target_room_id) {
        const building = r.target_room_id.split("-")[0];
        if (building) set.add(building);
      }
    });
    return Array.from(set).sort();
  }, [requests]);

  const roomOptions = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.target_room_id) {
        const room = r.target_room_id;
        const building = room.split("-")[0];
        if (dormFilter === "all" || building === dormFilter) {
          set.add(room);
        }
      }
    });
    return Array.from(set).sort();
  }, [requests, dormFilter]);

  const transferStats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.manager_confirm_status === "pending").length,
      accepted: requests.filter((r) => r.manager_confirm_status === "accepted").length,
      rejected: requests.filter((r) => r.manager_confirm_status === "rejected").length,
    }),
    [requests],
  );

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        const building = r.target_room_id ? r.target_room_id.split("-")[0] : "";
        const matchesDorm = dormFilter === "all" || building === dormFilter;
        const matchesRoom = roomFilter === "all" || r.target_room_id === roomFilter;
        return matchesDorm && matchesRoom;
      }),
    [requests, dormFilter, roomFilter],
  );

  const handleManagerConfirm = async (
    id: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      await managerConfirmRoomTransferRequest(id, status);
      showNotification(
        status === "accepted" ? "Đã duyệt yêu cầu" : "Đã từ chối yêu cầu",
        "Trạng thái yêu cầu chuyển phòng đã được cập nhật.",
        "success"
      );
      loadData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể cập nhật trạng thái";
      showNotification("Lỗi", msg, "error");
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

  const maskId = (id: string): string => {
    if (!id) return "";
    if (id.length <= 8) return id;
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      showNotification("Đã sao chép", `Đã copy ID: ${id}`, "success");
    } catch {
      showNotification("Lỗi", "Không thể copy ID", "error");
    }
  };

  const handleRevealId = (id: string) => {
    setRevealedId(id);
    setTimeout(() => {
      setRevealedId((current) => (current === id ? null : current));
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-2 text-center">
              Yêu cầu chuyển phòng giữa sinh viên
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Quản lý duyệt các yêu cầu chuyển phòng đã được sinh viên B chấp nhận.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 text-sm">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Tổng số yêu cầu</span>
                <span className="mt-1 text-lg font-semibold text-red-700">{transferStats.total}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Đang chờ duyệt</span>
                <span className="mt-1 text-lg font-semibold text-amber-600">{transferStats.pending}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Đã chấp nhận</span>
                <span className="mt-1 text-lg font-semibold text-emerald-600">{transferStats.accepted}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Đã từ chối</span>
                <span className="mt-1 text-lg font-semibold text-gray-700">{transferStats.rejected}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm justify-center sm:justify-start">
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
              <div className="text-gray-600 text-center">Đang tải danh sách...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-gray-500 text-center">
                Chưa có yêu cầu chuyển phòng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-left">
                      <th className="p-2">ID</th>
                      <th className="p-2">Sinh viên A</th>
                      <th className="p-2">Sinh viên B</th>
                      <th className="p-2">Phòng mục tiêu</th>
                      <th className="p-2">Thời gian</th>
                      <th className="p-2">Trạng thái</th>
                      <th className="p-2 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r) => {
                      const canManagerConfirm =
                        r.peer_confirm_status === "accepted" &&
                        r.manager_confirm_status === "pending";

                      return (
                        <tr key={r.id} className="border-b last:border-b-0">
                          <td className="p-2 align-top max-w-[200px]">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-xs text-gray-800 truncate">
                                {revealedId === r.id ? r.id : maskId(r.id)}
                              </span>
                              <button
                                type="button"
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50"
                                onClick={() => handleCopyId(r.id)}
                                title="Copy ID"
                              >
                                <Clipboard className="w-3 h-3 text-gray-600" />
                              </button>
                              <button
                                type="button"
                                className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50"
                                onClick={() => handleRevealId(r.id)}
                                title="Xem nhanh ID"
                              >
                                <Eye className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2 align-top font-mono text-sm text-gray-800">
                            {r.requester_username || r.requester_user_id}
                          </td>
                          <td className="p-2 align-top font-mono text-sm text-gray-800">
                            {r.target_username || r.target_user_id}
                          </td>
                          <td className="p-2 align-top">{r.target_room_id}</td>
                          <td className="p-2 align-top">
                            {new Date(r.transfer_time).toLocaleString("vi-VN")}
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline">
                                Bạn cùng phòng: {formatStatus(r.peer_confirm_status)}
                              </Badge>
                              <Badge variant="outline">
                                Quản lý: {formatStatus(r.manager_confirm_status)}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2 align-top text-center">
                            {canManagerConfirm ? (
                              <div className="flex flex-col gap-1 items-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleManagerConfirm(r.id, "rejected")}
                                >
                                  Từ chối
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ptit"
                                  onClick={() => handleManagerConfirm(r.id, "accepted")}
                                >
                                  Duyệt
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Không khả dụng</span>
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

export default RoomTransferRequests;