import FacilityService from "./pages/pages-student/FacilityService";
import RoomChangeService from "./pages/pages-student/RoomChangeService";
import AbsenceService from "./pages/pages-student/AbsenceService";
import MyRoomElectricBills from "./pages/pages-student/MyRoomElectricBills";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import OauthCallback from "./pages/OauthCallback";
import DormInfo from "./pages/DormInfo";
import DormArea from "./pages/pages-manager/DormArea";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ApplicationList from "./pages/pages-manager/ApplicationList";
import RegistrationPeriod from "./pages/pages-manager/Registration_Period";
import MyContract from "./pages/pages-student/my_contract";
import ManageEmployee from "./pages/pages-manager/ManageEmployee";
import DutySchedule from "./pages/pages-manager/DutySchedule";
import ContractList from "./pages/pages-manager/ContractList";
import ElectricBillList from "./pages/pages-manager/ElectricBillList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/oauth-callback" element={<OauthCallback />} />
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dorm-info" element={<DormInfo />} />
          <Route path="/application-list" element={<ApplicationList />} />
          <Route path="/dorm-areas" element={<DormArea />} />
          <Route path="/registration-period" element={<RegistrationPeriod />} />
          <Route path="/my-contract" element={<MyContract />} />
          <Route path="/manage-employee" element={<ManageEmployee />} />
          <Route path="/duty-schedule" element={<DutySchedule />} />
          <Route path="/contract-list" element={<ContractList />} />

          <Route path="/electric-bill-list" element={<ElectricBillList />} />
          <Route path="/my-room-electric-bills" element={<MyRoomElectricBills />} />
          <Route path="/facility-service" element={<FacilityService />} />
          <Route path="/room-change-service" element={<RoomChangeService />} />
          <Route path="/absence-service" element={<AbsenceService />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
