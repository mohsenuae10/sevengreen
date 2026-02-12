/**
 * Keywords Optimization Strategy for Arabic & English
 * Focus on high-intent, long-tail keywords for better rankings
 */

export const SeoCategoryKeywords = {
  hair_care: {
    ar: {
      primary: 'العناية بالشعر الطبيعية',
      secondaryKeywords: [
        'شامبو طبيعي بار',
        'شامبو صلب آمن للشعر',
        'منتجات العناية بالشعر العضوية',
        'زيوت شعر طبيعية السعودية',
        'بار شامبو للشعر الجاف',
        'شامبو خالي من الكيماويات',
        'العناية بالشعر الجاف والتالف',
        'فائدة الشامبو الطبيعي',
        'أفضل شامبو للشعر في السعودية',
        'شامبو عضوي معتمد'
      ],
      titles: [
        'شامبو {productName} | منتجات العناية بالشعر الطبيعية 100%',
        'افضل {productName} الطبيعي | للشعر الصحي والقوي',
        '{productName} الأصلي | بالأعشاب الطبيعية | لمسة بيوتي'
      ],
      metaDescriptions: [
        'اكتشفي {productName} الطبيعي ✓ شامبو خالي من الكيماويات ✓ آمن على جميع أنواع الشعر ✓ شحن مجاني للسعودية',
        '{productName} من لمسة بيوتي - منتج عناية طبيعي 100% ✓ نتائج ملحوظة في أسبوعين ✓ توصيل سريع'
      ]
    },
    en: {
      primary: 'Natural Hair Care Products',
      secondaryKeywords: [
        'natural solid shampoo bar',
        'organic hair care products Saudi Arabia',
        'chemical-free shampoo',
        'natural hair oil',
        'best shampoo for dry hair',
        'herbal hair care',
        'eco-friendly shampoo',
        'hair growth treatment natural',
        'dandruff free shampoo natural'
      ]
    }
  },
  skin_care: {
    ar: {
      primary: 'العناية بالبشرة الطبيعية',
      secondaryKeywords: [
        'سيروم فيتامين سي الطبيعي',
        'منتجات العناية بالبشرة العضوية',
        'كريم البشرة الطبيعي',
        'سيروم بشرة تفتيح',
        'عناية بالبشرة الحساسة',
        'منتجات تجميل بدون كيماويات',
        'أفضل منتجات العناية بالبشرة',
        'سيروم طبيعي للبشرة الدهنية',
        'كريم تجاعيد طبيعي'
      ]
    },
    en: {
      primary: 'Natural Skin Care Solutions',
      secondaryKeywords: [
        'vitamin c serum natural',
        'organic skin care facial',
        'best face serum for sensitive skin',
        'natural skincare products online',
        'anti-aging face cream natural'
      ]
    }
  },
  supplements: {
    ar: {
      primary: 'منتجات صحية وتكميلية طبيعية',
      secondaryKeywords: [
        'مكملات غذائية طبيعية',
        'فيتامينات طبيعية',
        'منتجات الجنسنج الطبيعية',
        'أعشاب طبيعية للصحة'
      ]
    }
  }
};

export const generateOptimizedMetadata = (
  productName: string,
  category: string,
  language: 'ar' | 'en' = 'ar',
  price?: number,
  inStock?: boolean
) => {
  const categoryData = SeoCategoryKeywords[category as keyof typeof SeoCategoryKeywords];
  
  if (!categoryData) {
    return {};
  }

  const langData = categoryData[language === 'ar' ? 'ar' : 'en'];
  if (!langData) return {};

  const keywords = [
    langData.primary,
    productName,
    ...(langData.secondaryKeywords || []).slice(0, 5)
  ].join(', ');

  let title = `${productName}`;
  if (langData.titles && langData.titles.length > 0) {
    title = langData.titles[0].replace('{productName}', productName);
  }

  let description = `${productName} - ${langData.primary}`;
  if (langData.metaDescriptions && langData.metaDescriptions.length > 0) {
    description = langData.metaDescriptions[0]
      .replace('{productName}', productName)
      .substring(0, 160);
  }

  return {
    title: title.substring(0, 60),
    description: description.substring(0, 160),
    keywords,
    structuredKeywords: {
      primary: langData.primary,
      secondary: langData.secondaryKeywords || [],
      productSpecific: [productName, `${productName} الأصلي`, `شراء ${productName}`]
    }
  };
};

/**
 * SEO Content Guidelines for Arabic E-commerce
 */
export const ContentGuidelines = {
  titleLength: {
    min: 30,
    max: 60,
    recommendation: '50-55 characters'
  },
  descriptionLength: {
    min: 120,
    max: 160,
    recommendation: '150-155 characters'
  },
  keywordPlacement: {
    title: 'Include primary keyword at start of title',
    description: 'Include primary keyword in first 30 characters',
    headings: 'Use H1 once per page with main keyword',
    content: 'Include keyword naturally in first 100 words'
  },
  internalLinking: {
    minimum_links_per_page: 3,
    maximum_links_per_page: 10,
    types: ['Related Products', 'Category Pages', 'Blog Posts', 'Guides']
  },
  contentLength: {
    product_description: '200-300 words minimum',
    blog_post: '1500-2500 words recommended',
    category_page: '400-800 words'
  },
  structuredData: [
    'Product Schema (for products)',
    'FAQPage Schema (for FAQ pages)',
    'BreadcrumbList (for navigation)',
    'BlogPosting (for blog posts)',
    'Organization (for business info)',
    'LocalBusiness (for location)'
  ]
};

/**
 * Long-tail keyword recommendations for better ranking
 */
export const LongTailKeywordExamples = {
  ar: [
    'شامبو طبيعي بار أفضل منتج العناية بالشعر في السعودية',
    'سيروم فيتامين سي الطبيعي للبشرة الدهنية والعد الوحي',
    'منتجات عضوية معتمدة للعناية بشعر الأطفال',
    'أرخص أسعار مستحضرات تجميل طبيعية مع ضمان الجودة'
  ],
  en: [
    'best natural shampoo bar for dry damaged hair Saudi Arabia',
    'organic vitamin c serum for glowing skin certified',
    'chemical free face cream for sensitive skin with natural ingredients',
    'affordable natural beauty products with free shipping'
  ]
};
