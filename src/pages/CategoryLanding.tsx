import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { ItemListSchema } from '@/components/SEO/ItemListSchema';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { ChevronLeft, Sparkles, Leaf, Shield, Award } from 'lucide-react';

// Category content for SEO - Topic Clusters
const categoryContent: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  tips: string[];
  keywords: string;
}> = {
  'hair-care': {
    title: 'منتجات العناية بالشعر الطبيعية',
    description: 'اكتشفي مجموعة منتجات العناية بالشعر الطبيعية 100% من لمسة بيوتي. شامبو، بلسم، سيروم، وزيوت طبيعية لشعر صحي ولامع.',
    longDescription: 'في لمسة بيوتي، نقدم لكِ أفضل منتجات العناية بالشعر المصنوعة من مكونات طبيعية 100%. تم اختيار كل منتج بعناية فائقة لضمان حصولك على نتائج مذهلة دون التعرض للمواد الكيميائية الضارة. سواء كان شعرك جافاً، دهنياً، أو تالفاً، ستجدين الحل المثالي في مجموعتنا المتنوعة.',
    benefits: [
      'مكونات طبيعية 100% آمنة للشعر',
      'خالية من السلفات والبارابين',
      'تغذية عميقة للشعر من الجذور',
      'نتائج ملحوظة من أول استخدام'
    ],
    tips: [
      'استخدمي الشامبو مرتين أسبوعياً للحفاظ على توازن فروة الرأس',
      'ضعي السيروم على الأطراف الرطبة لنتائج أفضل',
      'استخدمي ماسك الشعر مرة أسبوعياً للترطيب العميق'
    ],
    keywords: 'شامبو طبيعي، سيروم شعر، زيت أرغان، العناية بالشعر، منتجات شعر طبيعية، علاج تساقط الشعر'
  },
  'skincare': {
    title: 'منتجات العناية بالبشرة الطبيعية',
    description: 'مجموعة متكاملة للعناية بالبشرة من لمسة بيوتي. كريمات، سيروم، وأقنعة طبيعية لبشرة نضرة ومشرقة.',
    longDescription: 'اكتشفي سر البشرة المثالية مع مجموعة العناية بالبشرة من لمسة بيوتي. منتجاتنا مصممة خصيصاً للبشرة العربية وتحتوي على أجود المكونات الطبيعية من زيت الأرغان المغربي إلى خلاصة الصبار وفيتامين C. احصلي على بشرة نضرة ومشرقة دون أي آثار جانبية.',
    benefits: [
      'تركيبات مخصصة لجميع أنواع البشرة',
      'مكونات طبيعية ومرطبة',
      'حماية من أشعة الشمس الضارة',
      'مكافحة علامات التقدم في السن'
    ],
    tips: [
      'نظفي بشرتك صباحاً ومساءً بغسول لطيف',
      'استخدمي السيروم قبل الكريم المرطب',
      'لا تنسي واقي الشمس يومياً حتى في الأيام الغائمة'
    ],
    keywords: 'كريم بشرة، سيروم فيتامين سي، مرطب طبيعي، العناية بالبشرة، علاج حب الشباب، كريم مضاد للتجاعيد'
  },
  'body-care': {
    title: 'منتجات العناية بالجسم الطبيعية',
    description: 'اكتشفي مجموعة العناية بالجسم من لمسة بيوتي. لوشن، زبدة الجسم، وسكراب طبيعي لبشرة ناعمة ومتوهجة.',
    longDescription: 'دللي جسمك بأفضل منتجات العناية الطبيعية من لمسة بيوتي. مجموعتنا تشمل لوشن مرطب، زبدة الجسم الغنية، وسكراب طبيعي لتقشير البشرة بلطف. كل منتج مصنوع من مكونات طبيعية نقية تمنح بشرتك النعومة والترطيب الذي تستحقه.',
    benefits: [
      'ترطيب عميق يدوم طوال اليوم',
      'روائح طبيعية منعشة',
      'تقشير لطيف للبشرة',
      'مكونات عضوية معتمدة'
    ],
    tips: [
      'استخدمي السكراب مرتين أسبوعياً',
      'ضعي اللوشن على البشرة الرطبة بعد الاستحمام',
      'ركزي على المناطق الجافة مثل الكوعين والركبتين'
    ],
    keywords: 'لوشن جسم، زبدة الشيا، سكراب طبيعي، العناية بالجسم، ترطيب البشرة، تقشير الجسم'
  },
  'men-care': {
    title: 'منتجات العناية للرجال',
    description: 'مجموعة خاصة للرجال من لمسة بيوتي. منتجات حلاقة، عناية بالبشرة، وعناية بالشعر للرجل العصري.',
    longDescription: 'لأن الرجال يستحقون أفضل عناية، نقدم لكم مجموعة متكاملة من منتجات العناية الرجالية. من كريمات الحلاقة الناعمة إلى منتجات تصفيف الشعر ومرطبات البشرة، كل منتج مصمم خصيصاً لاحتياجات بشرة الرجل.',
    benefits: [
      'تركيبات مخصصة لبشرة الرجل',
      'روائح رجالية مميزة',
      'حماية بعد الحلاقة',
      'منتجات متعددة الاستخدام'
    ],
    tips: [
      'رطب بشرتك بعد كل حلاقة',
      'استخدم غسول وجه مناسب لنوع بشرتك',
      'لا تهمل العناية بشعرك ولحيتك'
    ],
    keywords: 'منتجات رجالية، كريم حلاقة، عناية باللحية، مرطب للرجال، العناية بالرجل'
  },
  'wellness': {
    title: 'منتجات الصحة والعافية',
    description: 'مجموعة الصحة والعافية من لمسة بيوتي. زيوت عطرية، مكملات طبيعية، ومنتجات الاسترخاء.',
    longDescription: 'اهتمي بصحتك وعافيتك مع مجموعة منتجات الصحة من لمسة بيوتي. نقدم لكِ زيوت عطرية نقية للاسترخاء، مكملات طبيعية لدعم صحتك، ومنتجات متنوعة تساعدك على تحقيق التوازن والراحة النفسية.',
    benefits: [
      'زيوت عطرية 100% نقية',
      'منتجات استرخاء طبيعية',
      'دعم الصحة العامة',
      'مكونات عضوية معتمدة'
    ],
    tips: [
      'استخدمي الزيوت العطرية في المساء للاسترخاء',
      'أضيفي بضع قطرات للاستحمام',
      'استشيري الطبيب قبل استخدام المكملات'
    ],
    keywords: 'زيوت عطرية، استرخاء، صحة طبيعية، عافية، منتجات طبيعية'
  },
  'gifts': {
    title: 'مجموعات الهدايا الفاخرة',
    description: 'أفخم مجموعات الهدايا من لمسة بيوتي. هدايا مميزة للمناسبات الخاصة بتغليف أنيق.',
    longDescription: 'ابهري من تحبين بهدية فاخرة من لمسة بيوتي. مجموعات هدايا متكاملة تحتوي على أفضل منتجاتنا، مقدمة في تغليف أنيق وفاخر. مثالية لأعياد الميلاد، المناسبات الخاصة، أو لإظهار تقديرك لشخص عزيز.',
    benefits: [
      'تغليف فاخر وأنيق',
      'مجموعات متنوعة لجميع الأذواق',
      'منتجات مختارة بعناية',
      'هدية مثالية لكل مناسبة'
    ],
    tips: [
      'اختاري المجموعة المناسبة لنوع بشرة المُهدى إليها',
      'أضيفي بطاقة معايدة شخصية',
      'تأكدي من اختيار الحجم المناسب'
    ],
    keywords: 'هدايا، مجموعات هدايا، هدية فاخرة، هدايا للنساء، هدايا مناسبات'
  }
};

const CategoryLanding = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch products in this category
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, price, image_url, category, category_ar, slug, stock_quantity, is_active')
        .eq('category', slug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch ratings for each product
      const productsWithRatings = await Promise.all(
        (data || []).map(async (product) => {
          const { data: ratingData } = await supabase
            .rpc('get_product_rating', { product_uuid: product.id });
          const rating = ratingData?.[0];
          return {
            ...product,
            aggregateRating: rating ? { ratingValue: rating.average_rating, reviewCount: rating.review_count } : null
          };
        })
      );

      return productsWithRatings;
    },
    enabled: !!slug,
  });

  // Fetch related blog posts for internal linking
  const { data: relatedPosts } = useQuery({
    queryKey: ['category-blog-posts', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title_ar, slug, excerpt_ar, featured_image')
        .eq('status', 'published')
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (!slug) {
    return <Navigate to="/products" replace />;
  }

  const content = categoryContent[slug] || {
    title: category?.name_ar || 'المنتجات',
    description: category?.description_ar || 'تصفح منتجاتنا المميزة',
    longDescription: '',
    benefits: [],
    tips: [],
    keywords: ''
  };

  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    { name: 'المنتجات', url: '/products' },
    { name: category?.name_ar || content.title, url: `/category/${slug}` },
  ];

  if (categoryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEOHead
        title={`${content.title} | لمسة بيوتي - شحن مجاني السعودية`}
        description={content.description}
        keywords={content.keywords}
        url={`https://lamsetbeauty.com/category/${slug}`}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      {products && products.length > 0 && (
        <ItemListSchema 
          products={products} 
          listName={content.title}
          category={category.name_ar}
        />
      )}

      {/* Hero Section with Category Banner */}
      <section className="relative bg-gradient-to-bl from-primary/10 via-background to-secondary/10 py-12 md:py-16">
        {category.banner_url && (
          <div className="absolute inset-0 opacity-10">
            <img 
              src={category.banner_url} 
              alt={category.name_ar}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">الرئيسية</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">المنتجات</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronLeft className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name_ar}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {content.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {content.description}
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      {content.benefits.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg shadow-sm">
                  {index === 0 && <Leaf className="h-5 w-5 text-primary flex-shrink-0" />}
                  {index === 1 && <Shield className="h-5 w-5 text-primary flex-shrink-0" />}
                  {index === 2 && <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />}
                  {index === 3 && <Award className="h-5 w-5 text-primary flex-shrink-0" />}
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            جميع منتجات {category.name_ar} ({products?.length || 0} منتج)
          </h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة حالياً</p>
              <Link to="/products" className="text-primary hover:underline mt-4 inline-block">
                تصفح جميع المنتجات
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Long Description for SEO */}
      {content.longDescription && (
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
              <h2 className="text-2xl font-bold mb-6">لماذا تختارين منتجات {category.name_ar} من لمسة بيوتي؟</h2>
              <p className="text-muted-foreground leading-relaxed">
                {content.longDescription}
              </p>
              
              {content.tips.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mt-8 mb-4">نصائح للاستخدام الأمثل</h3>
                  <ul className="space-y-2">
                    {content.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Related Blog Posts - Internal Linking */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">مقالات ذات صلة بـ{category.name_ar}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug}`}
                  className="group block bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.featured_image} 
                        alt={post.title_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title_ar}
                    </h3>
                    {post.excerpt_ar && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {post.excerpt_ar}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                to="/blog" 
                className="text-primary hover:underline font-medium"
              >
                عرض جميع المقالات ←
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Other Categories - Internal Linking */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">تصفح فئات أخرى</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.keys(categoryContent)
              .filter(catSlug => catSlug !== slug)
              .map(catSlug => (
                <Link
                  key={catSlug}
                  to={`/category/${catSlug}`}
                  className="px-6 py-3 bg-background rounded-full shadow-sm hover:shadow-md hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {categoryContent[catSlug].title.replace('منتجات ', '').replace(' الطبيعية', '').replace(' الفاخرة', '')}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryLanding;
