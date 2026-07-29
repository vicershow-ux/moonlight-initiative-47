
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/crm/Dashboard";
import Objects from "./pages/crm/Objects";
import ObjectDetail from "./pages/crm/ObjectDetail";
import ObjectCreate from "./pages/crm/ObjectCreate";
import ObjectRooms from "./pages/crm/ObjectRooms";
import ObjectEdit from "./pages/crm/ObjectEdit";
import EstimateCreate from "./pages/crm/EstimateCreate";
import EstimateView from "./pages/crm/EstimateView";
import Services from "./pages/crm/Services";
import ServiceCreate from "./pages/crm/ServiceCreate";
import Documents from "./pages/crm/Documents";
import Customers from "./pages/crm/Customers";
import Company from "./pages/crm/Company";
import Team from "./pages/crm/Team";
import Profile from "./pages/crm/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cabinet" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/cabinet/objects" element={<ProtectedRoute><Objects /></ProtectedRoute>} />
            <Route path="/cabinet/objects/new" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ObjectCreate /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id" element={<ProtectedRoute><ObjectDetail /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/rooms" element={<ProtectedRoute><ObjectRooms /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/edit" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ObjectEdit /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/estimates/new" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><EstimateCreate /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/estimates/:estimateId/edit" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><EstimateCreate /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/estimates/:estimateId" element={<ProtectedRoute><EstimateView /></ProtectedRoute>} />
            <Route path="/cabinet/documents" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Documents /></ProtectedRoute>} />
            <Route path="/cabinet/customers" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Customers /></ProtectedRoute>} />
            <Route path="/cabinet/services" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Services /></ProtectedRoute>} />
            <Route path="/cabinet/services/new" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ServiceCreate /></ProtectedRoute>} />
            <Route path="/cabinet/company" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Company /></ProtectedRoute>} />
            <Route path="/cabinet/team" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Team /></ProtectedRoute>} />
            <Route path="/cabinet/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;