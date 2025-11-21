import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/features/auth/api";
import { useNavigate } from "react-router-dom";
import ptitCampusBg from "@/assets/ptit-campus-bg.jpg";
import bannerLogo from "@/assets/banner-logo.jpg";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await login(formData.username, formData.password);
      localStorage.setItem("ptit_access_token", data.access_token);
      localStorage.setItem("ptit_refresh_token", data.refresh_token);
      localStorage.setItem("ptit_user", JSON.stringify(data.user));
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.display_name}!`,
      });
      onLoginSuccess(data.user);
      onClose();
  navigate("/home");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: "Vui lòng kiểm tra lại thông tin đăng nhập.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-modal"
        style={{
          backgroundImage: `url(${ptitCampusBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        <Card className="relative z-10 border-none shadow-xl bg-white/95 backdrop-blur-sm">
          <DialogHeader className="p-6 pb-4">
            <div className="flex justify-center mb-4">
              <img 
                src={bannerLogo} 
                alt="PTIT Banner" 
                className="h-12 object-contain"
              />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              Đăng nhập hệ thống
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm">
              Hệ thống Ký túc xá PTIT
            </p>
          </DialogHeader>
          
          <CardContent className="p-6 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nhập mã sinh viên hoặc email học viện"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="border-input-border focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border-input-border focus:ring-primary focus:border-primary pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lưu đăng nhập
                  </Label>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary p-0 h-auto"
                  type="button"
                >
                  Quên mật khẩu?
                </Button>
              </div>

              <Button
                type="submit"
                variant="ptit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </>
                )}
              </Button>
                <Button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-2 rounded-lg shadow transition-all duration-200 mt-2"
                  onClick={async () => {
                    function generateCodeVerifier(length = 128) {
                      const array = new Uint8Array(length);
                      window.crypto.getRandomValues(array);
                      return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
                    }
                    async function generateCodeChallenge(codeVerifier) {
                      const data = new TextEncoder().encode(codeVerifier);
                      const digest = await window.crypto.subtle.digest('SHA-256', data);
                      const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
                        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                      return base64;
                    }
                    const clientId = "75dc578e-179c-4375-8408-807e01f8153c"; // Thay bằng clientId thực tế
                    const tenant = "common"; // hoặc tenantId
                    const redirectUri = "http://localhost:3000/oauth-callback"; // Thay bằng redirectUri thực tế
                    const scope = "openid profile email User.Read";
                    const codeVerifier = generateCodeVerifier();
                    const codeChallenge = await generateCodeChallenge(codeVerifier);
                    localStorage.setItem("ms_code_verifier", codeVerifier);
                    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?` +
                      `client_id=${clientId}` +
                      `&response_type=code` +
                      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                      `&response_mode=query` +
                      `&scope=${encodeURIComponent(scope)}` +
                      `&code_challenge=${codeChallenge}` +
                      `&code_challenge_method=S256`;
                    window.location.href = url;
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                    <rect width="14" height="14" x="2" y="2" fill="#F35325" />
                    <rect width="14" height="14" x="16" y="2" fill="#81BC06" />
                    <rect width="14" height="14" x="2" y="16" fill="#05A6F0" />
                    <rect width="14" height="14" x="16" y="16" fill="#FFBA08" />
                  </svg>
                  Đăng nhập với Microsoft
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Hỗ trợ kỹ thuật: d21ptit.dev@ptit.edu.vn</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;