// Supabase Edge Function for scraping product data

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  specifications?: Record<string, string>;
  brand?: string;
  category?: string;
  incomplete?: boolean;
}

// HTTP Headers محسنة لمحاكاة متصفح حقيقي
const getBrowserHeaders = (referer?: string) => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
  'DNT': '1',
  ...(referer && { 'Referer': referer }),
});

// دالة لمتابعة Redirects يدوياً
async function followRedirects(url: string, maxRedirects = 30): Promise<{ html: string; finalUrl: string }> {
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount < maxRedirects) {
    console.log(`Fetching URL (redirect ${redirectCount}): ${currentUrl}`);
    
    const response = await fetch(currentUrl, {
      method: 'GET',
      headers: getBrowserHeaders(redirectCount > 0 ? url : undefined),
      redirect: 'manual',
    });

    // التحقق من الـ redirect
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Redirect without location header');
      }

      // معالجة الروابط النسبية
      currentUrl = location.startsWith('http') 
        ? location 
        : new URL(location, currentUrl).toString();
      
      redirectCount++;
      
      // تأخير بسيط لتجنب Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }

    // إذا لم يكن redirect، استخراج المحتوى
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return { html, finalUrl: currentUrl };
  }

  throw new Error(`Maximum redirects (${maxRedirects}) exceeded`);
}

// دالة لاستخراج البيانات من meta tags
function extractMetaTags(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  // استخراج العنوان
  const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) data.name = titleMatch[1].trim();

  // استخراج الوصف
  const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                   html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) data.description = descMatch[1].trim();

  // استخراج الصور
  const imageMatches = html.matchAll(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi);
  for (const match of imageMatches) {
    if (match[1] && !data.images?.includes(match[1])) {
      data.images?.push(match[1]);
    }
  }

  // استخراج السعر
  const priceMatch = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/["']price["']\s*:\s*["']?(\d+\.?\d*)["']?/i);
  if (priceMatch) data.price = parseFloat(priceMatch[1]);

  // استخراج العملة
  const currencyMatch = html.match(/<meta[^>]*property=["']product:price:currency["'][^>]*content=["']([^"']+)["']/i);
  if (currencyMatch) data.currency = currencyMatch[1];

  return data;
}

// دالة خاصة محسنة لاستخراج بيانات AliExpress
function extractAliExpressData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  try {
    // استراتيجية 1: JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData.name) data.name = jsonData.name;
        if (jsonData.description) data.description = jsonData.description;
        if (jsonData.offers?.price) data.price = parseFloat(jsonData.offers.price);
        if (jsonData.offers?.priceCurrency) data.currency = jsonData.offers.priceCurrency;
        if (jsonData.image) {
          data.images = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
        }
        if (jsonData.brand?.name) data.brand = jsonData.brand.name;
      } catch (e) {
        console.error('Error parsing JSON-LD:', e);
      }
    }

    // استراتيجية 2: window.runParams
    const runParamsMatch = html.match(/window\.runParams\s*=\s*({[^;]+});/);
    if (runParamsMatch) {
      try {
        const runParams = JSON.parse(runParamsMatch[1]);
        if (runParams.data) {
          const productData = runParams.data;
          if (!data.name && productData.productTitle) data.name = productData.productTitle;
          if (!data.description && productData.productDescription) data.description = productData.productDescription;
          if (!data.price && productData.priceAmount) data.price = parseFloat(productData.priceAmount);
        }
      } catch (e) {
        console.error('Error parsing runParams:', e);
      }
    }

    // استراتيجية 3: data.imageBigViewURL و imagePathList
    const imageBigViewMatch = html.match(/imageBigViewURL["']?\s*:\s*\[([^\]]+)\]/);
    if (imageBigViewMatch) {
      const imageUrls = imageBigViewMatch[1].match(/["']([^"']+)["']/g);
      if (imageUrls) {
        imageUrls.forEach(url => {
          const cleanUrl = url.replace(/["']/g, '');
          if (cleanUrl.startsWith('//')) {
            data.images?.push('https:' + cleanUrl);
          } else if (cleanUrl.startsWith('http')) {
            data.images?.push(cleanUrl);
          }
        });
      }
    }

    const imagePathMatch = html.match(/imagePathList["']?\s*:\s*\[([^\]]+)\]/);
    if (imagePathMatch && (!data.images || data.images.length === 0)) {
      const imagePaths = imagePathMatch[1].match(/["']([^"']+)["']/g);
      if (imagePaths) {
        imagePaths.forEach(path => {
          const cleanPath = path.replace(/["']/g, '');
          if (cleanPath.startsWith('//')) {
            data.images?.push('https:' + cleanPath);
          } else if (cleanPath.startsWith('http')) {
            data.images?.push(cleanPath);
          }
        });
      }
    }

    // استراتيجية 4: استخراج صور من ae01.alicdn.com مباشرة
    if (!data.images || data.images.length === 0) {
      const cdnImages = html.matchAll(/https?:\/\/ae01\.alicdn\.com\/[^"'\s]+\.jpg/gi);
      const uniqueImages = new Set<string>();
      for (const match of cdnImages) {
        const url = match[0];
        // فقط الصور الكبيرة (تجنب الأيقونات الصغيرة)
        if (url.includes('_640x640') || url.includes('_800x800') || !url.includes('_50x50')) {
          uniqueImages.add(url);
        }
      }
      data.images = Array.from(uniqueImages).slice(0, 20);
    }

    // استراتيجية 5: استخراج السعر من patterns مختلفة
    if (!data.price) {
      const pricePatterns = [
        /["']price["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']minPrice["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']maxPrice["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /price["\s:]+(\d+\.?\d*)/i,
      ];

      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          data.price = parseFloat(match[1]);
          if (data.price > 0) break;
        }
      }
    }
  } catch (e) {
    console.error('Error in extractAliExpressData:', e);
  }

  return data;
}

// دالة خاصة محسنة لاستخراج بيانات Amazon
function extractAmazonData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  try {
    // استخراج العنوان - محاولات متعددة
    const titleSelectors = [
      /<span[^>]*id=["']productTitle["'][^>]*>([^<]+)<\/span>/i,
      /<h1[^>]*id=["']title["'][^>]*>([^<]+)<\/h1>/i,
      /<span[^>]*id=["']btAsinTitle["'][^>]*>([^<]+)<\/span>/i,
    ];

    for (const selector of titleSelectors) {
      const match = html.match(selector);
      if (match) {
        data.name = match[1].trim();
        break;
      }
    }

    // استخراج السعر - محاولات متعددة
    const pricePatterns = [
      /<span[^>]*class=["'][^"']*a-price-whole[^"']*["'][^>]*>([^<]+)<\/span>/i,
      /["']priceAmount["']\s*:\s*(\d+\.?\d*)/i,
      /<span[^>]*id=["']priceblock_ourprice["'][^>]*>([^<]+)<\/span>/i,
      /<span[^>]*class=["']a-price-whole["'][^>]*>([^<]+)<\/span>/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/[,\s$£€]/g, '');
        data.price = parseFloat(priceStr);
        if (data.price > 0) break;
      }
    }

    // استخراج الصور - محاولات متعددة محسنة
    // طريقة 1: colorImages (أفضل جودة)
    const colorImagesMatch = html.match(/["']colorImages["']\s*:\s*\{[^}]*["']initial["']\s*:\s*\[([^\]]+)\]/);
    if (colorImagesMatch) {
      const imageUrls = colorImagesMatch[1].matchAll(/["']hiRes["']\s*:\s*["']([^"']+)["']/g);
      for (const match of imageUrls) {
        if (match[1] && match[1] !== 'null') {
          data.images?.push(match[1]);
        }
      }
      // محاولة large أيضاً إذا لم نجد hiRes
      if (!data.images || data.images.length === 0) {
        const largeUrls = colorImagesMatch[1].matchAll(/["']large["']\s*:\s*["']([^"']+)["']/g);
        for (const match of largeUrls) {
          if (match[1] && match[1] !== 'null') {
            data.images?.push(match[1]);
          }
        }
      }
    }

    // طريقة 2: landingAsinColor
    if (!data.images || data.images.length < 3) {
      const landingMatch = html.match(/["']landingAsinColor["']\s*:\s*["']([^"']+)["']/);
      if (landingMatch) {
        const colorImagesFullMatch = html.match(/["']colorImages["']\s*:\s*\{([^}]+)\}/);
        if (colorImagesFullMatch) {
          const allImages = colorImagesFullMatch[1].matchAll(/["']hiRes["']\s*:\s*["']([^"']+)["']/g);
          for (const match of allImages) {
            if (match[1] && match[1] !== 'null' && !data.images?.includes(match[1])) {
              data.images?.push(match[1]);
            }
          }
        }
      }
    }

    // طريقة 3: imageGalleryData
    if (!data.images || data.images.length < 3) {
      const galleryMatch = html.match(/["']imageGalleryData["']\s*:\s*\[([^\]]+)\]/);
      if (galleryMatch) {
        const imageUrls = galleryMatch[1].matchAll(/["']mainUrl["']\s*:\s*["']([^"']+)["']/g);
        for (const match of imageUrls) {
          if (match[1] && !data.images?.includes(match[1])) {
            data.images?.push(match[1]);
          }
        }
      }
    }

    // طريقة 4: altImages
    if (!data.images || data.images.length < 3) {
      const altImagesMatch = html.match(/["']altImages["']\s*:\s*\[([^\]]+)\]/);
      if (altImagesMatch) {
        const imageUrls = altImagesMatch[1].matchAll(/["']hiRes["']\s*:\s*["']([^"']+)["']/g);
        for (const match of imageUrls) {
          if (match[1] && match[1] !== 'null' && !data.images?.includes(match[1])) {
            data.images?.push(match[1]);
          }
        }
      }
    }

    // طريقة 5: data-a-dynamic-image
    if (!data.images || data.images.length < 3) {
      const dynImageMatches = html.matchAll(/data-a-dynamic-image=["']({[^"']+})["']/gi);
      for (const match of dynImageMatches) {
        try {
          const imageObj = JSON.parse(match[1].replace(/&quot;/g, '"'));
          for (const url of Object.keys(imageObj)) {
            if (url.startsWith('http') && !data.images?.includes(url)) {
              data.images?.push(url);
              if (data.images && data.images.length >= 20) break;
            }
          }
        } catch (e) {
          // تجاهل أخطاء JSON
        }
      }
    }

    // طريقة 6: صور مباشرة من img tags (كـ fallback)
    if (!data.images || data.images.length < 3) {
      const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']*images-amazon[^"']+)["']/gi);
      const uniqueImages = new Set<string>();
      for (const match of imgMatches) {
        const url = match[1];
        // تجنب الصور الصغيرة والأيقونات
        if ((url.includes('._AC_') || url.includes('_SL') || url.includes('_SS')) && 
            !url.includes('._AC_US40_') && !url.includes('._AC_UL16_')) {
          uniqueImages.add(url);
        }
      }
      const currentImages = data.images || [];
      for (const img of uniqueImages) {
        if (!currentImages.includes(img)) {
          data.images?.push(img);
        }
      }
    }

    // استخراج الوصف
    const descPatterns = [
      /<div[^>]*id=["']feature-bullets["'][^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id=["']productDescription["'][^>]*>([\s\S]*?)<\/div>/i,
    ];

    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        const bullets = match[1].match(/<(?:span|li)[^>]*>([^<]+)<\/(?:span|li)>/gi);
        if (bullets) {
          data.description = bullets
            .map(b => b.replace(/<[^>]+>/g, '').trim())
            .filter(b => b.length > 10)
            .join('. ');
          break;
        }
      }
    }
  } catch (e) {
    console.error('Error in extractAmazonData:', e);
  }

  return data;
}

// دالة لإزالة الصور المكررة والفلترة الذكية
function deduplicateAndFilterImages(images: string[]): string[] {
  const seen = new Set<string>();
  const filtered: string[] = [];
  
  for (const url of images) {
    // استخراج URL بدون query parameters
    const baseUrl = url.split('?')[0];
    
    // تجنب الصور الصغيرة جداً والأيقونات
    if (url.includes('logo') || url.includes('icon') || url.includes('favicon') ||
        url.includes('_50x50') || url.includes('_40x40') || url.includes('thumbnail') ||
        url.includes('sprite')) {
      continue;
    }
    
    // تجنب صور placeholders و loading spinners
    if (url.includes('placeholder') || url.includes('loading') || 
        url.includes('spinner') || url.includes('blank.')) {
      continue;
    }
    
    // تفضيل الصور الكبيرة (إذا وُجدت نسخ متعددة من نفس الصورة)
    if (url.includes('_small') || url.includes('_thumb') || url.includes('_mini')) {
      const largeUrl = url.replace(/_small|_thumb|_mini/g, '_large');
      if (!seen.has(largeUrl.split('?')[0])) {
        continue; // تخطي الصورة الصغيرة إذا كانت النسخة الكبيرة موجودة
      }
    }
    
    // إضافة فقط إذا لم نرها من قبل
    if (!seen.has(baseUrl)) {
      seen.add(baseUrl);
      filtered.push(url);
    }
  }
  
  return filtered;
}

// دالة لاستخراج lazy-loaded images
function extractLazyImages(html: string): string[] {
  const images: string[] = [];
  
  const lazyPatterns = [
    /data-src=["']([^"']+)["']/gi,
    /data-lazy=["']([^"']+)["']/gi,
    /data-original=["']([^"']+)["']/gi,
    /data-srcset=["']([^"']+)["']/gi,
  ];
  
  for (const pattern of lazyPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const url = match[1].split(',')[0].split(' ')[0].trim();
      if (url.startsWith('http')) {
        images.push(url);
      }
    }
  }
  
  return images;
}

// دالة متخصصة لاستخراج جميع صور المنتج من galleries مختلفة
function extractImageGallery(html: string): string[] {
  const images: string[] = [];
  
  // 1. استخراج من JSON-LD (أولوية عالية)
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData.image) {
        const imageArray = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
        images.push(...imageArray.filter((img: any) => typeof img === 'string' && img.startsWith('http')));
      }
      // دعم nested products (مثل ItemList)
      if (jsonData['@graph']) {
        for (const item of jsonData['@graph']) {
          if (item.image) {
            const itemImages = Array.isArray(item.image) ? item.image : [item.image];
            images.push(...itemImages.filter((img: any) => typeof img === 'string' && img.startsWith('http')));
          }
        }
      }
    } catch (e) {
      // تجاهل أخطاء JSON
    }
  }
  
  // 2. استخراج جميع <img> tags من الصفحة
  const allImgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
  for (const match of allImgMatches) {
    const url = match[1];
    if (url.startsWith('http') || url.startsWith('//')) {
      const fullUrl = url.startsWith('//') ? 'https:' + url : url;
      images.push(fullUrl);
    }
  }
  
  // 3. استخراج من data-src و data-lazy-src (lazy loaded images)
  const lazyImgPatterns = [
    /data-src=["']([^"']+)["']/gi,
    /data-lazy-src=["']([^"']+)["']/gi,
    /data-original=["']([^"']+)["']/gi,
  ];
  
  for (const pattern of lazyImgPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const url = match[1];
      if (url.startsWith('http') || url.startsWith('//')) {
        const fullUrl = url.startsWith('//') ? 'https:' + url : url;
        images.push(fullUrl);
      }
    }
  }
  
  // 4. استخراج من <noscript> tags (صور عالية الجودة مخفية)
  const noscriptMatches = html.matchAll(/<noscript[^>]*>([\s\S]*?)<\/noscript>/gi);
  for (const match of noscriptMatches) {
    const imgMatches = match[1].matchAll(/<img[^>]*src=["']([^"']+)["']/gi);
    for (const imgMatch of imgMatches) {
      const url = imgMatch[1];
      if (url.startsWith('http') || url.startsWith('//')) {
        const fullUrl = url.startsWith('//') ? 'https:' + url : url;
        images.push(fullUrl);
      }
    }
  }
  
  // 5. استخراج من srcset attributes (responsive images)
  const srcsetMatches = html.matchAll(/srcset=["']([^"']+)["']/gi);
  for (const match of srcsetMatches) {
    const urls = match[1].split(',').map(s => {
      const url = s.trim().split(' ')[0];
      if (url.startsWith('//')) return 'https:' + url;
      return url;
    });
    images.push(...urls.filter(url => url.startsWith('http')));
  }
  
  // 6. استخراج من data-state (React/Next.js apps)
  const dataStateMatches = html.matchAll(/data-state=["']([^"']+)["']/gi);
  for (const match of dataStateMatches) {
    try {
      const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const stateData = JSON.parse(decoded);
      if (stateData.images) {
        const stateImages = Array.isArray(stateData.images) ? stateData.images : [stateData.images];
        images.push(...stateImages.filter((img: any) => typeof img === 'string' && img.startsWith('http')));
      }
    } catch (e) {
      // تجاهل أخطاء JSON
    }
  }
  
  return images;
}

// دالة لاستخراج بيانات من Shopify stores
function extractShopifyData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };
  
  try {
    // Shopify يضع بيانات المنتج في ProductJSON
    const productJsonMatch = html.match(/<script[^>]*type=["']application\/json["'][^>]*data-product-json[^>]*>([^<]+)<\/script>/i);
    if (productJsonMatch) {
      try {
        const product = JSON.parse(productJsonMatch[1]);
        if (product.title) data.name = product.title;
        if (product.description) data.description = product.description;
        if (product.price) data.price = parseFloat(product.price) / 100; // Shopify يخزن السعر بالسنتات
        if (product.variants && product.variants[0]?.price) {
          data.price = parseFloat(product.variants[0].price) / 100;
        }
        if (product.images) {
          data.images = product.images.map((img: any) => 
            typeof img === 'string' ? img : img.src
          ).filter((url: string) => url.startsWith('http'));
        }
        if (product.featured_image) {
          data.images?.unshift(product.featured_image);
        }
      } catch (e) {
        console.error('Error parsing Shopify product JSON:', e);
      }
    }
    
    // محاولة استخراج من gallery structure
    if (!data.images || data.images.length === 0) {
      const galleryMatches = html.matchAll(/<div[^>]*class=["'][^"']*product-gallery[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi);
      for (const match of galleryMatches) {
        const imgUrls = match[1].matchAll(/<img[^>]*src=["']([^"']+)["']/gi);
        for (const imgMatch of imgUrls) {
          if (imgMatch[1].startsWith('http')) {
            data.images?.push(imgMatch[1]);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error in extractShopifyData:', e);
  }
  
  return data;
}

// دالة Fallback محسنة لاستخراج بيانات عامة
function extractFallbackData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  try {
    // محاولة استخراج العنوان من h1
    if (!data.name) {
      const h1Matches = [
        /<h1[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class=["'][^"']*product[^"']*["'][^>]*>([^<]+)<\/h1>/i,
      ];

      for (const pattern of h1Matches) {
        const match = html.match(pattern);
        if (match) {
          const title = match[1].trim();
          if (title.length > 5 && title.length < 200) {
            data.name = title;
            break;
          }
        }
      }
    }

    // محاولة استخراج الوصف من p tags
    if (!data.description) {
      const descMatch = html.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/p>/i);
      if (descMatch) {
        data.description = descMatch[1].trim();
      }
    }

    // محاولة استخراج السعر من أرقام في الصفحة
    if (!data.price) {
      const pricePatterns = [
        /\$\s*(\d+(?:\.\d{2})?)/,
        /(\d+(?:\.\d{2})?)\s*USD/i,
        /price["\s:]+(\d+(?:\.\d{2})?)/i,
        /(\d+(?:\.\d{2})?)\s*ريال/,
        /(\d+(?:\.\d{2})?)\s*SR/i,
      ];

      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          const price = parseFloat(match[1]);
          if (price > 0 && price < 100000) {
            data.price = price;
            break;
          }
        }
      }
    }

    // استخراج صور - محسّن لجلب حتى 15 صورة
    if (!data.images || data.images.length === 0) {
      const allImages: string[] = [];
      
      // 1. صور من img tags عادية
      const imgMatches = html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
      for (const match of imgMatches) {
        const url = match[1];
        if (url.startsWith('https://') || url.startsWith('http://')) {
          allImages.push(url);
        }
      }
      
      // 2. صور من lazy loading
      const lazyImages = extractLazyImages(html);
      allImages.push(...lazyImages);
      
      // 2.5. استخراج من Image Gallery Parser الجديد
      const galleryImages = extractImageGallery(html);
      allImages.push(...galleryImages);
      
      // 3. صور من picture tags
      const pictureMatches = html.matchAll(/<source[^>]*srcset=["']([^"']+)["']/gi);
      for (const match of pictureMatches) {
        const url = match[1].split(',')[0].split(' ')[0].trim();
        if (url.startsWith('http')) {
          allImages.push(url);
        }
      }
      
      // 4. صور من JSON structures
      const jsonScripts = html.matchAll(/<script[^>]*type=["']application\/(?:ld\+)?json["'][^>]*>([^<]+)<\/script>/gi);
      for (const match of jsonScripts) {
        try {
          const json = JSON.parse(match[1]);
          if (json.image) {
            const images = Array.isArray(json.image) ? json.image : [json.image];
            allImages.push(...images.filter((img: string) => typeof img === 'string' && img.startsWith('http')));
          }
        } catch (e) {
          // تجاهل أخطاء JSON
        }
      }
      
      // فلترة وإزالة المكررات
      const filtered = deduplicateAndFilterImages(allImages);
      data.images = filtered.slice(0, 20);
    }

    // وضع علامة incomplete إذا كانت البيانات ناقصة
    if (!data.name || !data.price || !data.images || data.images.length === 0) {
      data.incomplete = true;
    }
  } catch (e) {
    console.error('Error in extractFallbackData:', e);
  }

  return data;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'URL_REQUIRED',
          message: 'URL is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // التحقق من صحة الرابط
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'INVALID_URL',
          message: 'Invalid URL format',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // الحماية من SSRF
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'INVALID_PROTOCOL',
          message: 'Only HTTP and HTTPS protocols are allowed',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Fetching product from:', url);

    let html: string;
    let finalUrl: string;

    try {
      // استخدام followRedirects المحسنة
      const result = await followRedirects(url);
      html = result.html;
      finalUrl = result.finalUrl;
      console.log('Successfully fetched page, final URL:', finalUrl);
    } catch (error) {
      console.error('Error fetching page:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch the product page',
          suggestion: 'تأكد من صحة الرابط أو حاول رابطاً آخر',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    let productData: Partial<ProductData> = {};

    // تحديد نوع الموقع واستخراج البيانات
    if (hostname.includes('aliexpress')) {
      console.log('Detected AliExpress');
      productData = extractAliExpressData(html);
    } else if (hostname.includes('amazon')) {
      console.log('Detected Amazon');
      productData = extractAmazonData(html);
    } else if (hostname.includes('myshopify') || html.includes('Shopify.theme') || html.includes('cdn.shopify')) {
      console.log('Detected Shopify store');
      productData = extractShopifyData(html);
    }

    // استخراج البيانات العامة من meta tags
    const metaData = extractMetaTags(html);
    productData = {
      ...metaData,
      ...productData,
    };
    
    // استخراج صور إضافية من Gallery Parser
    const galleryImages = extractImageGallery(html);
    if (galleryImages.length > 0) {
      console.log(`Extracted ${galleryImages.length} images from gallery parser`);
      productData.images = [...(productData.images || []), ...galleryImages];
    }
    
    // إزالة الصور المكررة وتنظيفها
    if (productData.images && productData.images.length > 0) {
      productData.images = deduplicateAndFilterImages(productData.images);
      console.log(`Total unique images after deduplication: ${productData.images.length}`);
    }

    // محاولة Fallback إذا لم نحصل على بيانات كافية
    if (!productData.name || !productData.price || !productData.images || productData.images.length === 0) {
      console.log('Using fallback extraction');
      const fallbackData = extractFallbackData(html);
      productData = {
        ...fallbackData,
        ...productData, // البيانات الموجودة لها الأولوية
      };
    }

    // التحقق من وجود البيانات الأساسية
    if (!productData.name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'EXTRACTION_FAILED',
          message: 'Could not extract product name from the page',
          suggestion: 'يمكنك نسخ البيانات يدوياً من الصفحة',
          url: finalUrl,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // تنظيف البيانات
    const cleanData: ProductData = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || 0,
      currency: productData.currency || 'USD',
      images: (productData.images || []).filter(img => img && img.startsWith('http')).slice(0, 20),
      specifications: productData.specifications,
      brand: productData.brand,
      category: productData.category,
      incomplete: productData.incomplete,
    };

    console.log('Successfully extracted product data:', {
      name: cleanData.name,
      price: cleanData.price,
      imagesCount: cleanData.images.length,
      imagesSample: cleanData.images.slice(0, 3), // عرض أول 3 روابط
      incomplete: cleanData.incomplete,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: cleanData,
        warnings: cleanData.incomplete ? ['بعض البيانات قد تكون ناقصة، يرجى مراجعتها'] : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
