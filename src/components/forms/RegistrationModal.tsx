import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendOtp, verifyOtp, submitDormApplication } from "@/features/auth/api";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialState = {
  studentId: "",
  fullName: "",
  dob: "",
  gender: "",
  cccd: "",
  cccdIssueDate: "",
  cccdIssuePlace: "",
  phone: "",
  email: "",
  avatarFront: null as File | null,
  avatarBack: null as File | null,
  className: "",
  course: "",
  faculty: "",
  ethnicity: "",
  religion: "",
  hometown: "",
  guardianName: "",
  guardianPhone: "",
  priorityProof: null as File | null,
  preferredSite: "",
  preferredDorm: "",
  priorityGroup: "",
  admissionType: "",
  notes: "",
};


const steps = [
  "Nhập thông tin",
  "Nhập OTP",
  "Kết quả"
];

const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState(0); // 0: form, 1: otp, 2: result
  const [successMsg, setSuccessMsg] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [timer, setTimer] = useState(180);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpTries, setOtpTries] = useState(0);
  const { toast } = useToast();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.studentId) newErrors.studentId = "Mã sinh viên bắt buộc";
    if (!formData.fullName) newErrors.fullName = "Họ tên bắt buộc";
    if (!formData.dob) newErrors.dob = "Ngày sinh bắt buộc";
    if (!formData.gender) newErrors.gender = "Giới tính bắt buộc";
  if (!formData.cccd) newErrors.cccd = "CCCD bắt buộc";
  else if (!/^\d{12}$/.test(formData.cccd)) newErrors.cccd = "CCCD phải là 12 số";
    if (!formData.phone || !/^\d{9,11}$/.test(formData.phone)) 
      newErrors.phone = "Số điện thoại không hợp lệ";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = "Email không hợp lệ";
  if (!formData.className) newErrors.className = "Lớp bắt buộc";
  if (!formData.course) newErrors.course = "Khóa học bắt buộc";
  if (!formData.faculty) newErrors.faculty = "Ngành học bắt buộc";
  if (!formData.cccdIssuePlace) newErrors.cccdIssuePlace = "Nơi cấp CCCD bắt buộc";
  if (!formData.ethnicity) newErrors.ethnicity = "Dân tộc bắt buộc";
  if (!formData.religion) newErrors.religion = "Tôn giáo bắt buộc";
  if (!formData.hometown) newErrors.hometown = "Quê quán bắt buộc";
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
    // Realtime validate
    let error = "";
    if (name === "email") {
      if (!/\S+@\S+\.\S+/.test(value)) error = "Email không hợp lệ";
    }
    if (name === "phone") {
      if (!/^\d{9,11}$/.test(value)) error = "Số điện thoại không hợp lệ";
    }
    if (name === "guardianName" && !value) error = "Tên người bảo lãnh bắt buộc";
    if (name === "guardianPhone") {
      if (!value) error = "Số điện thoại người bảo lãnh bắt buộc";
      else if (!/^\d{9,11}$/.test(value)) error = "Số điện thoại không hợp lệ";
    }
    if (name === "studentId" && !value) error = "Mã sinh viên bắt buộc";
    if (name === "fullName" && !value) error = "Họ tên bắt buộc";
    if (name === "dob" && !value) error = "Ngày sinh bắt buộc";
    if (name === "cccd") {
      if (!value) error = "CCCD bắt buộc";
      else if (!/^\d{12}$/.test(value)) error = "CCCD phải là 12 số";
    }
    if (name === "className" && !value) error = "Lớp bắt buộc";
    if (name === "course" && !value) error = "Khóa học bắt buộc";
    if (name === "faculty" && !value) error = "Ngành học bắt buộc";
    if (name === "cccdIssuePlace" && !value) error = "Nơi cấp CCCD bắt buộc";
    if (name === "fullName" && !value) error = "Họ tên bắt buộc";
    if (name === "ethnicity" && !value) error = "Dân tộc bắt buộc";
    if (name === "religion" && !value) error = "Tôn giáo bắt buộc";
    if (name === "hometown" && !value) error = "Quê quán bắt buộc";
  setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setTouched(prev => ({ ...prev, [name]: true }));
    // Realtime validate for select fields
    let error = "";
    if ((name === "gender" || name === "faculty" || name === "className" || name === "course") && !value) error = "Bắt buộc";
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (fieldName: keyof typeof initialState, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields before submit
    const newErrors = validate();
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {
      await sendOtp(formData.email, "dangkynguyenvong");
      setStep(1); // Sang bước nhập OTP
      setTimer(180);
      setOtp('');
      setOtpError('');
      setOtpTries(0);
      // Start timer countdown
      if (timerId) clearInterval(timerId);
      const id = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(id);
            setOtpError('OTP đã hết hạn, vui lòng gửi lại.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerId(id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi gửi OTP",
        description: error.message || "Không thể gửi OTP. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý nhập OTP
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError('');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    setIsLoading(true);
    try {
      const resp = await verifyOtp(formData.email, otp, "dangkynguyenvong");
      if (resp.token) {
        setOtpToken(resp.token);
        // Gửi đăng ký cuối cùng
        const payload = {
          email: formData.email,
          student_id: formData.studentId,
          full_name: formData.fullName,
          dob: formData.dob,
          gender: formData.gender,
          cccd: formData.cccd,
          cccd_issue_date: formData.cccdIssueDate,
          cccd_issue_place: formData.cccdIssuePlace,
          phone: formData.phone,
          avatar_front: formData.avatarFront,
          avatar_back: formData.avatarBack,
          class: formData.className,
          course: formData.course,
          faculty: formData.faculty,
          ethnicity: formData.ethnicity,
          religion: formData.religion,
          hometown: formData.hometown,
          guardian_name: formData.guardianName,
          guardian_phone: formData.guardianPhone,
          priority_proof: formData.priorityProof,
          preferred_site: formData.preferredSite,
          preferred_dorm: formData.preferredDorm,
          priority_group: formData.priorityGroup,
          admission_type: formData.admissionType,
          status: "pending",
          notes: formData.notes,
        };
        await submitDormApplication(payload, resp.token);
        setSuccessMsg("Đăng ký thành công! Hãy chờ kết quả của ban quản lý trong 3-5 ngày.");
        setFormData(initialState);
        setOtp('');
        setOtpToken('');
        setTimer(180);
        if (timerId) clearInterval(timerId);
        setStep(2); // Sang bước kết quả
      } else {
        setOtpError('OTP không hợp lệ hoặc đã hết hạn.');
        setOtpTries((prev) => prev + 1);
      }
    } catch (error: any) {
      setOtpError(error.message || 'Xác thực OTP thất bại.');
      setOtpTries((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Đăng ký nguyện vọng ký túc xá</span>
          </DialogTitle>
        </DialogHeader>
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${idx <= step ? 'bg-red-600' : 'bg-gray-300'}`}>{idx + 1}</div>
              <span className={`text-sm font-semibold ${idx === step ? 'text-red-700' : 'text-gray-500'}`}>{s}</span>
              {idx < steps.length - 1 && <div className={`w-8 h-1 ${idx < step ? 'bg-red-600' : 'bg-gray-300'}`}></div>}
            </div>
          ))}
        </div>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {step === 0 && (
              <form onSubmit={handleSubmit} className="space-y-4 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20">
                    <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-2" />
                    <div className="text-red-700 font-semibold">Đang xác thực, vui lòng chờ...</div>
                  </div>
                )}
                {/* Thông tin cá nhân: 3 trường 1 hàng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Mã sinh viên *</Label>
                    <Input id="studentId" name="studentId" placeholder="Ví dụ: B21DCCN001" value={formData.studentId} onChange={handleInputChange} required />
                    {errors.studentId && <span className="text-destructive text-xs">{errors.studentId}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ tên *</Label>
                    <Input id="fullName" name="fullName" placeholder="Họ và tên đầy đủ" value={formData.fullName} onChange={handleInputChange} required />
                    {errors.fullName && <span className="text-destructive text-xs">{errors.fullName}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Ngày sinh *</Label>
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                    {errors.dob && <span className="text-destructive text-xs">{errors.dob}</span>}
                  </div>
                </div>

                {/* Giới tính, CCCD, Ngày cấp: 3 trường 1 hàng */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <span className="text-destructive text-xs">{errors.gender}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cccd">CCCD *</Label>
                    <Input id="cccd" name="cccd" placeholder="Số CCCD" value={formData.cccd} onChange={handleInputChange} required />
                    {errors.cccd && <span className="text-destructive text-xs">{errors.cccd}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cccdIssueDate">Ngày cấp</Label>
                    <Input id="cccdIssueDate" name="cccdIssueDate" type="date" value={formData.cccdIssueDate} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cccdIssuePlace">Nơi cấp *</Label>
                  <Input id="cccdIssuePlace" name="cccdIssuePlace" placeholder="Nơi cấp CCCD" value={formData.cccdIssuePlace} onChange={handleInputChange} required />
                  {touched.cccdIssuePlace && errors.cccdIssuePlace && <span className="text-destructive text-xs">{errors.cccdIssuePlace}</span>}
                </div>

                {/* Thông tin liên hệ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Số điện thoại" value={formData.phone} onChange={handleInputChange} required
                      className={touched.phone ? (errors.phone ? "border-red-500" : "border-green-500") : ""}
                    />
                    {touched.phone && errors.phone && <span className="text-destructive text-xs">{errors.phone}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required
                      className={touched.email ? (errors.email ? "border-red-500" : "border-green-500") : ""}
                    />
                    {touched.email && errors.email && <span className="text-destructive text-xs">{errors.email}</span>}
                  </div>
                </div>

                {/* Ảnh CCCD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avatarFront">Ảnh CCCD mặt trước</Label>
                    <Input id="avatarFront" name="avatarFront" type="file" accept="image/*" onChange={(e) => handleFileChange("avatarFront", e.target.files?.[0] || null)} className="cursor-pointer" />
                    {formData.avatarFront && (
                      <img
                        src={URL.createObjectURL(formData.avatarFront)}
                        alt="Ảnh mặt trước"
                        className="mt-2 rounded shadow max-h-40 object-contain border"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarBack">Ảnh CCCD mặt sau</Label>
                    <Input id="avatarBack" name="avatarBack" type="file" accept="image/*" onChange={(e) => handleFileChange("avatarBack", e.target.files?.[0] || null)} className="cursor-pointer" />
                    {formData.avatarBack && (
                      <img
                        src={URL.createObjectURL(formData.avatarBack)}
                        alt="Ảnh mặt sau"
                        className="mt-2 rounded shadow max-h-40 object-contain border"
                      />
                    )}
                  </div>
                </div>

                {/* Thông tin học tập */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Lớp *</Label>
                    <Input id="className" name="className" placeholder="Ví dụ: D21CQCN01-B" value={formData.className} onChange={handleInputChange} required />
                    {errors.className && <span className="text-destructive text-xs">{errors.className}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Khóa *</Label>
                    <Input id="course" name="course" placeholder="Ví dụ: D21" value={formData.course} onChange={handleInputChange} required />
                    {errors.course && <span className="text-destructive text-xs">{errors.course}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionType">Hệ đào tạo *</Label>
                    <Select value={formData.admissionType} onValueChange={(value) => handleSelectChange("admissionType", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn hệ đào tạo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chính quy">Chính quy</SelectItem>
                        <SelectItem value="Liên thông">Liên thông</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty">Ngành học *</Label>
                    <Select value={formData.faculty} onValueChange={(value) => handleSelectChange("faculty", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn ngành học" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNTT">Công nghệ thông tin</SelectItem>
                        <SelectItem value="ATTT">An toàn thông tin</SelectItem>
                        <SelectItem value="ĐTVT">Điện tử viễn thông</SelectItem>
                        <SelectItem value="QTKD">Quản trị kinh doanh</SelectItem>
                        <SelectItem value="KTĐT">Kỹ thuật điện tử</SelectItem>
                        <SelectItem value="KTPM">Kỹ thuật phần mềm</SelectItem>
                        <SelectItem value="Kinh tế">Kinh tế</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.faculty && <span className="text-destructive text-xs">{errors.faculty}</span>}
                  </div>
                </div>

                {/* Thông tin cá nhân bổ sung */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Dân tộc *</Label>
                    <Input id="ethnicity" name="ethnicity" placeholder="Dân tộc" value={formData.ethnicity} onChange={handleInputChange} required />
                    {touched.ethnicity && errors.ethnicity && <span className="text-destructive text-xs">{errors.ethnicity}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Tôn giáo *</Label>
                    <Input id="religion" name="religion" placeholder="Tôn giáo" value={formData.religion} onChange={handleInputChange} required />
                    {touched.religion && errors.religion && <span className="text-destructive text-xs">{errors.religion}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hometown">Quê quán *</Label>
                  <Input id="hometown" name="hometown" placeholder="Quê quán" value={formData.hometown} onChange={handleInputChange} required />
                  {touched.hometown && errors.hometown && <span className="text-destructive text-xs">{errors.hometown}</span>}
                </div>

                {/* Thông tin người bảo lãnh */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Người bảo lãnh *</Label>
                    <Input id="guardianName" name="guardianName" placeholder="Tên người bảo lãnh" value={formData.guardianName} onChange={handleInputChange} required />
                    {touched.guardianName && errors.guardianName && <span className="text-destructive text-xs">{errors.guardianName}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">SĐT người bảo lãnh *</Label>
                    <Input id="guardianPhone" name="guardianPhone" placeholder="Số điện thoại người bảo lãnh" value={formData.guardianPhone} onChange={handleInputChange} required />
                    {touched.guardianPhone && errors.guardianPhone && <span className="text-destructive text-xs">{errors.guardianPhone}</span>}
                  </div>
                </div>

                {/* Thông tin ưu tiên và nguyện vọng */}
                {/* Đối tượng ưu tiên và minh chứng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priorityGroup">Đối tượng ưu tiên</Label>
                    <Select value={formData.priorityGroup} onValueChange={(value) => handleSelectChange("priorityGroup", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn đối tượng ưu tiên" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Không">Không</SelectItem>
                        <SelectItem value="Người khuyết tật">Người khuyết tật</SelectItem>
                        <SelectItem value="Hộ nghèo">Hộ nghèo</SelectItem>
                        <SelectItem value="Hộ cận nghèo">Hộ cận nghèo</SelectItem>
                        <SelectItem value="Dân tộc thiểu số">Dân tộc thiểu số</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.priorityGroup && formData.priorityGroup !== "Không" && (
                    <div className="space-y-2">
                      <Label htmlFor="priorityProof">Minh chứng ưu tiên</Label>
                      <Input id="priorityProof" name="priorityProof" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => handleFileChange("priorityProof", e.target.files?.[0] || null)} className="cursor-pointer" />
                      {formData.priorityProof && (
                        <div className="mt-2">
                          <span className="text-xs">Đã chọn: {formData.priorityProof.name}</span>
                          {formData.priorityProof.type.startsWith('image/') && (
                            <img
                              src={URL.createObjectURL(formData.priorityProof)}
                              alt="Minh chứng ưu tiên"
                              className="mt-2 rounded shadow max-h-40 object-contain border"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredSite">Cơ sở</Label>
                    <Select value={formData.preferredSite} onValueChange={(value) => handleSelectChange("preferredSite", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hà Đông">Hà Đông</SelectItem>
                        <SelectItem value="Ngọc Trục">Ngọc Trục</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredDorm">Ký túc xá mong muốn</Label>
                    <Select value={formData.preferredDorm} onValueChange={(value) => handleSelectChange("preferredDorm", value)}>
                      <SelectTrigger><SelectValue placeholder="Chọn KTX" /></SelectTrigger>
                      <SelectContent>
                        {formData.preferredSite === "Hà Đông" && (
                          <>
                            <SelectItem value="B1">Tòa B1</SelectItem>
                            <SelectItem value="B2">Tòa B2</SelectItem>
                            <SelectItem value="B5">Tòa B5</SelectItem>
                          </>
                        )}
                        {formData.preferredSite === "Ngọc Trục" && (
                          <SelectItem value="B0">Tòa B0</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea id="notes" name="notes" placeholder="Nhập thông tin bổ sung (hoàn cảnh gia đình, yêu cầu đặc biệt...)" value={formData.notes} onChange={handleInputChange} rows={3} />
                </div>
                {/* ...existing code... */}
                <div className="flex space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">Hủy bỏ</Button>
                  <Button type="submit" variant="default" className="flex-1" disabled={isLoading || Object.values(errors).some(e => e)}>
                    <UserPlus className="mr-2 h-4 w-4" />Gửi đăng ký
                  </Button>
                </div>
              </form>
            )}
            {step === 1 && (
              <form onSubmit={handleOtpSubmit} className="flex flex-col items-center justify-center space-y-6 py-8">
                <Label htmlFor="otp" className="mb-2 text-lg font-semibold">Nhập mã OTP (6 số)</Label>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5].map(i => (
                    <Input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (!val) return;
                        const newOtp = otp.substring(0, i) + val + otp.substring(i+1);
                        setOtp(newOtp.slice(0,6));
                        // focus next
                        const next = document.getElementById(`otp-input-${i+1}`);
                        if (next) (next as HTMLInputElement).focus();
                      }}
                      id={`otp-input-${i}`}
                      className="w-10 h-12 text-center text-xl border-2 border-gray-300 rounded bg-gray-50 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-400 transition-colors duration-150 hover:border-red-400 cursor-pointer"
                      disabled={isLoading || timer === 0 || otpTries >= 3}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">OTP sẽ hết hạn sau <span className="font-bold">{timer}s</span></div>
                {otpError && <div className="text-destructive mt-2">{otpError} {otpTries > 0 && otpTries < 3 && `(Còn ${3-otpTries} lần)`}</div>}
                <Button type="submit" variant="destructive" className="mt-4" disabled={isLoading || otp.length !== 6 || timer === 0 || otpTries >= 3}>
                  {isLoading ? "Đang xác thực..." : "Xác nhận OTP"}
                </Button>
                {otpTries >= 3 && <div className="text-red-600 font-semibold mt-2">Bạn đã nhập sai quá 3 lần. Đóng form và thử lại sau.</div>}
              </form>
            )}
            {step === 2 && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded text-green-800 text-center font-semibold text-lg">
                {successMsg}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;