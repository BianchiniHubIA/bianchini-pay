import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import DashboardLayout from "@/layouts/DashboardLayout";
import Overview from "@/pages/dashboard/Overview";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import Products from "@/pages/dashboard/Products";
import ProductConfig from "@/pages/dashboard/ProductConfig";
import Orders from "@/pages/dashboard/Orders";
import Customers from "@/pages/dashboard/Customers";
import Analytics from "@/pages/dashboard/Analytics";
import SettingsPage from "@/pages/dashboard/SettingsPage";

import CheckoutAnalytics from "@/pages/dashboard/CheckoutAnalytics";
import PublicCheckout from "@/pages/PublicCheckout";
import TeamPage from "@/pages/dashboard/TeamPage";
import FinanceiroPage from "@/pages/dashboard/FinanceiroPage";
import CouponsPage from "@/pages/dashboard/CouponsPage";
import LeadsPage from "@/pages/dashboard/LeadsPage";
import PaymentGatewaysPage from "@/pages/dashboard/PaymentGatewaysPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/checkout/:slug" element={<PublicCheckout />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="overview" element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:productId" element={<ProductConfig />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="leads" element={<LeadsPage />} />
              
              <Route path="checkout-analytics" element={<CheckoutAnalytics />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="financeiro" element={<FinanceiroPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="gateways" element={<PaymentGatewaysPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
