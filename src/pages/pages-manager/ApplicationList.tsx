import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDormApplications, approveDormApplication } from "@/features/auth/api";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import { useNavigate } from "react-router-dom";

// Định nghĩa kiểu dữ liệu cho nguyện vọng
interface DormApplication {
  id: string;
  student_id: string;
  full_name: string;
  dob: string;
  gender: string;
  cccd: string;
  cccd_issue_date: string;
  cccd_issue_place: string;
  phone: string;
  email: string;
  avatar_front: string;
  avatar_back: string;
  class: string;
  course: string;
  faculty: string;
  ethnicity: string;
  religion: string;
  hometown: string;
  guardian_name: string;
  guardian_phone: string;
  priority_proof: string;
  preferred_site: string;
  preferred_dorm: string;
  priority_group: string;
  admission_type: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const DORM_ROOMS: Record<string, string[]> = {
  "Hà Đông": ["B1-101", "B1-102", "B2-201", "B5-301"],
  "Ngọc Trục": ["B0-101", "B0-102"],
  "Minh Khai": ["MK-101", "MK-102"],
};



const ApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<DormApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DormApplication | null>(null);
  const [approveRoom, setApproveRoom] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");

  // Check user and role
  useEffect(() => {
    // Chỉ kiểm tra quyền và fetch data 1 lần khi mount
    if (!user || !user.roles || (!user.roles.includes("admin_system") && !user.roles.includes("manager"))) {
      navigate("/", { replace: true });
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getDormApplications();
        setApplications(data);
      } catch (e) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không thể tải danh sách nguyện vọng." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async () => {
    if (!selected) return;
    setApproveLoading(true);
    try {
      await approveDormApplication(selected.id, approveRoom, "approved");
      toast({ title: "Duyệt thành công" });
      setSelected(null);
      setApplications(applications => applications.map(a => a.id === selected.id ? { ...a, status: "approved" } : a));
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể duyệt nguyện vọng." });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setApproveLoading(true);
    try {
      await approveDormApplication(selected.id, "", "rejected");
      toast({ title: "Đã hủy nguyện vọng" });
      setSelected(null);
      setApplications(applications => applications.map(a => a.id === selected.id ? { ...a, status: "rejected" } : a));
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể hủy nguyện vọng." });
    } finally {
      setApproveLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-red-700 text-center">Danh sách đơn nguyện vọng ký túc xá</h1>
            {loading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin w-8 h-8 text-red-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-red-700 text-white text-sm">
                      <th className="px-4 py-2 border-b">Mã SV</th>
                      <th className="px-4 py-2 border-b">Họ tên</th>
                      <th className="px-4 py-2 border-b">Giới tính</th>
                      <th className="px-4 py-2 border-b">Khóa</th>
                      <th className="px-4 py-2 border-b">Nguyện vọng</th>
                      <th className="px-4 py-2 border-b">Ngày tạo</th>
                      <th className="px-4 py-2 border-b">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-red-50 cursor-pointer transition" onClick={() => { setSelected(app); setApproveRoom(""); }}>
                        <td className="px-4 py-2 border-b text-center">{app.student_id}</td>
                        <td className="px-4 py-2 border-b">{app.full_name}</td>
                        <td className="px-4 py-2 border-b text-center">{app.gender === "male" ? "Nam" : app.gender === "female" ? "Nữ" : app.gender}</td>
                        <td className="px-4 py-2 border-b text-center">{app.course}</td>
                        <td className="px-4 py-2 border-b text-center">{app.preferred_site} - {app.preferred_dorm}</td>
                        <td className="px-4 py-2 border-b text-center">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-2 border-b text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${app.status === "pending" ? "bg-yellow-100 text-yellow-800" : app.status === "approved" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>{app.status === "pending" ? "Chờ duyệt" : app.status === "approved" ? "Đã duyệt" : app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Modal xem chi tiết và duyệt */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
              <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-red-700">Thông tin chi tiết đơn nguyện vọng</DialogTitle>
                </DialogHeader>
                {selected && (
                  <form className="space-y-6">
                    {/* Ảnh giấy tờ */}
                    <div className="flex flex-wrap gap-8 items-center justify-center mb-2">
                      {selected.avatar_front && (
                        <div className="flex flex-col items-center">
                          <img src={selected.avatar_front} alt="CCCD mặt trước" className="w-40 h-56 rounded border object-cover shadow" />
                          <span className="mt-2 text-xs text-gray-600">CCCD mặt trước</span>
                        </div>
                      )}
                      {selected.avatar_back && (
                        <div className="flex flex-col items-center">
                          <img src={selected.avatar_back} alt="CCCD mặt sau" className="w-40 h-56 rounded border object-cover shadow" />
                          <span className="mt-2 text-xs text-gray-600">CCCD mặt sau</span>
                        </div>
                      )}
                      {selected.priority_proof && (
                        <div className="flex flex-col items-center">
                          <img src={selected.priority_proof} alt="Minh chứng ưu tiên" className="w-40 h-56 rounded border object-cover shadow" />
                          <span className="mt-2 text-xs text-gray-600">Minh chứng ưu tiên</span>
                        </div>
                      )}
                    </div>
                    {/* Thông tin cá nhân: 3 trường 1 hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Mã sinh viên</label>
                        <Input value={selected.student_id} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Họ tên</label>
                        <Input value={selected.full_name} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Ngày sinh</label>
                        <Input value={new Date(selected.dob).toLocaleDateString()} readOnly disabled />
                      </div>
                    </div>
                    {/* Giới tính, CCCD, Ngày cấp: 3 trường 1 hàng */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Giới tính</label>
                        <Input value={selected.gender === "male" ? "Nam" : selected.gender === "female" ? "Nữ" : selected.gender} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">CCCD</label>
                        <Input value={selected.cccd} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Ngày cấp</label>
                        <Input value={selected.cccd_issue_date ? new Date(selected.cccd_issue_date).toLocaleDateString() : ""} readOnly disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold">Nơi cấp</label>
                      <Input value={selected.cccd_issue_place} readOnly disabled />
                    </div>
                    {/* Thông tin liên hệ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Số điện thoại</label>
                        <Input value={selected.phone} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Email</label>
                        <Input value={selected.email} readOnly disabled />
                      </div>
                    </div>
                    {/* Thông tin học tập */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Lớp</label>
                        <Input value={selected.class} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Khóa</label>
                        <Input value={selected.course} readOnly disabled />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Hệ đào tạo</label>
                        <Input value={selected.admission_type} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Ngành học</label>
                        <Input value={selected.faculty} readOnly disabled />
                      </div>
                    </div>
                    {/* Thông tin cá nhân bổ sung */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Dân tộc</label>
                        <Input value={selected.ethnicity} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Tôn giáo</label>
                        <Input value={selected.religion} readOnly disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold">Quê quán</label>
                      <Input value={selected.hometown} readOnly disabled />
                    </div>
                    {/* Thông tin người bảo lãnh */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Người bảo lãnh</label>
                        <Input value={selected.guardian_name} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">SĐT người bảo lãnh</label>
                        <Input value={selected.guardian_phone} readOnly disabled />
                      </div>
                    </div>
                    {/* Thông tin ưu tiên và nguyện vọng */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-semibold">Đối tượng ưu tiên</label>
                        <Input value={selected.priority_group} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                        <label className="font-semibold">Nguyện vọng</label>
                        <Input value={`${selected.preferred_site} - ${selected.preferred_dorm}`} readOnly disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold">Ghi chú</label>
                      <Textarea value={selected.notes} readOnly disabled rows={2} />
                    </div>
                    {/* Trạng thái và nút thao tác */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-end mt-6">
                      {selected.status === "pending" && (
                        <>
                          <div className="flex-1 md:flex-none">
                            <label className="font-semibold mr-2">Chọn phòng duyệt:</label>
                            <Select value={approveRoom} onValueChange={setApproveRoom}>
                              <SelectTrigger className="w-40"><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                              <SelectContent>
                                {(DORM_ROOMS[selected.preferred_site] || []).map(room => (
                                  <SelectItem key={room} value={room}>{room}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="destructive" onClick={handleApprove} disabled={!approveRoom || approveLoading} className="min-w-[120px]">
                            {approveLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}Duyệt
                          </Button>
                          <Button variant="outline" onClick={handleReject} disabled={approveLoading} className="min-w-[120px]">Hủy</Button>
                        </>
                      )}
                      {selected.status !== "pending" && (
                        <div className="text-green-700 font-semibold">Đã xử lý</div>
                      )}
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationList;
