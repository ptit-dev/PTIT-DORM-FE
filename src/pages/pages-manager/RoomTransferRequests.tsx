import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  RoomTransferRequest,
  getRoomTransferRequests,
  managerConfirmRoomTransferRequest,
} from "@/features/auth/roomTransferApi";

const RoomTransferRequests: React.FC = () => {
  const user = useMemo(() => JSON.parse(localStorage.getItem("ptit_user") || "null"), []);
  const { toast } = useToast();

  const [requests, setRequests] = useState<RoomTransferRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRoomTransferRequests();
      setRequests(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Không thể tải danh sách yêu cầu";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManagerConfirm = async (
    id: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      await managerConfirmRoomTransferRequest(id, status);
      toast({
        title: status === "accepted" ? "Đã duyệt yêu cầu" : "Đã từ chối yêu cầu",
        description: "Trạng thái yêu cầu chuyển phòng đã được cập nhật.",
      });
      loadData();
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
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-red-700 mb-4 text-center">
              Yêu cầu chuyển phòng giữa sinh viên
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Quản lý duyệt các yêu cầu chuyển phòng đã được sinh viên B chấp nhận.
            </p>
            {error && <div className="text-red-600 mb-3">{error}</div>}
            {loading ? (
              <div className="text-gray-600 text-center">Đang tải danh sách...</div>
            ) : requests.length === 0 ? (
              <div className="text-gray-500 text-center">
                Chưa có yêu cầu chuyển phòng nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2">ID</th>
                      <th className="p-2">Requester</th>
                      <th className="p-2">Target</th>
                      <th className="p-2">Phòng mục tiêu</th>
                      <th className="p-2">Thời gian</th>
                      <th className="p-2">Trạng thái</th>
                      <th className="p-2 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => {
                      const canManagerConfirm =
                        r.peer_confirm_status === "accepted" &&
                        r.manager_confirm_status === "pending";

                      return (
                        <tr key={r.id} className="border-b last:border-b-0">
                          <td className="p-2 align-top max-w-[140px] truncate">{r.id}</td>
                          <td className="p-2 align-top">{r.requester_user_id}</td>
                          <td className="p-2 align-top">{r.target_user_id}</td>
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
    </div>
  );
};

export default RoomTransferRequests;
