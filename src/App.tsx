import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import Home from '@/pages/Home';
import Cart from '@/pages/Cart';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ReturnPolicy from '@/pages/ReturnPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import NotFound from '@/pages/NotFound';
import SitemapXML from '@/pages/SitemapXML';
import SitemapProductsXML from '@/pages/SitemapProductsXML';

// Lazy load blog pages
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));

// Lazy load heavy pages
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminImportProduct = lazy(() => import('@/pages/admin/ImportProduct'));
const AdminPromotionalBanners = lazy(() => import('@/pages/admin/PromotionalBanners'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/OrderDetail'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const PendingPaymentOrders = lazy(() => import('@/pages/admin/PendingPaymentOrders'));
const PaidOrders = lazy(() => import('@/pages/admin/PaidOrders'));
const ShippedOrders = lazy(() => import('@/pages/admin/ShippedOrders'));
const MigrateImages = lazy(() => import('@/pages/admin/MigrateImages'));

// Blog admin pages
const AdminBlogPosts = lazy(() => import('@/pages/admin/BlogPosts'));
const AdminBlogPostEditor = lazy(() => import('@/pages/admin/BlogPostEditor'));
const AdminBlogCategories = lazy(() => import('@/pages/admin/BlogCategories'));
const AdminBlogTags = lazy(() => import('@/pages/admin/BlogTags'));

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
              <Route path="/admin/login" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <AdminLogin />
                </Suspense>
              } />
              <Route path="/admin/dashboard" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/categories" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminCategories /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/products" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminProducts /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/import-product" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminImportProduct /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/promotional-banners" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminPromotionalBanners /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminOrders /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders/pending-payment" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><PendingPaymentOrders /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders/paid" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><PaidOrders /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders/shipped" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><ShippedOrders /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders/:id" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminOrderDetail /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/settings" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminSettings /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/migrate-images" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><MigrateImages /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/blog" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminBlogPosts /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/blog/new" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/blog/edit/:id" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/blog-categories" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminBlogCategories /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/blog-tags" element={
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                  <ProtectedRoute><AdminBlogTags /></ProtectedRoute>
                </Suspense>
              } />
              
              {/* Public Routes */}
              <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <Products />
                        </Suspense>
                      } />
                      <Route path="/product/:id" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <ProductDetail />
                        </Suspense>
                      } />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <Checkout />
                        </Suspense>
                      } />
                      <Route path="/order-success/:orderId" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <OrderSuccess />
                        </Suspense>
                      } />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/return-policy" element={<ReturnPolicy />} />
                      <Route path="/shipping-policy" element={<ShippingPolicy />} />
                      <Route path="/blog" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <Blog />
                        </Suspense>
                      } />
                      <Route path="/blog/:slug" element={
                        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
                          <BlogPost />
                        </Suspense>
                      } />
                      <Route path="/sitemap.xml" element={<SitemapXML />} />
                      <Route path="/sitemap-products.xml" element={<SitemapProductsXML />} />
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
