import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import Login from "@/pages/Login";
import StudentHome from "@/pages/student/StudentHome";
import StudentOutings from "@/pages/student/StudentOutings";
import StudentComplaints from "@/pages/student/StudentComplaints";
import StudentMess from "@/pages/student/StudentMess";
import StudentProfile from "@/pages/student/StudentProfile";
import StudentQR from "@/pages/student/StudentQR";
import WardenHome from "@/pages/warden/WardenHome";
import WardenOutings from "@/pages/warden/WardenOutings";
import WardenGateScan from "@/pages/warden/WardenGateScan";
import WardenComplaints from "@/pages/warden/WardenComplaints";
import WardenAnnouncements from "@/pages/warden/WardenAnnouncements";
import ParentHome from "@/pages/parent/ParentHome";
import ParentOutings from "@/pages/parent/ParentOutings";
import ParentAttendance from "@/pages/parent/ParentAttendance";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const rolePath = role === "resident" ? "student" : role;

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={`/${rolePath}`} replace />} />
        
        {/* Student Routes */}
        {role === "resident" && (
          <>
            <Route path="/student" element={<StudentHome />} />
            <Route path="/student/outings" element={<StudentOutings />} />
            <Route path="/student/complaints" element={<StudentComplaints />} />
            <Route path="/student/mess" element={<StudentMess />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/qr" element={<StudentQR />} />
          </>
        )}

        {/* Warden Routes */}
        {role === "warden" && (
          <>
            <Route path="/warden" element={<WardenHome />} />
            <Route path="/warden/outings" element={<WardenOutings />} />
            <Route path="/warden/gate-scan" element={<WardenGateScan />} />
            <Route path="/warden/complaints" element={<WardenComplaints />} />
            <Route path="/warden/announcements" element={<WardenAnnouncements />} />
          </>
        )}

        {/* Parent Routes */}
        {role === "parent" && (
          <>
            <Route path="/parent" element={<ParentHome />} />
            <Route path="/parent/outings" element={<ParentOutings />} />
            <Route path="/parent/attendance" element={<ParentAttendance />} />
          </>
        )}

        {/* Catch-all for wrong role paths or invalid routes */}
        <Route path="*" element={<Navigate to={`/${rolePath}`} replace />} />
      </Routes>
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
