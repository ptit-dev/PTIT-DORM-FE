import React from "react";
import { Navigate } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactElement;
  /**
   * Danh sách role được phép truy cập.
   * Nếu không truyền, chỉ cần đăng nhập (có token + user) là đủ.
   */
  allowedRoles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("ptit_access_token") : null;
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("ptit_user") : null;

  let user: { roles?: string[] } | null = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  // Chưa đăng nhập -> về trang intro
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Nếu có cấu hình quyền cho route thì kiểm tra
  if (allowedRoles && allowedRoles.length > 0) {
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const hasAllowedRole = roles.some((r) => allowedRoles.includes(r));
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RequireAuth;
