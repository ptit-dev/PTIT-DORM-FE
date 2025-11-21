import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutAllSessions, logout } from "@/features/auth/api";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLogoutAll: (password: string) => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose, onLogout, onLogoutAll }) => {
  const [step, setStep] = useState<"choice" | "password" | "guest-blocked">("choice");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoutAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
      if (!user || !user.username) throw new Error("Không tìm thấy user");
      await logoutAllSessions(user.username, password);
      localStorage.clear();
      onLogoutAll(password);
      window.location.reload();
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const refreshToken = localStorage.getItem("ptit_refresh_token");
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (e) {
      // Ignore errors during logout
    } finally {
      localStorage.clear();
      onLogout();
      window.location.reload();
      setLoading(false);
    }
  }
  // Kiểm tra nếu là khách
  const user = JSON.parse(localStorage.getItem("ptit_user") || "null");
  const isGuest = !user || user.roles?.includes("guest");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đăng xuất</DialogTitle>
        </DialogHeader>
        {step === "choice" && (
          <div className="space-y-4">
            <p>Bạn muốn đăng xuất như thế nào?</p>
            <div className="flex flex-col gap-3">
              <Button variant="destructive" onClick={handleLogout} disabled={loading}>
                Đăng xuất thiết bị này
              </Button>
              <Button variant="outline" onClick={() => {
                if (isGuest) setStep("guest-blocked");
                else setStep("password");
              }}>
                Đăng xuất toàn bộ thiết bị
              </Button>
            </div>
          </div>
        )}
        {step === "guest-blocked" && (
          <div className="space-y-4">
            <p className="text-red-600 font-semibold">Chức năng này không dành cho khách vãng lai.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("choice")}>
                Quay lại
              </Button>
            </DialogFooter>
          </div>
        )}
        {step === "password" && (
          <div className="space-y-4">
            <p>Nhập mật khẩu để đăng xuất toàn bộ phiên:</p>
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("choice")} disabled={loading}>Quay lại</Button>
              <Button variant="destructive" onClick={handleLogoutAll} disabled={loading || !password}>
                {loading ? "Đang xử lý..." : "Đăng xuất toàn bộ"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
