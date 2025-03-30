
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Header from "./components/layout/Header";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import Overview from "./pages/admin/Overview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Profile />} />
                </Route>
                
                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/admin" element={<AdminDashboard />}>
                    <Route index element={<Overview />} />
                    <Route path="products" element={<ProductsManagement />} />
                    <Route path="products/new" element={<div>Add Product Form (To Be Implemented)</div>} />
                    <Route path="products/edit/:id" element={<div>Edit Product Form (To Be Implemented)</div>} />
                    <Route path="orders" element={<div>Orders Management (To Be Implemented)</div>} />
                    <Route path="categories" element={<div>Categories Management (To Be Implemented)</div>} />
                    <Route path="users" element={<div>Users Management (To Be Implemented)</div>} />
                  </Route>
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
