
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/crm/Dashboard"));
const Objects = lazy(() => import("./pages/crm/Objects"));
const ObjectDetail = lazy(() => import("./pages/crm/ObjectDetail"));
const ObjectCreate = lazy(() => import("./pages/crm/ObjectCreate"));
const ObjectRooms = lazy(() => import("./pages/crm/ObjectRooms"));
const ObjectEdit = lazy(() => import("./pages/crm/ObjectEdit"));
const EstimateCreate = lazy(() => import("./pages/crm/EstimateCreate"));
const EstimateView = lazy(() => import("./pages/crm/EstimateView"));
const ContractEdit = lazy(() => import("./pages/crm/ContractEdit"));
const Services = lazy(() => import("./pages/crm/Services"));
const ServiceCreate = lazy(() => import("./pages/crm/ServiceCreate"));
const Documents = lazy(() => import("./pages/crm/Documents"));
const Customers = lazy(() => import("./pages/crm/Customers"));
const Company = lazy(() => import("./pages/crm/Company"));
const ObjectPipeline = lazy(() => import("./pages/crm/ObjectPipeline"));
const Site = lazy(() => import("./pages/crm/Site"));
const Team = lazy(() => import("./pages/crm/Team"));
const Profile = lazy(() => import("./pages/crm/Profile"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
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
            <Route path="/cabinet/objects/:id/contracts/new" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ContractEdit /></ProtectedRoute>} />
            <Route path="/cabinet/objects/:id/contracts/:contractId/edit" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ContractEdit /></ProtectedRoute>} />
            <Route path="/cabinet/documents" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Documents /></ProtectedRoute>} />
            <Route path="/cabinet/customers" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Customers /></ProtectedRoute>} />
            <Route path="/cabinet/services" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Services /></ProtectedRoute>} />
            <Route path="/cabinet/services/new" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><ServiceCreate /></ProtectedRoute>} />
            <Route path="/cabinet/company" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Company /></ProtectedRoute>} />
            <Route path="/cabinet/company/pipeline" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]} section="/cabinet/company"><ObjectPipeline /></ProtectedRoute>} />
            <Route path="/cabinet/site" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]} section="/cabinet/company"><Site /></ProtectedRoute>} />
            <Route path="/cabinet/team" element={<ProtectedRoute allowedRoles={["owner", "admin", "employee"]}><Team /></ProtectedRoute>} />
            <Route path="/cabinet/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;