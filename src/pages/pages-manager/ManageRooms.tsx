import React, { useCallback, useEffect, useMemo, useState } from "react";
import dormData from "@/assets/data.json";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { getResidentsByRoom } from "@/features/auth/api";
import { getAllFacilityComplaints, FacilityComplaint, updateFacilityComplaintStatus } from "@/features/auth/facilityComplaintApi";
import { getElectricBills, updateElectricBill } from "@/features/auth/electricBillApi";
import { getContracts, verifyContract } from "@/features/auth/contractApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NotificationDialog } from "@/components/ui/notification-dialog";
import { Check, Zap, MessageSquareWarning, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  username: string;
  fullname: string;
  class: string;
  avatar: string;
  student_id: string;
}

interface ElectricBill {
  id: string;
  room_id: string;
  month: string;
  prev_electric: number | null;
  curr_electric: number | null;
  amount: number | null;
  payment_status: 'unpaid' | 'paid';
  is_confirmed: boolean;
}

interface Contract {
  id: string;
  room: string;
  status: string;
  status_payment: string;
  dorm_application?: {
    student_id?: string;
    full_name?: string;
  };
  created_at?: string;
  start_date?: string;
  end_date?: string;
}

interface FacilityComplaintWithType extends FacilityComplaint {
  type?: string;
}

type IssueFilterType = 'all' | 'has_issues' | 'unpaid_bills' | 'unresolved_complaints' | 'pending_contracts' | 'clean';

type DetailModalState =
  | { open: boolean; type: 'bill'; data: ElectricBill | null }
  | { open: boolean; type: 'contract'; data: Contract | null }
  | { open: boolean; type: 'complaint'; data: FacilityComplaintWithType | null };

const ManageRooms: React.FC = () => {
  const [roomStats, setRoomStats] = useState<RoomStat[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("B1");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [complaints, setComplaints] = useState<FacilityComplaint[]>([]);
  const [electricBills, setElectricBills] = useState<ElectricBill[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [issueFilter, setIssueFilter] = useState<IssueFilterType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<DetailModalState>({ open: false, type: 'bill', data: null });

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

  const dorms = useMemo(() => dormData.dorms as DormConfig[], []);
  const areaOptions = useMemo(() => dorms.map((d) => d.area_id), [dorms]);

  useEffect(() => {
    setLoading(true);
    setLoadingComplaints(true);
    
    Promise.all([
      getContracts(),
      getAllFacilityComplaints().catch(() => []),
      getElectricBills().catch(() => [])
    ])
      .then(([contractsRes, complaintsData, billsData]) => {
        const contractsList = Array.isArray(contractsRes) ? contractsRes : (contractsRes?.data || []);
        const allRooms: RoomStat[] = [];
        dorms.forEach((dorm) => {
          const max = dorm.area_id === "B2" || dorm.area_id === "B5" ? 8 : 4;
          dorm.rooms.forEach((room) => {
            const [, code] = room.split("-");
            const floor = code?.charAt(0) ?? "";
            allRooms.push({ room, residents: 0, max, area_id: dorm.area_id, floor });
          });
        });
        const roomMap: Record<string, number> = {};
        contractsList.filter((c: Contract) => c.status === 'approved').forEach((c: Contract) => {
          if (c.room) roomMap[c.room] = (roomMap[c.room] || 0) + 1;
        });
        const stats: RoomStat[] = allRooms.map((r) => ({ ...r, residents: roomMap[r.room] || 0 }));
        setRoomStats(stats);
        setComplaints(complaintsData || []);
        setElectricBills(billsData || []);
        setContracts(contractsList || []);
      })
      .catch((e) => {
        if (e instanceof Error) {
          showNotification("Lỗi tải dữ liệu", e.message, "error");
        } else {
          showNotification("Lỗi", "Đã xảy ra lỗi không xác định", "error");
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingComplaints(false);
      });
  }, [dorms]);

  const handleSelectRoom = (room: string) => {
    setSelectedRoom(room);
    setSelectedResident(null);
    setLoadingResidents(true);
    getResidentsByRoom(room)
      .then((data: Resident[]) => setResidents(data))
      .catch((e: Error) => {
        showNotification("Lỗi tải danh sách sinh viên", e.message, "error");
      })
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

  const getRoomIssues = useCallback((roomId: string) => {
    const unresolvedComplaintsCount = complaints.filter(c => 
        c.room_id === roomId && 
        c.status.toLowerCase() !== 'resolved' && 
        c.status.toLowerCase() !== 'rejected'
    ).length;
    
    const unpaidBillsCount = electricBills.filter(b => 
        b.room_id === roomId && 
        b.payment_status === 'unpaid'
    ).length;
    
    const pendingContractsCount = contracts.filter(c => 
        c.room === roomId && 
        c.status !== 'approved' && 
        c.status !== 'canceled'
    ).length;
    
    return {
        totalIssues: unresolvedComplaintsCount + unpaidBillsCount + pendingContractsCount,
        unresolvedComplaints: unresolvedComplaintsCount,
        unpaidBills: unpaidBillsCount,
        pendingContracts: pendingContractsCount
    };
  }, [complaints, electricBills, contracts]);

  const roomsByAreaFloor = useMemo(
    () =>
      roomStats.filter(
        (r) =>
          r.area_id === selectedArea && (selectedFloor === "all" || r.floor === selectedFloor),
      ),
    [roomStats, selectedArea, selectedFloor],
  );

  const issueStats = useMemo(() => {
    let unpaidCount = 0;
    let complaintCount = 0;
    let pendingContractCount = 0;
    let cleanCount = 0;
    let totalIssuesCount = 0;

    roomsByAreaFloor.forEach(r => {
      const issues = getRoomIssues(r.room);
      if (issues.unpaidBills > 0) unpaidCount++;
      if (issues.unresolvedComplaints > 0) complaintCount++;
      if (issues.pendingContracts > 0) pendingContractCount++;
      if (issues.totalIssues === 0) cleanCount++;
      totalIssuesCount += issues.totalIssues;
    });

    return { unpaidCount, complaintCount, pendingContractCount, cleanCount, totalIssuesCount };
  }, [roomsByAreaFloor, complaints, electricBills, contracts]);

  const finalFilteredRooms = useMemo(() => {
    return roomsByAreaFloor.filter(r => {
        const issues = getRoomIssues(r.room);
        if (issueFilter === 'all') return true;
        if (issueFilter === 'clean') return issues.totalIssues === 0;
        if (issueFilter === 'has_issues') return issues.totalIssues > 0;
        if (issueFilter === 'unpaid_bills') return issues.unpaidBills > 0;
        if (issueFilter === 'unresolved_complaints') return issues.unresolvedComplaints > 0;
        if (issueFilter === 'pending_contracts') return issues.pendingContracts > 0;
        return true;
    });
  }, [roomsByAreaFloor, issueFilter, complaints, electricBills, contracts]);

  const getOccupancyVariant = (room: RoomStat) => {
    if (room.residents === 0) return "empty" as const;
    if (room.residents >= room.max) return "full" as const;
    return "partial" as const;
  };

  const getRoomComplaints = (roomId: string): FacilityComplaint[] => {
    return complaints.filter(c => c.room_id === roomId);
  };

  const getRoomElectricBills = (roomId: string): ElectricBill[] => {
    return electricBills.filter(b => b.room_id === roomId).sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  };

  const getRoomContracts = (roomId: string): Contract[] => {
    return contracts.filter(c => c.room === roomId).sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  };

  const handleUpdateComplaintStatus = async (complaintId: string, status: string) => {
    setActionLoading(complaintId);
    try {
      await updateFacilityComplaintStatus(complaintId, status);
      const data = await getAllFacilityComplaints();
      setComplaints(data || []);
      showNotification("Thành công", "Cập nhật trạng thái khiếu nại thành công", "success");
    } catch (e) {
      showNotification("Lỗi", e instanceof Error ? e.message : "Không thể cập nhật", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateBillPayment = async (billId: string, paymentStatus: 'paid' | 'unpaid') => {
    setActionLoading(billId);
    try {
      await updateElectricBill(billId, { payment_status: paymentStatus });
      const data = await getElectricBills();
      setElectricBills(data || []);
      showNotification("Thành công", "Cập nhật trạng thái thanh toán thành công", "success");
    } catch (e) {
      showNotification("Lỗi", e instanceof Error ? e.message : "Không thể cập nhật", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateContractStatus = async (contractId: string, status: string, note?: string) => {
    setActionLoading(contractId);
    try {
      await verifyContract(contractId, { status, note: note || '' });
      const data = await getContracts();
      const contractsList = Array.isArray(data) ? data : (data?.data || []);
      setContracts(contractsList);
      showNotification("Thành công", "Cập nhật trạng thái hợp đồng thành công", "success");
    } catch (e) {
      showNotification("Lỗi", e instanceof Error ? e.message : "Không thể cập nhật", "error");
    } finally {
      setActionLoading(null);
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
              <div>
                <h2 className="text-2xl font-bold text-red-700">Quản lý phòng ở</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý tình trạng phòng, sinh viên, hóa đơn và sự cố.
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
                      setIssueFilter('all');
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

            {loading ? (
              <div className="text-gray-500 text-center py-10">Đang tải dữ liệu...</div>
            ) : (
              <>
                <div className="mb-6 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Trạng thái cần chú ý ({selectedArea})</p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setIssueFilter(issueFilter === 'unpaid_bills' ? 'all' : 'unpaid_bills')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                                issueFilter === 'unpaid_bills' 
                                ? 'bg-yellow-100 border-yellow-400 text-yellow-800 ring-1 ring-yellow-400 font-semibold' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <span>Chưa đóng tiền điện</span>
                            {issueStats.unpaidCount > 0 && (
                                <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                    {issueStats.unpaidCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setIssueFilter(issueFilter === 'unresolved_complaints' ? 'all' : 'unresolved_complaints')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                                issueFilter === 'unresolved_complaints' 
                                ? 'bg-orange-100 border-orange-400 text-orange-800 ring-1 ring-orange-400 font-semibold' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <MessageSquareWarning className="w-4 h-4 text-orange-600" />
                            <span>Sự cố cần xử lý</span>
                            {issueStats.complaintCount > 0 && (
                                <span className="bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                    {issueStats.complaintCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setIssueFilter(issueFilter === 'pending_contracts' ? 'all' : 'pending_contracts')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                                issueFilter === 'pending_contracts' 
                                ? 'bg-blue-100 border-blue-400 text-blue-800 ring-1 ring-blue-400 font-semibold' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Hợp đồng chờ duyệt</span>
                            {issueStats.pendingContractCount > 0 && (
                                <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                    {issueStats.pendingContractCount}
                                </span>
                            )}
                        </button>
                        
                        <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>

                        <button 
                             onClick={() => setIssueFilter('all')}
                             className={`px-3 py-2 rounded-lg text-sm transition-colors ${issueFilter === 'all' ? 'text-gray-900 font-semibold bg-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Tất cả ({roomsByAreaFloor.length})
                        </button>
                        
                        <button 
                             onClick={() => setIssueFilter('clean')}
                             className={`px-3 py-2 rounded-lg text-sm transition-colors ${issueFilter === 'clean' ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-500 hover:text-green-700'}`}
                        >
                            Ổn định ({issueStats.cleanCount})
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-xs text-gray-500 flex-wrap gap-2 border-t pt-4">
                  <span>
                    Hiển thị <strong>{finalFilteredRooms.length}</strong> phòng
                    {issueFilter !== 'all' && (
                        <span className="ml-1 text-red-600 font-medium">
                            (Đang lọc: {
                                issueFilter === 'unpaid_bills' ? 'Chưa đóng tiền điện' :
                                issueFilter === 'unresolved_complaints' ? 'Sự cố cần xử lý' :
                                issueFilter === 'pending_contracts' ? 'Hợp đồng chờ duyệt' :
                                issueFilter === 'clean' ? 'Ổn định' : 
                                issueFilter === 'has_issues' ? 'Có vấn đề' : ''
                            })
                        </span>
                    )}
                  </span>
                  <div className="flex gap-2 flex-wrap opacity-60 hover:opacity-100 transition-opacity">
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">Trống</Badge>
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Còn chỗ</Badge>
                    <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">Đầy</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
                  {finalFilteredRooms.map((room) => {
                    const occupancyVariant = getOccupancyVariant(room);
                    const isActive = room.room === selectedRoom;
                    const issues = getRoomIssues(room.room);
                    const hasIssues = issues.totalIssues > 0;

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
                        className={`relative flex flex-col items-start justify-between rounded-xl border p-3 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 ${baseBorder} ${isActive ? "ring-2 ring-red-500 scale-[1.02]" : ""}`}
                      >
                        <div className="absolute -top-2 -right-2 z-10">
                            {hasIssues ? (
                                <div className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-md border-2 border-white animate-in zoom-in duration-200">
                                    {issues.totalIssues}
                                </div>
                            ) : (
                                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white">
                                    <Check className="w-3.5 h-3.5" strokeWidth={4} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-medium text-gray-500">KTX {room.area_id}</span>
                          <span className="text-xs text-gray-500">Tầng {room.floor}</span>
                        </div>
                        <div className="text-lg font-semibold text-red-700 w-full flex justify-between items-center">
                            {room.room}
                            {hasIssues && (
                                <div className="flex gap-1">
                                    {issues.unpaidBills > 0 && <Zap className="w-3 h-3 text-yellow-600" fill="currentColor" />}
                                    {issues.unresolvedComplaints > 0 && <MessageSquareWarning className="w-3 h-3 text-orange-600" />}
                                </div>
                            )}
                        </div>
                        
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
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-red-700 flex items-center gap-3">
                      Phòng {selectedRoom}
                      {(() => {
                          const issues = getRoomIssues(selectedRoom);
                          if (issues.totalIssues > 0) {
                              return <span className="text-sm font-normal bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">
                                Đang có {issues.totalIssues} vấn đề cần xử lý
                              </span>
                          }
                          return <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                             <Check className="w-4 h-4"/> Trạng thái ổn định
                          </span>
                      })()}
                    </h3>
                    <button
                      className="text-gray-400 hover:text-red-600 text-2xl font-bold"
                      onClick={() => {
                        setSelectedRoom(null);
                        setResidents([]);
                        setSelectedResident(null);
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-3 text-gray-900">Danh sách sinh viên</h4>
                                {loadingResidents ? (
                                <div className="text-gray-500">Đang tải danh sách sinh viên...</div>
                                ) : residents.length === 0 ? (
                                <div className="text-gray-500">Không có sinh viên nào trong phòng này.</div>
                                ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
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
                                        </div>
                                    </button>
                                    ))}
                                </div>
                                )}
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-3 text-gray-900">Thông tin chi tiết</h4>
                                {!selectedResident ? (
                                <div className="p-4 border border-dashed rounded-lg text-center text-gray-500 text-sm">
                                    Chọn một sinh viên để xem thông tin
                                </div>
                                ) : (
                                <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm border">
                                    <div>
                                    <p className="text-xs font-medium text-gray-500">Họ và tên</p>
                                    <p className="text-base font-semibold text-gray-900">{selectedResident.fullname}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Mã sinh viên</p>
                                        <p className="text-sm text-gray-800">{selectedResident.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Lớp</p>
                                        <p className="text-sm text-gray-800">{selectedResident.class}</p>
                                    </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-3 text-gray-900 flex items-center justify-between">
                                    Hóa đơn tiền điện
                                    {getRoomIssues(selectedRoom).unpaidBills > 0 && (
                                        <Badge variant="destructive" className="animate-pulse">
                                            {getRoomIssues(selectedRoom).unpaidBills} hóa đơn chưa thanh toán
                                        </Badge>
                                    )}
                                </h4>
                                {(() => {
                                    const roomBills = getRoomElectricBills(selectedRoom);
                                    return roomBills.length === 0 ? (
                                    <p className="text-sm text-gray-500">Chưa có hóa đơn.</p>
                                    ) : (
                                    <div className="overflow-x-auto border rounded-lg max-h-60">
                                        <table className="min-w-full text-xs">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                            <th className="p-2 text-left">Tháng</th>
                                            <th className="p-2 text-left">Tiêu thụ</th>
                                            <th className="p-2 text-left">Số tiền</th>
                                            <th className="p-2 text-left">TT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {roomBills.map((bill) => (
                                            <tr 
                                                key={bill.id} 
                                                className={`border-b cursor-pointer hover:bg-gray-100 transition ${bill.payment_status === 'unpaid' ? 'bg-yellow-50' : ''}`}
                                                onClick={() => setDetailModal({ open: true, type: 'bill', data: bill })}
                                            >
                                                <td className="p-2">{bill.month}</td>
                                                <td className="p-2">{(bill.curr_electric || 0) - (bill.prev_electric || 0)}</td>
                                                <td className="p-2 font-bold text-gray-700">{bill.amount?.toLocaleString()}đ</td>
                                                <td className="p-2">
                                                {bill.payment_status === 'paid' ? (
                                                    <span className="text-green-600 font-bold text-[10px] border border-green-200 bg-green-100 px-2 py-0.5 rounded-full">Đã TT</span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 text-[10px] px-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                                        onClick={(e) => { e.stopPropagation(); handleUpdateBillPayment(bill.id, 'paid'); }}
                                                        disabled={actionLoading === bill.id}
                                                    >
                                                        {actionLoading === bill.id ? 'Đang...' : 'Đánh dấu đã TT'}
                                                    </Button>
                                                )}
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    </div>
                                    );
                                })()}
                            </div>

                             <div>
                                <h4 className="text-lg font-semibold mb-3 text-gray-900 flex items-center justify-between">
                                    Khiếu nại CSVC
                                    {getRoomIssues(selectedRoom).unresolvedComplaints > 0 && (
                                        <Badge variant="destructive" className="bg-orange-500">
                                            {getRoomIssues(selectedRoom).unresolvedComplaints} cần xử lý
                                        </Badge>
                                    )}
                                </h4>
                                {(() => {
                                    const roomComplaints = getRoomComplaints(selectedRoom);
                                    return roomComplaints.length === 0 ? (
                                    <p className="text-sm text-gray-500">Không có khiếu nại nào.</p>
                                    ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {roomComplaints.map((c) => {
                                          const isIssue = c.status.toLowerCase() !== 'resolved' && c.status.toLowerCase() !== 'rejected';
                                          return (
                                            <div 
                                                key={c.id} 
                                                className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition ${isIssue ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}
                                                onClick={() => setDetailModal({ open: true, type: 'complaint', data: c })}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{c.title}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                                                        c.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                        c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        c.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {c.status === 'pending' ? 'Chờ xử lý' : 
                                                         c.status === 'in_progress' ? 'Đang xử lý' :
                                                         c.status === 'resolved' ? 'Đã xong' : 'Từ chối'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1 line-clamp-2">{c.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[10px] text-gray-400">
                                                        {new Date(c.created_at).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    {isIssue && (
                                                        <div className="flex gap-1">
                                                            {c.status === 'pending' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 text-[10px] px-2 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                                                                    onClick={() => handleUpdateComplaintStatus(c.id, 'in_progress')}
                                                                    disabled={actionLoading === c.id}
                                                                >
                                                                    {actionLoading === c.id ? '...' : 'Đang xử lý'}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 text-[10px] px-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                                                onClick={() => handleUpdateComplaintStatus(c.id, 'resolved')}
                                                                disabled={actionLoading === c.id}
                                                            >
                                                                {actionLoading === c.id ? '...' : 'Xong'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                          )
                                        })}
                                    </div>
                                    );
                                })()}
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-3 text-gray-900 flex items-center justify-between">
                                    Hợp đồng ở phòng
                                    {getRoomIssues(selectedRoom).pendingContracts > 0 && (
                                        <Badge variant="destructive" className="bg-blue-500">
                                            {getRoomIssues(selectedRoom).pendingContracts} chờ duyệt
                                        </Badge>
                                    )}
                                </h4>
                                {(() => {
                                    const roomContracts = getRoomContracts(selectedRoom);
                                    return roomContracts.length === 0 ? (
                                    <p className="text-sm text-gray-500">Chưa có hợp đồng nào.</p>
                                    ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {roomContracts.map((contract) => {
                                          const isPending = contract.status !== 'approved' && contract.status !== 'canceled';
                                          return (
                                            <div 
                                                key={contract.id} 
                                                className={`border rounded-lg p-3 cursor-pointer hover:shadow-md transition ${isPending ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                                                onClick={() => setDetailModal({ open: true, type: 'contract', data: contract })}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-sm">
                                                            {contract.dorm_application?.full_name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            MSV: {contract.dorm_application?.student_id || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${
                                                        contract.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        contract.status === 'temporary' ? 'bg-yellow-100 text-yellow-700' :
                                                        contract.status === 'canceled' ? 'bg-gray-100 text-gray-700' : 
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {contract.status === 'approved' ? 'Đã duyệt' :
                                                         contract.status === 'temporary' ? 'Chờ duyệt' :
                                                         contract.status === 'canceled' ? 'Đã hủy' : contract.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                                    <div>Thanh toán: {contract.status_payment === 'paid' ? '✓ Đã TT' : '✗ Chưa TT'}</div>
                                                    <div className="text-right">{new Date(contract.created_at || '').toLocaleDateString('vi-VN')}</div>
                                                </div>
                                                {isPending && (
                                                    <div className="flex gap-1 mt-2 pt-2 border-t border-blue-200">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs flex-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                                                            onClick={() => handleUpdateContractStatus(contract.id, 'approved')}
                                                            disabled={actionLoading === contract.id}
                                                        >
                                                            {actionLoading === contract.id ? 'Đang xử lý...' : 'Duyệt'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                                                            onClick={() => handleUpdateContractStatus(contract.id, 'canceled', 'Từ chối bởi quản lý')}
                                                            disabled={actionLoading === contract.id}
                                                        >
                                                            {actionLoading === contract.id ? 'Đang xử lý...' : 'Từ chối'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                          )
                                        })}
                                    </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* DETAIL MODALS */}
      {detailModal.open && detailModal.type === 'bill' && detailModal.data && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-yellow-600 to-yellow-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Chi tiết hóa đơn điện</h3>
                <button className="text-3xl text-white hover:text-gray-200" onClick={() => setDetailModal({ ...detailModal, open: false })}>×</button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Phòng</p>
                  <p className="text-xl font-bold text-red-700">{detailModal.data.room_id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Tháng</p>
                  <p className="text-xl font-bold text-gray-900">{detailModal.data.month}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Thông tin điện năng</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Chỉ số cũ</span>
                    <span className="font-bold text-gray-900">{detailModal.data.prev_electric || 0} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Chỉ số mới</span>
                    <span className="font-bold text-gray-900">{detailModal.data.curr_electric || 0} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b bg-blue-50 px-3 rounded">
                    <span className="text-blue-700 font-semibold">Tiêu thụ</span>
                    <span className="font-bold text-blue-900">{((detailModal.data.curr_electric || 0) - (detailModal.data.prev_electric || 0))} kWh</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded mt-2">
                    <span className="text-green-700 font-semibold text-lg">Tổng tiền</span>
                    <span className="font-bold text-green-900 text-2xl">{detailModal.data.amount?.toLocaleString() || 0}đ</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Trạng thái</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-bold ${detailModal.data.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {detailModal.data.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                  {detailModal.data.is_confirmed && (
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold">Đã xác nhận</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {detailModal.data.payment_status === 'unpaid' && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => { e.stopPropagation(); handleUpdateBillPayment(detailModal.data.id, 'paid'); setDetailModal({ ...detailModal, open: false }); }}
                  disabled={actionLoading === detailModal.data.id}
                >
                  {actionLoading === detailModal.data.id ? 'Đang xử lý...' : 'Đánh dấu đã thanh toán'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailModal({ ...detailModal, open: false })}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {detailModal.open && detailModal.type === 'contract' && detailModal.data && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Chi tiết hợp đồng</h3>
                <button className="text-3xl text-white hover:text-gray-200" onClick={() => setDetailModal({ ...detailModal, open: false })}>×</button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500 font-medium">Sinh viên</p>
                  <p className="text-xl font-bold text-gray-900">{detailModal.data.dorm_application?.full_name || 'N/A'}</p>
                  <p className="text-sm text-gray-600 mt-1">MSV: {detailModal.data.dorm_application?.student_id || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Phòng</p>
                  <p className="text-xl font-bold text-red-700">{detailModal.data.room}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">Ngày tạo</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(detailModal.data.created_at || '').toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Trạng thái hợp đồng</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    detailModal.data.status === 'approved' ? 'bg-green-100 text-green-700' :
                    detailModal.data.status === 'temporary' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {detailModal.data.status === 'approved' ? 'Đã duyệt' :
                     detailModal.data.status === 'temporary' ? 'Chờ duyệt' :
                     detailModal.data.status === 'canceled' ? 'Đã hủy' : detailModal.data.status}
                  </span>
                  <span className={`px-4 py-2 rounded-full font-bold ${
                    detailModal.data.status_payment === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {detailModal.data.status_payment === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>

              {(detailModal.data.start_date || detailModal.data.end_date) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Thời hạn hợp đồng</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {detailModal.data.start_date && (
                      <div>
                        <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                        <p className="font-semibold">{new Date(detailModal.data.start_date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    )}
                    {detailModal.data.end_date && (
                      <div>
                        <p className="text-xs text-gray-500">Ngày kết thúc</p>
                        <p className="font-semibold">{new Date(detailModal.data.end_date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {detailModal.data.status !== 'approved' && detailModal.data.status !== 'canceled' && (
                <>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => { e.stopPropagation(); handleUpdateContractStatus(detailModal.data.id, 'approved'); setDetailModal({ ...detailModal, open: false }); }}
                    disabled={actionLoading === detailModal.data.id}
                  >
                    {actionLoading === detailModal.data.id ? 'Đang xử lý...' : 'Duyệt hợp đồng'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={(e) => { e.stopPropagation(); handleUpdateContractStatus(detailModal.data.id, 'canceled', 'Từ chối bởi quản lý'); setDetailModal({ ...detailModal, open: false }); }}
                    disabled={actionLoading === detailModal.data.id}
                  >
                    {actionLoading === detailModal.data.id ? 'Đang xử lý...' : 'Từ chối'}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailModal({ ...detailModal, open: false })}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

      {detailModal.open && detailModal.type === 'complaint' && detailModal.data && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-orange-600 to-orange-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Chi tiết khiếu nại</h3>
                <button className="text-3xl text-white hover:text-gray-200" onClick={() => setDetailModal({ ...detailModal, open: false })}>×</button>
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 font-medium">Tiêu đề</p>
                <p className="text-xl font-bold text-gray-900">{detailModal.data.title}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Mô tả chi tiết</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{detailModal.data.description}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Thông tin khác</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Loại khiếu nại</p>
                    <p className="font-semibold">{detailModal.data.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phòng</p>
                    <p className="font-semibold text-red-700">{detailModal.data.room_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ngày tạo</p>
                    <p className="font-semibold">{new Date(detailModal.data.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      detailModal.data.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      detailModal.data.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      detailModal.data.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {detailModal.data.status === 'pending' ? 'Chờ xử lý' : 
                       detailModal.data.status === 'in_progress' ? 'Đang xử lý' :
                       detailModal.data.status === 'resolved' ? 'Đã xong' : 'Từ chối'}
                    </span>
                  </div>
                </div>
              </div>

              {detailModal.data.proof && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Hình ảnh minh chứng</h4>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={detailModal.data.proof} 
                      alt="Minh chứng" 
                      className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90"
                      onClick={() => window.open(detailModal.data.proof, '_blank')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Click để xem ảnh đầy đủ</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {detailModal.data.status !== 'resolved' && detailModal.data.status !== 'rejected' && (
                <>
                  {detailModal.data.status === 'pending' && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => { e.stopPropagation(); handleUpdateComplaintStatus(detailModal.data.id, 'in_progress'); setDetailModal({ ...detailModal, open: false }); }}
                      disabled={actionLoading === detailModal.data.id}
                    >
                      {actionLoading === detailModal.data.id ? 'Đang xử lý...' : 'Đánh dấu đang xử lý'}
                    </Button>
                  )}
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => { e.stopPropagation(); handleUpdateComplaintStatus(detailModal.data.id, 'resolved'); setDetailModal({ ...detailModal, open: false }); }}
                    disabled={actionLoading === detailModal.data.id}
                  >
                    {actionLoading === detailModal.data.id ? 'Đang xử lý...' : 'Đánh dấu đã giải quyết'}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailModal({ ...detailModal, open: false })}>Đóng</Button>
            </div>
          </div>
        </div>
      )}

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

export default ManageRooms;