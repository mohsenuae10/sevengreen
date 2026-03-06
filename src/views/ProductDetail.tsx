import { useParams, useNavigate } from '@/hooks/useNextRouter';
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
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ProductDetail() {
  const { slug: id } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { t, language, getLocalizedField, getLocalizedPath, formatPrice, formatPriceRaw, isRTL } = useLanguageCurrency();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      let query;
      
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
      
      if (isUUID) {
        query = supabase
          .from('products')
          .select('*')
          .eq('id', id);
      } else {
        query = supabase
          .from('products')
          .select('*')
          .eq('slug', id);
      }
      
      const { data: productData, error: productError } = await query.maybeSingle();
      
      if (productError) throw productError;
      if (!productData) throw new Error('Product not found');

      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)
        .order('display_order', { ascending: true });

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

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

  useEffect(() => {
    if (product && product.slug && id !== product.slug) {
      navigate(getLocalizedPath(`/product/${product.slug}`), { replace: true });
    }
  }, [product, id, navigate, getLocalizedPath]);

  const productName = product ? getLocalizedField(product, 'name') : '';
  const productCategory = product ? (getLocalizedField(product, 'category') || product.category) : '';
  const productDescription = product ? getLocalizedField(product, 'description') : '';

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast({
        title: t('common.unavailable'),
        description: t('common.unavailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name_ar: product.name_ar,
        name_en: product.name_en,
        price: product.price,
        image_url: product.image_url,
      });
    }

    toast({
      title: t('common.added'),
      description: t('product.addedToCartDesc', { quantity, name: productName }),
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast({
        title: t('common.unavailable'),
        description: t('common.unavailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name_ar: product.name_ar,
        name_en: product.name_en,
        price: product.price,
        image_url: product.image_url,
      });
    }

    navigate(getLocalizedPath('/checkout'));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">{t('product.notFound')}</h2>
          <Button onClick={() => navigate(getLocalizedPath('/products'))}>
            {t('product.backToProducts')}
          </Button>
        </div>
      </div>
    );
  }

  const productUrl = getLocalizedPath(`/product/${product.slug || product.id}`);
  const isInStock = product.stock_quantity > 0;
  
  const allImages = product.images?.length > 0 
    ? product.images.map(img => img.image_url) 
    : product.image_url ? [product.image_url] : [];

  const { amount: priceAmount, symbol: priceSymbol } = formatPriceRaw(product.price);
  
  const productFAQs = [
    {
      question: t('productDetail.faqHowToUseQ', { name: productName }),
      answer: getLocalizedField(product, 'how_to_use') || t('productDetail.faqHowToUseA', { name: productName }),
    },
    {
      question: t('productDetail.faqSuitableQ'),
      answer: t('productDetail.faqSuitableA'),
    },
    {
      question: t('productDetail.faqShippingQ'),
      answer: t('productDetail.faqShippingA'),
    },
    {
      question: t('productDetail.faqReturnQ'),
      answer: t('productDetail.faqReturnA'),
    },
    {
      question: t('productDetail.faqIngredientsQ', { name: productName }),
      answer: getLocalizedField(product, 'ingredients') || t('productDetail.faqIngredientsA'),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8" itemScope itemType="https://schema.org/Product">
      <SEOHead
        title={
          product.seo_title 
            ? product.seo_title.length > 60 
              ? `${productName} | ${t('common.storeName')}` 
              : product.seo_title
            : `${productName} | ${t('common.storeName')}`
        }
        description={product.seo_description || productDescription || t('productDetail.seoDesc', { name: productName })}
        keywords={product.seo_keywords || `${productName}, ${product.category}, ${t('common.naturalProducts')}, ${t('common.storeName')}, ${product.made_in || ''}`}
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
        name={productName}
        description={productDescription || product.seo_description || `${productName} - ${t('common.naturalProduct')}`}
        image={product.image_url || ''}
        images={allImages}
        price={Number(product.price)}
        currency="SAR"
        sku={product.id}
        availability={isInStock ? 'InStock' : 'OutOfStock'}
        category={productCategory}
        brand={t('common.brand')}
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
        productName={productName}
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
          { name: t('nav.home'), url: getLocalizedPath('/') },
          { name: t('nav.products'), url: getLocalizedPath('/products') },
          { name: productCategory, url: getLocalizedPath(`/products?category=${product.category}`) },
          { name: productName, url: productUrl },
        ]}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={getLocalizedPath('/')}>{t('nav.home')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={getLocalizedPath('/products')}>{t('nav.products')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid md:grid-cols-2 gap-12">
        <ProductImageGallery 
          images={product.images?.length > 0 ? product.images : [{ image_url: product.image_url }]}
          productName={productName}
        />

        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm bg-gradient-primary text-white hover:opacity-90 transition-opacity px-4 py-1.5">
              {productCategory}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent leading-tight" itemProp="name">
              {productName}
            </h1>
            
            {product.ratingStats && product.ratingStats.review_count > 0 && (
              <div className="flex items-center gap-2">
                <ProductRating 
                  rating={product.ratingStats.average_rating} 
                  reviewCount={product.ratingStats.review_count}
                  size="lg"
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium">{t('product.sku')}:</span>
              <span className="font-mono bg-muted px-3 py-1 rounded-md">{product.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 shadow-soft">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {priceAmount}
              </span>
              <span className="text-2xl text-muted-foreground font-medium">{priceSymbol}</span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="flex items-center gap-3">
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
                <Badge variant="destructive" className="text-sm font-bold">
                  {t('common.discount')} {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-card rounded-xl border shadow-sm">
              <p className="text-sm font-semibold text-muted-foreground mb-4">{t('product.chooseQuantity')}</p>
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
                      {t('product.inStock')} ({product.stock_quantity})
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {t('product.outOfStock')}
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
                <ShoppingCart className="me-2 h-6 w-6" />
                {t('product.addToCart')}
              </Button>
              
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-soft hover:shadow-card"
                disabled={product.stock_quantity <= 0}
              >
                <Zap className="me-2 h-6 w-6" />
                {t('product.buyNow')}
              </Button>
              
              <SocialShare 
                productName={productName}
              />
            </div>
          </div>

          <TrustBadges />
        </div>
      </div>

      <ProductTabs
        description={productDescription}
        long_description_ar={getLocalizedField(product, 'long_description')}
        ingredients={getLocalizedField(product, 'ingredients')}
        howToUse={getLocalizedField(product, 'how_to_use')}
        benefits={getLocalizedField(product, 'benefits')}
        warnings={getLocalizedField(product, 'warnings')}
        sizeInfo={product.size_info}
        madeIn={product.made_in}
        key_features={product.key_features}
        why_choose={product.why_choose}
        faqs={product.faqs}
      />

      {!getLocalizedField(product, 'long_description') && productDescription && (
        <section className="mt-8 prose prose-lg max-w-none" itemProp="description">
          <h2 className="text-2xl font-bold text-primary mb-4">{t('product.about')} {productName}</h2>
          <div className="text-muted-foreground leading-relaxed">
            <p className="whitespace-pre-line">{productDescription}</p>
            
            {productCategory && (
              <p className="mt-4">
                {t('productDetail.aboutCategoryText', { name: productName, category: productCategory })}
              </p>
            )}
            
            {product.made_in && (
              <p className="mt-3">
                <strong>{t('productDetail.originLabel')}</strong> {t('productDetail.originText', { country: product.made_in })}
              </p>
            )}
            
            <p className="mt-3">
              <strong>{t('productDetail.shippingLabel')}</strong> {t('productDetail.shippingText')}
            </p>
            
            <p className="mt-3">
              <strong>{t('productDetail.returnLabel')}</strong> {t('productDetail.returnText')}
            </p>
          </div>
        </section>
      )}

      <div className="mt-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">{t('product.reviewsTitle')}</h2>
          <p className="text-muted-foreground text-lg">{t('product.shareExperience')}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <ReviewsList productId={product.id} />
          <ReviewForm productId={product.id} />
        </div>
      </div>

      <RelatedProducts currentProductId={product.id} category={product.category} />
    </div>
  );
}
