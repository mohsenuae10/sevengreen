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

      return {
        ...productData,
        images: images || []
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
      answer: 'جميع منتجات سفن جرين مصنوعة من مكونات طبيعية 100% وآمنة للاستخدام. ومع ذلك، ننصح بإجراء اختبار حساسية بسيط قبل الاستخدام الكامل.',
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
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title={product.seo_title || product.name_ar}
        description={product.seo_description || product.description_ar || `اكتشف ${product.name_ar} من سفن جرين - منتج طبيعي 100% للعناية ${product.category === 'العناية بالشعر' ? 'بالشعر' : product.category === 'العناية بالبشرة' ? 'بالبشرة' : ''} - شحن مجاني في السعودية`}
        keywords={product.seo_keywords || `${product.name_ar}, ${product.category}, منتجات طبيعية, سفن جرين, عناية طبيعية, منتجات عضوية السعودية, ${product.made_in || ''}`}
        image={allImages[0] || product.image_url || undefined}
        type="product"
        url={`https://sevengreenstore.com${productUrl}`}
        price={Number(product.price)}
        currency="SAR"
        availability={isInStock ? 'instock' : 'outofstock'}
        publishedTime={product.created_at}
        modifiedTime={product.updated_at}
      />
      <ProductSchema
        name={product.name_ar}
        description={product.description_ar || product.seo_description || `${product.name_ar} - منتج طبيعي 100% من سفن جرين`}
        image={product.image_url || ''}
        images={allImages}
        price={Number(product.price)}
        currency="SAR"
        sku={product.id}
        availability={isInStock ? 'InStock' : 'OutOfStock'}
        category={product.category}
        slug={product.slug}
        madeIn={product.made_in}
        shippingDays={3}
        returnDays={14}
        createdAt={product.created_at}
        updatedAt={product.updated_at}
      />
      <FAQSchema faqs={productFAQs} />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'المنتجات', url: '/products' },
          { name: product.category, url: `/products?category=${product.category}` },
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

      <div className="grid md:grid-cols-2 gap-8">
        <ProductImageGallery 
          images={product.images.length > 0 ? product.images : [{ image_url: product.image_url }]}
          productName={product.name_ar}
        />

        <div className="space-y-6">
          <div className="space-y-3">
            {/* Category Badge */}
            <Badge variant="secondary" className="text-sm">
              {product.category}
            </Badge>
            
            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold" itemProp="name">
              {product.name_ar}
            </h1>
            
            {/* Rating - محذوف لأنه كان يستخدم أرقام مزيفة */}
            
            {/* SKU */}
            <p className="text-sm text-muted-foreground">
              رمز المنتج: {product.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              {product.price.toFixed(2)}
            </span>
            <span className="text-xl text-muted-foreground">ريال</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">الكمية</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock_quantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {product.stock_quantity > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    متوفر: {product.stock_quantity}
                  </p>
                ) : (
                  <p className="text-sm text-destructive font-medium">
                    غير متوفر
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  disabled={product.stock_quantity <= 0}
                >
                  <ShoppingCart className="ml-2 h-5 w-5" />
                  أضف إلى السلة
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="flex-1"
                  disabled={product.stock_quantity <= 0}
                >
                  <img 
                    src="/images/payment-icons/apple-pay.svg" 
                    alt="Apple Pay" 
                    className="ml-2 h-6 w-auto"
                  />
                  اشتر الآن
                </Button>
              </div>
              
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
        ingredients={product.ingredients_ar}
        howToUse={product.how_to_use_ar}
        benefits={product.benefits_ar}
        warnings={product.warnings_ar}
        sizeInfo={product.size_info}
        madeIn={product.made_in}
      />

      {/* Related Products */}
      <RelatedProducts currentProductId={product.id} category={product.category} />
    </div>
  );
}
