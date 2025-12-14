import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, Zap } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import ProductRating from '@/components/product/ProductRating';
import TrustBadges from '@/components/product/TrustBadges';
import SocialShare from '@/components/product/SocialShare';
import { SEOHead } from '@/components/SEO/SEOHead';
import { ProductSchema } from '@/components/SEO/ProductSchema';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { FAQSchema } from '@/components/SEO/FAQSchema';
import { RelatedProducts } from '@/components/RelatedProducts';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductTabs } from '@/components/product/ProductTabs';
import { ReviewForm } from '@/components/product/ReviewForm';
import { ReviewsList } from '@/components/product/ReviewsList';
import { ReviewSchema } from '@/components/SEO/ReviewSchema';
import { getCareType } from '@/utils/categoryHelpers';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      let query;
      
      // التحقق إذا كان id هو UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
      
      if (isUUID) {
        // جلب بواسطة UUID (للروابط القديمة)
        query = supabase
          .from('products')
          .select('*')
          .eq('id', id);
      } else {
        // جلب بواسطة Slug (الروابط الجديدة)
        query = supabase
          .from('products')
          .select('*')
          .eq('slug', id);
      }
      
      const { data: productData, error: productError } = await query.maybeSingle();
      
      if (productError) throw productError;
      if (!productData) throw new Error('المنتج غير موجود');

      // جلب الصور المرتبطة
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)
        .order('display_order', { ascending: true });

      // جلب التقييمات
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      // جلب إحصائيات التقييم
      const { data: ratingStats } = await supabase.rpc('get_product_rating', {
        product_uuid: productData.id,
      });

      return {
        ...productData,
        images: images || [],
        reviews: reviews || [],
        ratingStats: ratingStats?.[0] || null,
      };
    },
  });

  // إعادة توجيه من UUID إلى Slug
  useEffect(() => {
    if (product && product.slug && id !== product.slug) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [product, id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast({
        title: 'غير متوفر',
        description: 'هذا المنتج غير متوفر حالياً',
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name_ar: product.name_ar,
        price: product.price,
        image_url: product.image_url,
      });
    }

    toast({
      title: 'تمت الإضافة',
      description: `تم إضافة ${quantity}x ${product.name_ar} إلى السلة`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast({
        title: 'غير متوفر',
        description: 'هذا المنتج غير متوفر حالياً',
        variant: 'destructive',
      });
      return;
    }

    // Add to cart first
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name_ar: product.name_ar,
        price: product.price,
        image_url: product.image_url,
      });
    }

    // Navigate to checkout
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">المنتج غير موجود</h2>
          <Button onClick={() => navigate('/products')}>
            العودة للمنتجات
          </Button>
        </div>
      </div>
    );
  }

  const productUrl = `/product/${product.slug || product.id}`;
  const isInStock = product.stock_quantity > 0;
  
  // جمع كل الصور للـ Schema
  const allImages = product.images.length > 0 
    ? product.images.map(img => img.image_url) 
    : product.image_url ? [product.image_url] : [];
  
  // FAQs المتعلقة بالمنتج
  const productFAQs = [
    {
      question: `كيف أستخدم ${product.name_ar}؟`,
      answer: product.how_to_use_ar || `للحصول على أفضل النتائج من ${product.name_ar}، يُنصح باتباع التعليمات الموجودة على العبوة. منتجاتنا مصممة لتكون سهلة الاستخدام ومناسبة للاستخدام اليومي.`,
    },
    {
      question: 'هل المنتج مناسب لجميع أنواع البشرة/الشعر؟',
      answer: 'جميع منتجات لمسة بيوتي مصنوعة من مكونات طبيعية 100% وآمنة للاستخدام. ومع ذلك، ننصح بإجراء اختبار حساسية بسيط قبل الاستخدام الكامل.',
    },
    {
      question: 'كم يستغرق الشحن؟',
      answer: 'نوفر شحن مجاني لجميع أنحاء المملكة العربية السعودية. عادةً ما يستغرق التوصيل من 3 إلى 5 أيام عمل.',
    },
    {
      question: 'هل يمكنني إرجاع المنتج؟',
      answer: 'نعم، نقدم سياسة إرجاع مرنة لمدة 14 يومًا. يمكنك إرجاع المنتج إذا لم يكن مناسبًا لك، بشرط أن يكون في حالته الأصلية.',
    },
    {
      question: `ما هي مكونات ${product.name_ar}؟`,
      answer: product.ingredients_ar || 'جميع منتجاتنا مصنوعة من مكونات طبيعية عالية الجودة ومختارة بعناية لتوفير أفضل النتائج للعناية بالبشرة والشعر.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8" itemScope itemType="https://schema.org/Product">
      <SEOHead
        title={
          product.seo_title 
            ? product.seo_title.length > 60 
              ? `${product.name_ar} | لمسة بيوتي` 
              : product.seo_title
            : `${product.name_ar} | لمسة بيوتي`
        }
        description={product.seo_description || product.description_ar || `اكتشف ${product.name_ar} من لمسة بيوتي - منتج طبيعي 100% للعناية ${getCareType(product.category)} - شحن مجاني في السعودية`}
        keywords={product.seo_keywords || `${product.name_ar}, ${product.category}, منتجات طبيعية, لمسة بيوتي, عناية طبيعية, منتجات عضوية السعودية, ${product.made_in || ''}`}
        image={allImages[0] || product.image_url || undefined}
        type="product"
        url={`https://lamsetbeauty.com${productUrl}`}
        price={Number(product.price)}
        currency="SAR"
        availability={isInStock ? 'instock' : 'outofstock'}
        publishedTime={product.created_at}
        modifiedTime={product.updated_at}
      />
      <ProductSchema
        name={product.name_ar}
        description={product.description_ar || product.seo_description || `${product.name_ar} - منتج طبيعي 100% من لمسة بيوتي`}
        image={product.image_url || ''}
        images={allImages}
        price={Number(product.price)}
        currency="SAR"
        sku={product.id}
        availability={isInStock ? 'InStock' : 'OutOfStock'}
        category={product.category_ar || product.category}
        brand="لمسة بيوتي"
        gtin={product.gtin}
        mpn={product.mpn}
        slug={product.slug}
        madeIn={product.made_in}
        shippingDays={3}
        returnDays={14}
        createdAt={product.created_at}
        updatedAt={product.updated_at}
        aggregateRating={product.ratingStats}
        originalPrice={product.original_price ? Number(product.original_price) : undefined}
        discountPercentage={product.discount_percentage ? Number(product.discount_percentage) : undefined}
        videoUrl={product.video_url || undefined}
      />
      <ReviewSchema 
        productName={product.name_ar}
        reviews={product.reviews?.map((r: any) => ({
          author: r.customer_name,
          rating: r.rating,
          reviewBody: r.review_text || '',
          datePublished: r.created_at
        })) || []}
      />
      <FAQSchema faqs={product.faqs || productFAQs} />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'المنتجات', url: '/products' },
          { name: product.category_ar || product.category, url: `/products?category=${product.category}` },
          { name: product.name_ar, url: productUrl },
        ]}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">المنتجات</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name_ar}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid md:grid-cols-2 gap-12">
        <ProductImageGallery 
          images={product.images.length > 0 ? product.images : [{ image_url: product.image_url }]}
          productName={product.name_ar}
        />

        <div className="space-y-8">
          <div className="space-y-4">
            {/* Category Badge */}
            <Badge variant="secondary" className="text-sm bg-gradient-primary text-white hover:opacity-90 transition-opacity px-4 py-1.5">
              {product.category_ar || product.category}
            </Badge>
            
            {/* Product Name */}
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent leading-tight" itemProp="name">
              {product.name_ar}
            </h1>
            
            {/* Rating */}
            {product.ratingStats && product.ratingStats.review_count > 0 && (
              <div className="flex items-center gap-2">
                <ProductRating 
                  rating={product.ratingStats.average_rating} 
                  reviewCount={product.ratingStats.review_count}
                  size="lg"
                />
              </div>
            )}
            
            {/* SKU */}
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium">رمز المنتج:</span>
              <span className="font-mono bg-muted px-3 py-1 rounded-md">{product.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* Price Card */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 shadow-soft">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {product.price.toFixed(2)}
              </span>
              <span className="text-2xl text-muted-foreground font-medium">ريال</span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="flex items-center gap-3">
                <span className="text-lg text-muted-foreground line-through">
                  {product.original_price.toFixed(2)} ريال
                </span>
                <Badge variant="destructive" className="text-sm font-bold">
                  خصم {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-card rounded-xl border shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground mb-4">اختر الكمية</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock_quantity <= 0}
                    className="h-12 w-12 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="font-bold text-2xl w-16 text-center">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity <= 0}
                    className="h-12 w-12 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      متوفر ({product.stock_quantity})
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      غير متوفر
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                variant="outline"
                className="w-full h-14 text-lg font-semibold rounded-xl border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
                disabled={product.stock_quantity <= 0}
              >
                <ShoppingCart className="ml-2 h-6 w-6" />
                أضف إلى السلة
              </Button>
              
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-soft hover:shadow-card"
                disabled={product.stock_quantity <= 0}
              >
                <Zap className="ml-2 h-6 w-6" />
                اشتر الآن
              </Button>
              
              {/* Share Button */}
              <SocialShare 
                productName={product.name_ar}
              />
            </div>
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Product Details Tabs */}
      <ProductTabs
        description={product.description_ar}
        long_description_ar={product.long_description_ar}
        ingredients={product.ingredients_ar}
        howToUse={product.how_to_use_ar}
        benefits={product.benefits_ar}
        warnings={product.warnings_ar}
        sizeInfo={product.size_info}
        madeIn={product.made_in}
        key_features={product.key_features}
        why_choose={product.why_choose}
        faqs={product.faqs}
      />

      {/* SEO-rich content section */}
      {!product.long_description_ar && product.description_ar && (
        <section className="mt-8 prose prose-lg max-w-none" itemProp="description">
          <h2 className="text-2xl font-bold text-primary mb-4">عن {product.name_ar}</h2>
          <div className="text-muted-foreground leading-relaxed">
            <p className="whitespace-pre-line">{product.description_ar}</p>
            
            {product.category_ar && (
              <p className="mt-4">
                يعد {product.name_ar} من أفضل منتجات {product.category_ar} الطبيعية المتوفرة في المملكة العربية السعودية. 
                صُمم خصيصاً لتلبية احتياجات العناية {getCareType(product.category)} 
                بأعلى معايير الجودة.
              </p>
            )}
            
            {product.made_in && (
              <p className="mt-3">
                <strong>المنشأ:</strong> منتج أصلي من {product.made_in}، يتميز بجودة عالية ومكونات طبيعية 100%.
              </p>
            )}
            
            <p className="mt-3">
              <strong>الشحن:</strong> نوفر شحن مجاني سريع لجميع مناطق المملكة العربية السعودية مع ضمان التوصيل خلال 3-5 أيام عمل.
            </p>
            
            <p className="mt-3">
              <strong>سياسة الإرجاع:</strong> نقدم سياسة إرجاع مرنة لمدة 14 يومًا لضمان رضاك التام عن المنتج.
            </p>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <div className="mt-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">التقييمات والمراجعات</h2>
          <p className="text-muted-foreground text-lg">شاركنا تجربتك مع المنتج</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <ReviewsList productId={product.id} />
          <ReviewForm productId={product.id} />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentProductId={product.id} category={product.category} />
    </div>
  );
}
