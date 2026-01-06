# Hệ thống Quản lý Ký túc xá PTIT - Frontend

## Giới thiệu

Ứng dụng web quản lý ký túc xá dành cho Học viện Công nghệ Bưu chính Viễn thông (PTIT). Hệ thống số hóa toàn bộ quy trình từ đăng ký chỗ ở, quản lý hợp đồng, theo dõi hóa đóa điện nước đến xử lý các yêu cầu dịch vụ.

### Vai trò người dùng

- **Sinh viên**: Quản lý phòng ở, hợp đồng, hóa đơn và các dịch vụ ký túc xá
- **Quản lý/Nhân viên**: Duyệt hồ sơ, quản lý phòng, lịch trực, hóa đơn và khiếu nại
- **Quản trị viên**: Quản lý tài khoản, phân quyền, sao lưu dữ liệu và cấu hình hệ thống

### Tính năng nổi bật

- Đăng nhập bằng tài khoản Microsoft
- Xem sơ đồ 3D của khu ký túc xá
- Chatbot hỗ trợ tự động
- Thông báo thời gian thực qua WebSocket
- Giao diện responsive đa thiết bị

## Công nghệ sử dụng

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Shadcn UI, Radix UI
- **State Management**: TanStack Query, React Hook Form, Zod
- **Authentication**: Azure MSAL (Microsoft Login)
- **3D Graphics**: React Three Fiber, Three.js
- **Utilities**: FullCalendar, Recharts, date-fns, docx

## Hướng dẫn Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js phiên bản 18.x trở lên
- npm hoặc bun package manager
- Git

### Các bước cài đặt

#### 1. Clone repository về máy
```bash
git clone https://github.com/ptit-dev/PTIT-DORM-FE.git
cd PTIT-DORM-FE
```

#### 2. Cài đặt dependencies

Sử dụng npm:
```bash
npm install
```

Hoặc sử dụng bun (khuyến nghị để cài đặt nhanh hơn):
```bash
bun install
```

#### 3. Cấu hình biến môi trường

Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```

Cấu hình các biến môi trường trong file `.env`:
```
VITE_API_BASE_URL=<backend-api-url>
VITE_WEBSOCKET_BACKEND_URL=<websocket-backend-url>
VITE_CHATBOT_WEBSOCKET_URL=<chatbot-websocket-url>
VITE_MICROSOFT_CLIENT_ID=<microsoft-app-client-id>
VITE_MICROSOFT_REDIRECT_URI=<redirect-uri-after-login>
```

#### 4. Chạy ứng dụng ở chế độ development

Sử dụng npm:
```bash
npm run dev
```

Hoặc sử dụng bun:
```bash
bun dev
```

Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

#### 5. Build cho production

Để build ứng dụng cho môi trường production:
```bash
npm run build
```

Hoặc:
```bash
bun run build
```

File build sẽ được tạo trong thư mục `dist/`


### Yêu cầu
- Node.js 20.x trở lên
- npm hoặc bun

### Cài đặt và Chạy

1. Clone repository
```bash
git clone https://github.com/ptit-dev/PTIT-DORM-FE.git
cd PTIT-DORM-FE
```

2. Cài đặt dependencies
```bash
npm install
# hoặc
bun install
```

3. Cấu hình biến môi trường
```bash
cp .env.example .env
```
Cập nhật file `.env` với các giá trị phù hợp

4. Chạy development server
```
src/
├── assets/          # Hình ảnh và dữ liệu tĩnh
├── components/      # Component UI tái sử dụng
│   ├── auth/       # Authentication
│   ├── dashboard/  # Dashboard theo role
│   ├── forms/      # Form và modal
│   ├── layout/     # Header, Footer, Sidebar
│   └── ui/         # Component cơ bản (Shadcn UI)
├── config/          # Cấu hình API
├── features/        # Logic nghiệp vụ
│   ├── auth/       # Authentication và API
│   ├── chatbot/    # Tích hợp chatbot
│   └── socket/     # WebSocket
├── hooks/           # Custom React hooks
├── model/           # TypeScript types/interfaces
├── pages/           # Các trang chính
│   ├── pages-manager/   # Trang quản lý
│   └── pages-student/   # Trang sinh viên
├── utils/           # Hàm tiện ích
└── App.tsx          # Routes chính
```

### Thử nghiệm trên môi trường Production: [PTIT Dorm](https://ptit-dorm.vercel.app/)


## Liên hệ
PTIT Dorm Development Team

| Họ và Tên | Email | GitHub |
| :--- | :--- | :--- |
| **Ngọ Văn Trọng** | TrongNV.B21CN726@stu.ptit.edu.vn | [TrongNgoVan](https://github.com/TrongNgoVan) |
| **Dương Xuân Hùng** | hungdx.ptit@gmail.com | [HungDuongXuan](https://github.com/HungDuongXuan) |



## 

Học viện Công nghệ Bưu chính Viễn thông (PTIT)