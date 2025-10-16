import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ReturnPolicy from '@/pages/ReturnPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
import AdminImportProduct from '@/pages/admin/ImportProduct';
import AdminOrders from '@/pages/admin/Orders';
import AdminOrderDetail from '@/pages/admin/OrderDetail';
import AdminSettings from '@/pages/admin/Settings';
import PendingPaymentOrders from '@/pages/admin/PendingPaymentOrders';
import PaidOrders from '@/pages/admin/PaidOrders';
import ShippedOrders from '@/pages/admin/ShippedOrders';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fresh data
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <CartProvider>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/import-product" element={<ProtectedRoute><AdminImportProduct /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/orders/pending-payment" element={<ProtectedRoute><PendingPaymentOrders /></ProtectedRoute>} />
              <Route path="/admin/orders/paid" element={<ProtectedRoute><PaidOrders /></ProtectedRoute>} />
              <Route path="/admin/orders/shipped" element={<ProtectedRoute><ShippedOrders /></ProtectedRoute>} />
              <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetail /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              
              {/* Public Routes */}
              <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/return-policy" element={<ReturnPolicy />} />
                      <Route path="/shipping-policy" element={<ShippingPolicy />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </div>
              } />
            </Routes>
            <Toaster />
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
