import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { LanguageCurrencyProvider } from '@/contexts/LanguageCurrencyContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import '@/i18n';

// Lazy load Home page for better initial bundle
const Home = lazy(() => import('@/views/Home'));
import Cart from '@/views/Cart';
import About from '@/views/About';
import Contact from '@/views/Contact';
import FAQ from '@/views/FAQ';
import PrivacyPolicy from '@/views/PrivacyPolicy';
import TermsOfService from '@/views/TermsOfService';
import ReturnPolicy from '@/views/ReturnPolicy';
import ShippingPolicy from '@/views/ShippingPolicy';
import NotFound from '@/views/NotFound';
import SitemapXML from '@/views/SitemapXML';
import SitemapProductsXML from '@/views/SitemapProductsXML';
import SitemapPagesXML from '@/views/SitemapPagesXML';

// Lazy load category landing page
const CategoryLanding = lazy(() => import('@/views/CategoryLanding'));

// Lazy load blog pages
const Blog = lazy(() => import('@/views/Blog'));
const BlogPost = lazy(() => import('@/views/BlogPost'));

// Lazy load heavy pages
const Products = lazy(() => import('@/views/Products'));
const ProductDetail = lazy(() => import('@/views/ProductDetail'));
const Checkout = lazy(() => import('@/views/Checkout'));
const OrderSuccess = lazy(() => import('@/views/OrderSuccess'));

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/views/admin/Login'));
const AdminDashboard = lazy(() => import('@/views/admin/Dashboard'));
const AdminCategories = lazy(() => import('@/views/admin/Categories'));
const AdminProducts = lazy(() => import('@/views/admin/Products'));
const AdminImportProduct = lazy(() => import('@/views/admin/ImportProduct'));
const AdminPromotionalBanners = lazy(() => import('@/views/admin/PromotionalBanners'));
const AdminOrders = lazy(() => import('@/views/admin/Orders'));
const AdminOrderDetail = lazy(() => import('@/views/admin/OrderDetail'));
const AdminSettings = lazy(() => import('@/views/admin/Settings'));
const PendingPaymentOrders = lazy(() => import('@/views/admin/PendingPaymentOrders'));
const PaidOrders = lazy(() => import('@/views/admin/PaidOrders'));
const ShippedOrders = lazy(() => import('@/views/admin/ShippedOrders'));
const MigrateImages = lazy(() => import('@/views/admin/MigrateImages'));

// Blog admin pages
const AdminBlogPosts = lazy(() => import('@/views/admin/BlogPosts'));
const AdminBlogPostEditor = lazy(() => import('@/views/admin/BlogPostEditor'));
const AdminBlogCategories = lazy(() => import('@/views/admin/BlogCategories'));
const AdminBlogTags = lazy(() => import('@/views/admin/BlogTags'));

// Invoice pages
const AdminInvoices = lazy(() => import('@/views/admin/Invoices'));
const ViewInvoice = lazy(() => import('@/views/ViewInvoice'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

/**
 * Public layout wrapper with Header, Footer, WhatsApp
 */
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

/**
 * All public routes — used under /:lang/ prefix
 */
const PublicRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={
        <Suspense fallback={<LoadingSpinner />}><Home /></Suspense>
      } />
      <Route path="products" element={
        <Suspense fallback={<LoadingSpinner />}><Products /></Suspense>
      } />
      <Route path="product/:id" element={
        <Suspense fallback={<LoadingSpinner />}><ProductDetail /></Suspense>
      } />
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={
        <Suspense fallback={<LoadingSpinner />}><Checkout /></Suspense>
      } />
      <Route path="order-success/:orderId" element={
        <Suspense fallback={<LoadingSpinner />}><OrderSuccess /></Suspense>
      } />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="terms-of-service" element={<TermsOfService />} />
      <Route path="return-policy" element={<ReturnPolicy />} />
      <Route path="shipping-policy" element={<ShippingPolicy />} />
      <Route path="blog" element={
        <Suspense fallback={<LoadingSpinner />}><Blog /></Suspense>
      } />
      <Route path="blog/:slug" element={
        <Suspense fallback={<LoadingSpinner />}><BlogPost /></Suspense>
      } />
      <Route path="category/:slug" element={
        <Suspense fallback={<LoadingSpinner />}><CategoryLanding /></Suspense>
      } />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

/** Language-aware route wrapper */
const LanguageRoutes = () => (
  <LanguageCurrencyProvider>
    <PublicRoutes />
  </LanguageCurrencyProvider>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <CartProvider>
            <Routes>
              {/* Admin Routes — no language prefix */}
              <Route path="/admin/login" element={<Suspense fallback={<LoadingSpinner />}><AdminLogin /></Suspense>} />
              <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminDashboard /></ProtectedRoute></Suspense>} />
              <Route path="/admin/categories" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminCategories /></ProtectedRoute></Suspense>} />
              <Route path="/admin/products" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminProducts /></ProtectedRoute></Suspense>} />
              <Route path="/admin/import-product" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminImportProduct /></ProtectedRoute></Suspense>} />
              <Route path="/admin/promotional-banners" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminPromotionalBanners /></ProtectedRoute></Suspense>} />
              <Route path="/admin/orders" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminOrders /></ProtectedRoute></Suspense>} />
              <Route path="/admin/orders/pending-payment" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><PendingPaymentOrders /></ProtectedRoute></Suspense>} />
              <Route path="/admin/orders/paid" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><PaidOrders /></ProtectedRoute></Suspense>} />
              <Route path="/admin/orders/shipped" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><ShippedOrders /></ProtectedRoute></Suspense>} />
              <Route path="/admin/orders/:id" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminOrderDetail /></ProtectedRoute></Suspense>} />
              <Route path="/admin/settings" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminSettings /></ProtectedRoute></Suspense>} />
              <Route path="/admin/migrate-images" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><MigrateImages /></ProtectedRoute></Suspense>} />
              <Route path="/admin/blog" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminBlogPosts /></ProtectedRoute></Suspense>} />
              <Route path="/admin/blog/new" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute></Suspense>} />
              <Route path="/admin/blog/edit/:id" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminBlogPostEditor /></ProtectedRoute></Suspense>} />
              <Route path="/admin/blog-categories" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminBlogCategories /></ProtectedRoute></Suspense>} />
              <Route path="/admin/blog-tags" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminBlogTags /></ProtectedRoute></Suspense>} />
              <Route path="/admin/invoices" element={<Suspense fallback={<LoadingSpinner />}><ProtectedRoute><AdminInvoices /></ProtectedRoute></Suspense>} />
              
              {/* Public Invoice View Route */}
              <Route path="/invoice/:accessCode" element={<Suspense fallback={<LoadingSpinner />}><ViewInvoice /></Suspense>} />

              {/* Sitemap routes — no language prefix */}
              <Route path="/sitemap.xml" element={<SitemapXML />} />
              <Route path="/sitemap-products.xml" element={<SitemapProductsXML />} />
              <Route path="/sitemap-pages.xml" element={<SitemapPagesXML />} />
              
              {/* Language-prefixed public routes */}
              <Route path="/ar/*" element={<LanguageRoutes />} />
              <Route path="/en/*" element={<LanguageRoutes />} />

              {/* Root redirect to default language */}
              <Route path="/" element={<Navigate to="/ar" replace />} />

              {/* Legacy routes without language prefix — redirect to Arabic */}
              <Route path="/products" element={<Navigate to="/ar/products" replace />} />
              <Route path="/product/:id" element={<LegacyProductRedirect />} />
              <Route path="/cart" element={<Navigate to="/ar/cart" replace />} />
              <Route path="/checkout" element={<Navigate to="/ar/checkout" replace />} />
              <Route path="/about" element={<Navigate to="/ar/about" replace />} />
              <Route path="/contact" element={<Navigate to="/ar/contact" replace />} />
              <Route path="/faq" element={<Navigate to="/ar/faq" replace />} />
              <Route path="/privacy-policy" element={<Navigate to="/ar/privacy-policy" replace />} />
              <Route path="/terms-of-service" element={<Navigate to="/ar/terms-of-service" replace />} />
              <Route path="/return-policy" element={<Navigate to="/ar/return-policy" replace />} />
              <Route path="/shipping-policy" element={<Navigate to="/ar/shipping-policy" replace />} />
              <Route path="/blog" element={<Navigate to="/ar/blog" replace />} />
              <Route path="/blog/:slug" element={<LegacyBlogRedirect />} />
              <Route path="/category/:slug" element={<LegacyCategoryRedirect />} />
              <Route path="/order-success/:orderId" element={<LegacyOrderRedirect />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/ar" replace />} />
            </Routes>
            <Toaster />
          </CartProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/* Legacy redirect helpers for backward compatibility */
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/ar/product/${id}`} replace />;
}
function LegacyBlogRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/ar/blog/${slug}`} replace />;
}
function LegacyCategoryRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/ar/category/${slug}`} replace />;
}
function LegacyOrderRedirect() {
  const { orderId } = useParams();
  return <Navigate to={`/ar/order-success/${orderId}`} replace />;
}

export default App;
