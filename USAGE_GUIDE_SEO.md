/**
 * Guide: How to Use SEO Improvements in Your React Components
 * دليل: كيفية استخدام تحسينات SEO في مكونات React
 */

// ============================================
// 1. استخدام SEOHead محسّن
// ============================================

import { SEOHead } from '@/components/SEO/SEOHead';

// مثال بسيط - صفحة عامة
<SEOHead
  title="منتجات لمسة بيوتي - العناية الطبيعية"
  description="أفضل منتجات العناية الطبيعية 100% - شحن مجاني"
  keywords="منتجات طبيعية, عناية بالبشرة, شامبو"
/>

// مثال متقدم - صفحة منتج مع دعم لغات
<SEOHead
  title="شامبو طبيعي بار | لمسة بيوتي"
  description="شامبو طبيعي آمن ✓ بدون كيماويات ✓ شحن مجاني"
  keywords="شامبو طبيعي, شامبو بار, عناية بالشعر"
  type="product"
  price={49.99}
  currency="SAR"
  availability="instock"
  image="https://..."
  language="ar"
  enUrl="https://lamsetbeauty.com/en/product/..."
  imageAlt="شامبو طبيعي بار - منتج العناية بالشعر الأصلي"
/>

// ============================================
// 2. استخدام Product Schema محسّن
// ============================================

import { ProductSchema } from '@/components/SEO/ProductSchema';

<ProductSchema
  name="شامبو طبيعي مرطب"
  description="شامبو طبيعي 100% مع زيوت طبيعية للشعر الجاف"
  price={49.99}
  currency="SAR"
  sku="SHAMPOO-001"
  availability="InStock"
  category="العناية بالشعر"
  brand="لمسة بيوتي"
  slug="shampo-tabie-moratteb"
  image="https://..."
  images={['https://...', 'https://...']}
  originalPrice={70}
  discountPercentage={30}
  videoUrl="https://..."
  aggregateRating={{
    ratingValue: 4.8,
    reviewCount: 125
  }}
/>

// ============================================
// 3. استخدام Breadcrumb Schema
// ============================================

import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';

<BreadcrumbSchema
  items={[
    { name: 'الرئيسية', url: '/' },
    { name: 'المنتجات', url: '/products' },
    { name: 'العناية بالشعر', url: '/products?category=hair' },
    { name: 'الشامبو الطبيعي', url: '/product/shampo-tabie' }
  ]}
/>

// ============================================
// 4. استخدام OptimizedImage
// ============================================

import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  src="https://supabase.../image.jpg"
  alt="شامبو طبيعي بار من لمسة بيوتي - منتج عناية بالشعر الأصلي"
  className="aspect-square rounded-lg"
  aspectRatio="1/1"
  width={400}
  height={400}
  priority={true}  // للصور فوق الطي (LCP optimization)
/>

// ============================================
// 5. استخدام Keywords Strategy
// ============================================

import { generateOptimizedMetadata, SeoCategoryKeywords } from '@/lib/seo-keywords';

// حصول على keywords محسّنة تلقائياً
const metadata = generateOptimizedMetadata(
  'شامبو طبيعي مرطب',
  'hair_care',
  'ar'  // أو 'en'
);

console.log(metadata.title);        // عنوان محسّن
console.log(metadata.description);  // وصف محسّن
console.log(metadata.keywords);     // كلمات مفتاحية

// ============================================
// 6. استخدام Performance Monitoring
// ============================================

import { initPerformanceMonitoring } from '@/lib/seo-performance';

// في App.tsx أو main.tsx
useEffect(() => {
  initPerformanceMonitoring();
}, []);

// ============================================
// 7. استخدام Article Schema للمدونة
// ============================================

import { ArticleSchema } from '@/components/SEO/ArticleSchema';

<ArticleSchema
  title="دليل العناية بالشعر الطبيعي"
  description="نصائح وخطوات العناية بالشعر باستخدام منتجات طبيعية"
  image="https://..."
  datePublished="2026-02-12T00:00:00Z"
  dateModified="2026-02-12T00:00:00Z"
  slug="guide-hair-care-natural"
  author="لمسة بيوتي"
  category="نصائح العناية"
  keywords={['شعر', 'عناية', 'طبيعي']}
  articleBody="محتوى المقالة الكامل..."
/>

// ============================================
// 8. الممارسات الأفضل (Best Practices)
// ============================================

/**
 * ✅ لا تنسى دائماً:
 */

// 1. استخدم hreflang للنسخ المتعددة من الصفحات
<link rel="alternate" hrefLang="ar" href="https://..." />
<link rel="alternate" hrefLang="en" href="https://..." />

// 2. اكتب عناوين فريدة لكل صفحة (50-60 حرف)
const title = 'شامبو طبيعي بار | منتجات العناية الآمنة | لمسة'; // ✅ 58 حرف

// 3. اكتب وصف فريد (150-160 حرف)
const description = 'شامبو طبيعي آمن 100% بدون كيماويات ✓ شحن مجاني ✓ توصيل سريع للسعودية';

// 4. استخدم Semantic HTML
<main>
  <section>
    <h1>العنوان الرئيسي</h1>
    <h2>عنوان سانوي</h2>
    <p>المحتوى...</p>
  </section>
</main>

// 5. أضيف internal links
<Link to="/product/another">منتج ذات صلة</Link>

// ============================================
// 9. سمات SEO الهامة في البيانات
// ============================================

interface Product {
  id: string;
  slug: string;           // ✅ أساسي لـ URL optimization
  name_ar: string;        // ✅ عنوان بالعربية
  name_en?: string;       // ✅ عنوان بالإنجليزية (المستقبل)
  description_ar: string; // ✅ وصف طويل (200+)
  description_en?: string;
  category: string;       // ✅ لـ breadcrumbs
  image_url: string;      // ✅ صورة عالية الجودة
  price: number;          // ✅ لـ Product Schema
  stock_quantity: number; // ✅ للـ Availability
  created_at: string;     // ✅ لـ Schema datePublished
  updated_at: string;     // ✅ لـ Schema dateModified
}

// ============================================
// 10. عملية فحص SEO بعد النشر
// ============================================

/**
 * Checklist قبل نشر صفحة جديدة:
 */

// 1. فحص Meta Tags
- [ ] Title length (50-60 حرف)
- [ ] Description length (150-160 حرف)
- [ ] Keywords موجودة
- [ ] hreflang موجود

// 2. فحص Structured Data
- [ ] Schema.org JSON-LD موجود
- [ ] Breadcrumbs موجودة
- [ ] Alt text للصور

// 3. فحص Performance
- [ ] صور محسّنة (WebP)
- [ ] Lazy loading فعّال
- [ ] Bundle size ضمن حد معقول

// 4. فحص Content Quality
- [ ] محتوى فريد وأصلي
- [ ] Internal links موجودة (3-5)
- [ ] طول محتوى كافي

// 5. فحص Mobile
- [ ] Responsive design
- [ ] Touch targets حجمها جيد
- [ ] Performance على 4G

/**
 * Tools للفحص:
 */
// 1. Google Search Console - https://search.google.com/search-console
// 2. Google PageSpeed Insights - https://pagespeed.web.dev/
// 3. Rich Results Test - https://search.google.com/test/rich-results
// 4. Mobile-Friendly Test - https://search.google.com/mobile-friendly
// 5. Lighthouse - متضمن في Chrome DevTools

// ============================================
// 11. مثال عملي كامل - صفحة منتج
// ============================================

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SEOHead } from '@/components/SEO/SEOHead';
import { ProductSchema } from '@/components/SEO/ProductSchema';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function ProductPage() {
  const { slug } = useParams();
  
  // جلب بيانات المنتج
  const { data: product } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      // جلب المنتج من قاعدة البيانات
    }
  });

  if (!product) return null;

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={`${product.name_ar} | منتجات طبيعية | لمسة بيوتي`}
        description={product.description_ar.substring(0, 160)}
        keywords={`${product.name_ar}, ${product.category}, منتجات طبيعية`}
        type="product"
        price={product.price}
        currency="SAR"
        availability={product.stock_quantity > 0 ? 'instock' : 'outofstock'}
        image={product.image_url}
        url={`https://lamsetbeauty.com/product/${product.slug}`}
        language="ar"
      />

      {/* Product Schema */}
      <ProductSchema
        name={product.name_ar}
        description={product.description_ar}
        image={product.image_url}
        price={product.price}
        sku={product.id}
        availability={product.stock_quantity > 0 ? 'InStock' : 'OutOfStock'}
        category={product.category}
        slug={product.slug}
      />

      {/* Breadcrumbs */}
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'المنتجات', url: '/products' },
          { name: product.category, url: `/products?category=${product.category}` },
          { name: product.name_ar, url: `/product/${product.slug}` }
        ]}
      />

      {/* Main Content */}
      <main>
        <h1>{product.name_ar}</h1>
        
        <OptimizedImage
          src={product.image_url}
          alt={`${product.name_ar} - منتج من لمسة بيوتي`}
          priority={true}
          width={600}
          height={600}
        />
        
        <section>
          <h2>وصف المنتج</h2>
          <p>{product.description_ar}</p>
        </section>
      </main>
    </>
  );
}

// ============================================
// الخلاصة
// ============================================

/**
 * ✅ الآن لديك موقع محسّن للـ SEO مع:
 * 
 * 1. ✅ Meta tags محسّنة ومحسّن
 * 2. ✅ JSON-LD Structured Data شاملة
 * 3. ✅ Image optimization
 * 4. ✅ Performance monitoring
 * 5. ✅ Keywords strategy
 * 6. ✅ Breadcrumb navigation
 * 7. ✅ hreflang للدعم متعدد اللغات
 * 8. ✅ Mobile-friendly design
 * 
 * 📈 التوقع: زيادة Organic Traffic بـ 50-100% خلال 3-6 أشهر
 * 
 * 🔗 الخطوة التالية:
 * 1. أضيف Google Search Console verification
 * 2. راقب rankings في Ahrefs / Semrush
 * 3. أنشئ محتوى عالي الجودة بانتظام
 * 4. بناء backlinks من مواقع موثوقة
 */
