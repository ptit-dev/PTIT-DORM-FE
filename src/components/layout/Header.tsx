import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Home, User, LogOut } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import LogoutModal from "@/components/auth/LogoutModal";
import ptitLogo from "@/assets/ptit-logo-new.png";

interface User {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  avatar?: string;
  roles?: string[];
}

interface HeaderProps {
  user?: User | null;
  onMenuClick?: () => void;
}

import { useNavigate } from "react-router-dom";

const Header = ({ user, onMenuClick }: HeaderProps) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (userData: User) => {
    setIsLoginOpen(false);
    // Handle successful login
    console.log("Login successful:", userData);
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopiedField(null), 1000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* Hamburger menu for mobile */}
            <button
              className="md:hidden mr-2 p-2 rounded hover:bg-gray-100 focus:outline-none"
              onClick={onMenuClick}
              aria-label="Mở menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div
              className="flex items-center space-x-4 cursor-pointer hover:bg-red-50 rounded-lg px-2 py-1 transition"
              onClick={() => navigate("/")}
              tabIndex={0}
              role="button"
              aria-label="Về trang giới thiệu"
            >
              <img
                src={ptitLogo}
                alt="PTIT Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-primary">
                  Hệ thống Ký túc xá PTIT
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Học viện Công nghệ Bưu chính Viễn thông
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary-hover hover:bg-accent-light"
              onClick={() => navigate("/home")}
            >
              <Home className="h-4 w-4 mr-2" />
              Trang chủ
            </Button>

            {user ? (
              <div className="flex items-center gap-4">
                <button
                  ref={userBtnRef}
                  className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full shadow focus:outline-none hover:bg-gray-200 transition"
                  onClick={e => {
                    setShowProfile((v) => !v);
                    if (userBtnRef.current) {
                      const rect = userBtnRef.current.getBoundingClientRect();
                      setPopoverStyle({
                        position: 'absolute',
                        left: rect.left + window.scrollX,
                        top: rect.bottom + 8 + window.scrollY,
                        zIndex: 1000,
                        minWidth: 300,
                        width: rect.width + 120,
                        maxWidth: 350,
                      });
                    }
                  }}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={showProfile}
                >
                  <img
                    src={user.avatar || ptitLogo}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-700 bg-white"
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-base text-gray-800">
                      {user.display_name}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(user.roles && Array.isArray(user.roles) && user.roles.length > 0)
                        ? user.roles.map((role: string) => (
                          <span key={role} className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            {role}
                          </span>
                        ))
                        : <span className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">Sinh viên</span>
                      }
                    </div>
                  </div>
                </button>
                {/* User Profile Modal */}
                {showProfile && user && (
                  <div style={popoverStyle} className="fixed animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-xs relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg font-bold focus:outline-none"
                        onClick={() => setShowProfile(false)}
                        aria-label="Đóng"
                        tabIndex={-1}
                      >
                        ×
                      </button>
                      <div className="bg-violet-100 rounded-t-2xl flex flex-col items-center pt-5 pb-2">
                        <img
                          src={user.avatar || ptitLogo}
                          alt={user.display_name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow mb-2"
                        />
                      </div>
                      <div className="flex flex-col items-center px-5 pb-2">
                        <div className="text-lg font-bold mt-2 mb-0.5 text-gray-900">{user.display_name}</div>
                        <div className="text-gray-500 text-sm mb-0.5">{user.username}</div>
                        <div className="text-gray-500 text-sm mb-2">{user.email}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(user.roles && Array.isArray(user.roles) && user.roles.length > 0)
                            ? user.roles.map((role: string) => (
                              <span key={role} className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                {role}
                              </span>
                            ))
                            : <span className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">Sinh viên</span>
                          }
                        </div>
                      </div>
                      <div className="px-5 pb-4">
                        <div className="flex items-center justify-between py-1 border-b last:border-b-0">
                          <span className="text-gray-500 text-sm">User Id</span>
                          <span className="flex items-center gap-2">
                            <span className="tracking-widest text-lg select-none">••••••••••••••••</span>
                            <button
                              className="text-gray-400 hover:text-blue-600 focus:outline-none"
                              onClick={() => handleCopy('user_id', user.user_id)}
                              aria-label="Sao chép"
                            >
                              {copiedField === 'user_id' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2" stroke="currentColor" fill="none" /></svg>
                              )}
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsLogoutOpen(true)}
                  className="ml-2 !bg-red-700 !hover:bg-red-800 !text-white !border-none"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
                <LogoutModal
                  open={isLogoutOpen}
                  onClose={() => setIsLogoutOpen(false)}
                  onLogout={() => setIsLogoutOpen(false)}
                  onLogoutAll={async () => setIsLogoutOpen(false)}
                />
              </div>
            ) : (
              <Button
                onClick={() => setIsLoginOpen(true)}
                size="sm"
                variant="ptit"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Header;