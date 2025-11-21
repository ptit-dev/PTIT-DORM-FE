import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Institution Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              Học viện Công nghệ Bưu chính Viễn thông
            </h3>
            <p className="text-sm text-primary-foreground/80 mb-2">
              Hệ thống Ký túc xá PTIT
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>Km10, Đường Nguyễn Trãi, Q.Hà Đông, Hà Nội</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>024.3385.2008</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>ktx@ptit.edu.vn</span>
              </div>
            </div>
          </div>

          {/* Developer Info */}
          <div>
            <h4 className="font-semibold mb-4">Phát triển bởi</h4>
            <div className="text-sm space-y-1">
              <p className="font-medium">Team Dev D21PTIT</p>
              <p>• Ngọ Văn Trọng</p>
              <p>• Dương Xuân Hùng</p>
              <div className="mt-3 text-xs text-primary-foreground/70">
                Contact: d21ptit.dev@ptit.edu.vn
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2025 Học viện Công nghệ Bưu chính Viễn thông. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;