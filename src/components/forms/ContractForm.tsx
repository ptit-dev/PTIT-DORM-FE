import React, { useRef, useState } from "react";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { asBlob } from "html-docx-js-typescript";
import { saveAs } from "file-saver";
import { Contract } from "@/model/Contract";

interface ContractPreviewProps {
  contract: Contract;
  onBack: () => void;
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "...../...../..........";
  if (dateStr.includes('/')) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "...../...../..........";
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (e) {
    return "...../...../..........";
  }
};

const formatGender = (gender?: string) => {
  if (!gender) return "..........";
  const g = gender.toLowerCase();
  if (g === 'male' || g === 'nam') return 'Nam';
  if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
  return gender;
};

const formatCurrency = (amount?: number) => {
  return amount ? amount.toLocaleString('vi-VN') : '0';
};

const getCommonContentHtml = (contract: Contract) => {
  const info = contract.dorm_application;
  const today = new Date();
  
  const roomParts = contract.room?.split('-') || [];
  const toa = roomParts[0] || contract.building || '.....';
  const phong = roomParts[1] || (roomParts.length === 1 ? roomParts[0] : '.....');

  return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="text-align: center;">
            <h3 style="font-size: 14pt; margin: 0; font-weight: bold; text-transform: uppercase;">HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</h3>
            <p style="margin: 0; font-size: 12pt;">Km10, Đường Nguyễn Trãi, Hà Đông, Hà Nội</p>
            <p style="margin: 0; font-size: 12pt;">Tel: 024-33525248 (B5); 33510435 (B2), 33501463 (B1)</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: right; padding-right: 20px; font-style: italic; font-size: 12pt;">
            Hà Nội, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin: 20px 0;">
        <h2 style="font-size: 16pt; margin: 0; font-weight: bold;">ĐƠN ĐĂNG KÝ CHỖ Ở NỘI TRÚ KTX</h2>
        <p style="margin-top: 5px; font-size: 13pt;">Số: ${contract.code || '......'} Kỳ I (${today.getFullYear()}-${today.getFullYear() + 1})</p>
      </div>

      <div style="text-align: center; margin-bottom: 20px; font-size: 13pt;">
        <p style="margin: 2px 0;"><strong>Kính gửi:</strong> - Học viện Công nghệ Bưu chính Viễn thông</p>
        <p style="margin: 2px 0;">- Trung tâm Dịch vụ - KTX</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13pt;">
        <tr>
          <td style="width: 50%; padding: 3px 0;">Tên sinh viên: <strong>${info?.full_name || ''}</strong></td>
          <td style="width: 50%; padding: 3px 0;">Nam/Nữ: ${formatGender(info?.gender)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0;">Sinh ngày: ${formatDate(info?.dob)}</td>
          <td style="padding: 3px 0;">Dân tộc: ${info?.ethnicity || 'Kinh'}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0;">Nơi sinh: ${info?.hometown || '....................'}</td>
          <td style="padding: 3px 0;">Lớp: ${info?.class || ''}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0;">Khóa: ${info?.course || '.....'}</td>
          <td style="padding: 3px 0;">Mã SV: ${info?.username || info?.student_id || ''}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0;">Ngành: ${info?.faculty || '....................'}</td>
          <td style="padding: 3px 0;">Hệ đào tạo: ${info?.training_system || 'Chính quy'}</td>
        </tr>
        <tr>
          <td style="padding: 3px 0;">Điện thoại: ${info?.phone || ''}</td>
          <td style="padding: 3px 0;">Email: ${info?.email || ''}</td>
        </tr>
      </table>

      <p style="font-weight: bold; margin-left: 20px; margin-top: 15px; margin-bottom: 5px; font-size: 13pt;">Khi cần báo tin cho gia đình/ người thân (Người bảo lãnh):</p>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 13pt;">
        <tr>
          <td style="width: 55%; padding: 3px 0;">Họ tên: ${info?.guardian_name || '........................................'}</td>
          <td style="width: 45%; padding: 3px 0;">Số điện thoại: ${info?.guardian_phone || '....................'}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 3px 0;">Địa chỉ liên hệ: ${info?.guardian_address || '................................................................................'}</td>
        </tr>
      </table>

      <div style="margin-top: 15px; font-size: 13pt;">
        <p style="margin-left: 20px;"><strong>1. Nội dung:</strong> Sinh viên đăng ký chỗ ở nội trú tại KTX sinh viên của Học viện (Km10, đường Nguyễn Trãi, Q.Hà Đông, TP.Hà Nội). Cụ thể:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 5px; text-align: center;">
          <tr>
            <td style="width: 50%;">KTX (Toà): <strong>${toa}</strong></td>
            <td style="width: 50%;">Phòng ở: <strong>${phong}</strong></td>
          </tr>
        </table>

        <div style="padding-left: 40px; text-align: justify;">
          <p>Phòng có nhà tắm và vệ sinh khép kín, được trang bị các tiện nghi cơ bản: giường, đệm, chiếu, quạt, điều hòa, bình nóng lạnh và ở chung: 04 sinh viên/phòng.</p>
          <p>Thời gian: từ ngày ${formatDate(contract.start_date)} đến ngày ${formatDate(contract.end_date)}</p>
          <p>Sinh viên được sử dụng các trang thiết bị, tiện nghi trong phòng ở KTX theo quy định và theo biên bản giao nhận phòng ở giữa Tổ quản lý KTX và đại diện phòng ở.</p>
          <p>Mức thu nội trú hàng tháng theo quy định, thu đủ theo tháng ở nội trú (30 hoặc 31 ngày/tháng).</p>
          <p>Trường hợp sinh viên xin ra khỏi KTX ở giữa kỳ đã đóng tiền, sinh viên không được hoàn lại tiền lệ phí KTX đã đóng.</p>
        </div>
      </div>

      <div style="margin-top: 15px; font-size: 13pt;">
        <p style="margin-left: 20px;"><strong>2. Trách nhiệm của Học viện (TTDV- KTX):</strong></p>
        <div style="padding-left: 40px; text-align: justify;">
          <p>2.1. Cung cấp thông tin, thông báo về các quy chế, quy định, nội quy KTX, các mức thu, khoản thu hoặc thông báo có liên quan cho sinh viên biết để thực hiện.</p>
          <p>2.2. Bố trí phòng ở cho sinh viên theo đúng các nội dung đã ghi ở (phần 1).</p>
        </div>
      </div>

      <div style="margin-top: 15px; font-size: 13pt;">
        <p style="margin-left: 20px;"><strong>3. Mức thu và hình thức thanh toán:</strong></p>
        <p style="margin-left: 40px; font-weight: bold;">Mức thu tính tại thời điểm:</p>
        <p style="text-align: center; font-size: 14pt; font-weight: bold; margin: 10px 0;">
          ${formatCurrency(contract.total_amount)} VNĐ / 6 tháng
        </p>
        <p style="margin-left: 40px; font-weight: bold;">Hình thức thanh toán:</p>
        <div style="margin-left: 60px;">
            <p>Chuyển khoản hoặc tiền mặt (bằng tiền VNĐ) theo thông báo của Học viện.</p>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: justify; font-size: 13pt;">
        <p>Tôi cam kết thực hiện đúng và chấp hành nghiêm túc các quy định về Nội trú của Học viện.</p>
        <p style="text-align: left; font-weight: bold; margin-top: 10px;">Xin chân thành cảm ơn!</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 30px; text-align: center; font-size: 12pt;">
        <tr>
          <td style="width: 33%; vertical-align: top;">
            <p style="font-weight: bold; margin: 0;">KT. GIÁM ĐỐC</p>
            <p style="font-weight: bold; margin: 0;">PHÓ GIÁM ĐỐC</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</p>
          </td>
          <td style="width: 33%; vertical-align: top;">
            <p style="font-weight: bold; margin: 0;">TỔ QUẢN LÝ KTX</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</p>
          </td>
          <td style="width: 34%; vertical-align: top;">
            <p style="font-weight: bold; margin: 0;">NGƯỜI ĐĂNG KÝ</p>
            <p style="font-style: italic; font-size: 11pt;">(Ký, ghi rõ họ tên)</p>
            <div style="height: 80px;"></div>
            <p style="font-weight: bold; margin: 0;">${info?.full_name || ''}</p>
          </td>
        </tr>
      </table>

      <div style="margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px;">
        <p style="font-style: italic; font-size: 11pt;">Đơn này được lưu kèm cùng bản cam kết tại Bộ phận quản lý KTX</p>
      </div>
  `;
};

const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      const contractCode = String(contract.code || contract.id);
      const innerHtml = getCommonContentHtml(contract);
      
      const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <style>
              @page { size: A4; margin: 2cm 1.5cm 2cm 2.5cm; }
              body { font-family: 'Times New Roman', Times, serif; }
              p, div, td { line-height: 1.4; }
            </style>
          </head>
          <body>${innerHtml}</body>
        </html>
      `;

      const blob = await asBlob(fullHtml, {
        orientation: 'portrait',
        margins: { top: 1134, right: 850, bottom: 1134, left: 1417 }
      }) as Blob;
      
      saveAs(blob, `DonDangKyKTX_${contractCode}.docx`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-red-700">Xem trước Đơn đăng ký</h3>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 rounded bg-gray-500 text-white text-sm hover:bg-gray-600 flex items-center gap-2">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button onClick={handleExportWord} disabled={isExporting} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2">
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Đang tạo...' : 'Tải Word'}
          </button>
        </div>
      </div>

      <div className="bg-gray-200/80 rounded-xl flex-1 overflow-auto p-4 md:p-8">
        <div className="flex justify-center">
          <div className="origin-top scale-[0.5] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.9] xl:scale-100 transition-transform shadow-2xl">
            <div 
              ref={printRef} 
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: '13pt',
                lineHeight: '1.4',
                color: '#000',
                width: '210mm',
                minHeight: '297mm',
                padding: '2cm 1.5cm 2cm 2.5cm',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                margin: '0 auto',
              }}
              dangerouslySetInnerHTML={{ __html: getCommonContentHtml(contract) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;