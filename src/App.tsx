
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./context/LanguageContext";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import OrdersPage from "./pages/OrdersPage";
import EstimatesPage from "./pages/EstimatesPage";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import Overview from "./pages/admin/Overview";
import AddProductForm from "./pages/admin/AddProductForm";
import EditProductForm from "./pages/admin/EditProductForm";
import OrdersManagement from "./pages/admin/OrdersManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NewsletterBuilder from "./pages/admin/NewsletterBuilder";
import HeroManagement from "./pages/admin/HeroManagement";
import PartnersManagement from "./pages/admin/PartnersManagement";
import EstimatesManagement from "./pages/admin/EstimatesManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Header />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/category/:id" element={<CategoryPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  
                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/estimates" element={<EstimatesPage />} />
                  </Route>
                  
                  {/* Protected Admin Routes */}
                  <Route element={<ProtectedRoute requireAdmin />}>
                    <Route path="/admin" element={<AdminDashboard />}>
                      <Route index element={<Overview />} />
                      <Route path="products" element={<ProductsManagement />} />
                      <Route path="products/new" element={<AddProductForm />} />
                      <Route path="products/edit/:id" element={<EditProductForm />} />
                      <Route path="orders" element={<OrdersManagement />} />
                      <Route path="categories" element={<CategoriesManagement />} />
                      <Route path="users" element={<UsersManagement />} />
                      <Route path="newsletter" element={<NewsletterBuilder />} />
                      <Route path="hero" element={<HeroManagement />} />
                      <Route path="partners" element={<PartnersManagement />} />
                      <Route path="estimates" element={<EstimatesManagement />} />
                    </Route>
                  </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </BrowserRouter>
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
