import { useEffect } from "react";
import FacilityService from "./pages/pages-student/FacilityService";
import RoomChangeService from "./pages/pages-student/RoomChangeService";
import AbsenceService from "./pages/pages-student/AbsenceService";
import MyRoomElectricBills from "./pages/pages-student/MyRoomElectricBills";
import MyRoom from "./pages/pages-student/MyRoom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import News from "./pages/News";
import OauthCallback from "./pages/OauthCallback";
import DormInfo from "./pages/DormInfo";
import DormArea from "./pages/pages-manager/DormArea";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ApplicationList from "./pages/pages-manager/ApplicationList";
import RegistrationPeriod from "./pages/pages-manager/Registration_Period";
import MyContract from "./pages/pages-student/MyContract";
import ManageEmployee from "./pages/pages-manager/ManageEmployee";
import ManageRooms from "./pages/pages-manager/ManageRooms";
import DutySchedule from "./pages/pages-manager/DutySchedule";
import ContractList from "./pages/pages-manager/ContractList";
import ElectricBillList from "./pages/pages-manager/ElectricBillList";
import FacilityComplaints from "./pages/pages-manager/FacilityComplaints";
import LogMonitorPage from "./pages/LogMonitor";
import AdminAccounts from "./pages/AdminAccounts";
import BackupData from "./pages/BackupData";
import RoomTransferRequests from "./pages/pages-manager/RoomTransferRequests";
import { refreshAccessToken } from "@/features/auth/api";
import RequireAuth from "@/features/auth/RequireAuth";
import ChatbotButton from "./components/ui/chatbot-button";
const queryClient = new QueryClient();
// const AuthInitializer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const refreshToken = localStorage.getItem("ptit_refresh_token");
//     if (!refreshToken) return;

//     let cancelled = false;

//     const run = async () => {
//       try {
//         const data = await refreshAccessToken(refreshToken);
//         if (cancelled) return;

//         if (!data?.access_token) {
//           throw new Error("Missing access_token from refresh response");
//         }

//         localStorage.setItem("ptit_access_token", data.access_token);
//         if (data.refresh_token) {
//           localStorage.setItem("ptit_refresh_token", data.refresh_token);
//         }
//         if (data.user) {
//           localStorage.setItem("ptit_user", JSON.stringify(data.user));
//         }
//       } catch {
//         if (cancelled) return;
//         localStorage.clear();
//         if (location.pathname !== "/") {
//           navigate("/", { replace: true });
//         }
//       }
//     };

//     run();

//     return () => {
//       cancelled = true;
//     };
//   }, [navigate, location.pathname]);

//   return null;
// };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <AuthInitializer /> */}
        <Routes>
          <Route path="/oauth-callback" element={<OauthCallback />} />
          <Route path="/" element={<Intro />} />
          {/* Các route cần đăng nhập nhưng không giới hạn role cụ thể */}
          <Route
            path="/home"
            element={(
              <RequireAuth>
                <Home />
              </RequireAuth>
            )}
          />
          <Route
            path="/news"
            element={(
              <RequireAuth>
                <News />
              </RequireAuth>
            )}
          />
          <Route
            path="/profile"
            element={(
              <RequireAuth>
                <Profile />
              </RequireAuth>
            )}
          />

          {/* Admin system */}
          <Route
            path="/admin-accounts"
            element={(
              <RequireAuth allowedRoles={["admin_system"]}>
                <AdminAccounts />
              </RequireAuth>
            )}
          />
          <Route
            path="/system-logs"
            element={(
              <RequireAuth allowedRoles={["admin_system"]}>
                <LogMonitorPage />
              </RequireAuth>
            )}
          />
          <Route
            path="/backup-data"
            element={(
              <RequireAuth allowedRoles={["admin_system"]}>
                <BackupData />
              </RequireAuth>
            )}
          />
          <Route
            path="/dorm-info"
            element={(
              <RequireAuth allowedRoles={["admin_system"]}>
                <DormInfo />
              </RequireAuth>
            )}
          />

          {/* Manager & nhân viên */}
          <Route
            path="/application-list"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <ApplicationList />
              </RequireAuth>
            )}
          />
          <Route
            path="/dorm-areas"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager", "non-manager"]}>
                <DormArea />
              </RequireAuth>
            )}
          />
          <Route
            path="/registration-period"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <RegistrationPeriod />
              </RequireAuth>
            )}
          />
          <Route
            path="/contract-list"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <ContractList />
              </RequireAuth>
            )}
          />
          <Route
            path="/manage-rooms"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <ManageRooms />
              </RequireAuth>
            )}
          />
          <Route
            path="/room-transfer-requests"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <RoomTransferRequests />
              </RequireAuth>
            )}
          />
          <Route
            path="/manage-employee"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager"]}>
                <ManageEmployee />
              </RequireAuth>
            )}
          />
          <Route
            path="/duty-schedule"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager", "non-manager"]}>
                <DutySchedule />
              </RequireAuth>
            )}
          />
          <Route
            path="/electric-bill-list"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager", "non-manager"]}>
                <ElectricBillList />
              </RequireAuth>
            )}
          />
          <Route
            path="/facility-complaints"
            element={(
              <RequireAuth allowedRoles={["admin_system", "manager", "non-manager"]}>
                <FacilityComplaints />
              </RequireAuth>
            )}
          />

          {/* Student */}
          <Route
            path="/my-contract"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <MyContract />
              </RequireAuth>
            )}
          />
          <Route
            path="/my-room-electric-bills"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <MyRoomElectricBills />
              </RequireAuth>
            )}
          />
          <Route
            path="/my-room"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <MyRoom />
              </RequireAuth>
            )}
          />
          <Route
            path="/facility-service"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <FacilityService />
              </RequireAuth>
            )}
          />
          <Route
            path="/room-change-service"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <RoomChangeService />
              </RequireAuth>
            )}
          />
          <Route
            path="/absence-service"
            element={(
              <RequireAuth allowedRoles={["student"]}>
                <AbsenceService />
              </RequireAuth>
            )}
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ChatbotButton />

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
