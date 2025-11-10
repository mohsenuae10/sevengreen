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

interface ScrapeOptions {
  imagesOnly?: boolean; // جلب الصور فقط
  maxImages?: number; // عدد الصور المطلوبة (افتراضي: 20)
}

// HTTP Headers محسنة لمحاكاة متصفح حقيقي
const getBrowserHeaders = (url?: string, referer?: string, attemptNumber = 0) => {
  const isAliExpress = url?.toLowerCase().includes('aliexpress') || false;
  
  // تدوير User Agents لتجنب الكشف
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  ];
  
  const userAgent = userAgents[attemptNumber % userAgents.length];
  
  // Headers أساسية
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': isAliExpress ? 'ar,en-US;q=0.9,en;q=0.8' : 'en-US,en;q=0.9,ar;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'DNT': '1',
  };
  
  // إضافة Sec-Ch-Ua headers للمتصفحات المبنية على Chromium
  if (userAgent.includes('Chrome')) {
    headers['Sec-Ch-Ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
    headers['Sec-Ch-Ua-Mobile'] = '?0';
    headers['Sec-Ch-Ua-Platform'] = userAgent.includes('Mac') ? '"macOS"' : '"Windows"';
  }
  
  // إضافة Referer إذا كان موجوداً
  if (referer) {
    headers['Referer'] = referer;
  }
  
  // لـ AliExpress: إضافة cookies أساسية لمحاكاة جلسة حقيقية
  if (isAliExpress) {
    const cookies = [
      'aep_usuc_f=site=sau&c_tp=SAR&region=SA&b_locale=ar_MA',
      'intl_locale=ar_MA',
      'xman_us_f=x_locale=ar_MA&x_l=1',
      'xman_t=g9PMmPRqzwQpFT2w2h8aKTCT3gUCb3XUqxmJyH7ZHQiN8pXQXZ0K8F5gYyJmEqNQ',
      `aep_history=keywords%5E&product%5E${Date.now()}`,
    ];
    headers['Cookie'] = cookies.join('; ');
  }
  
  return headers;
};

// دالة لمعالجة روابط AliExpress القصيرة والخاصة
async function resolveAliExpressUrl(url: string): Promise<string> {
  const lowerUrl = url.toLowerCase();
  
  // روابط AliExpress القصيرة تحتاج متابعة
  if (lowerUrl.includes('a.aliexpress.com') || 
      lowerUrl.includes('s.click.aliexpress.com') ||
      lowerUrl.includes('sale.aliexpress.com')) {
    console.log('رابط AliExpress قصير، سيتم متابعة الـ redirects...');
  }
  
  // روابط /i/ يجب تحويلها إلى /item/
  if (lowerUrl.includes('/i/') && !lowerUrl.includes('/item/')) {
    url = url.replace(/\/i\/(\d+)\.html/i, '/item/$1.html');
    console.log('تحويل رابط /i/ إلى /item/:', url);
  }
  
  return url;
}

// دالة لمتابعة Redirects يدوياً مع محاولات متعددة
async function followRedirects(url: string, maxRedirects = 30, maxAttempts = 3): Promise<{ html: string; finalUrl: string }> {
  // معالجة روابط AliExpress الخاصة
  url = await resolveAliExpressUrl(url);
  
  const isAliExpress = url.toLowerCase().includes('aliexpress');
  let lastError: Error | null = null;
  
  // محاولات متعددة مع تأخير متزايد
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 1000 * (attempt + 1); // 1s, 2s, 3s
        console.log(`⏳ محاولة ${attempt + 1}/${maxAttempts} بعد ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      let currentUrl = url;
      let redirectCount = 0;

      while (redirectCount < maxRedirects) {
        console.log(`📥 جلب الرابط (redirect ${redirectCount}, attempt ${attempt + 1}): ${currentUrl}`);
        
        const response = await fetch(currentUrl, {
          method: 'GET',
          headers: getBrowserHeaders(currentUrl, redirectCount > 0 ? url : undefined, attempt),
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
          
          // تأخير أطول لـ AliExpress
          await new Promise(resolve => setTimeout(resolve, isAliExpress ? 500 : 200));
          continue;
        }

        // إذا لم يكن redirect، استخراج المحتوى
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        console.log(`✓ تم جلب HTML بنجاح (${html.length} حرف)`);
        
        // للتحقق من أن الصفحة ليست محمية أو فارغة
        if (isAliExpress && html.length < 5000) {
          console.log('⚠️ المحتوى صغير جداً، قد تكون الصفحة محمية - سنحاول مرة أخرى');
          throw new Error('محتوى صغير جداً - الصفحة قد تكون محمية');
        }
        
        return { html, finalUrl: currentUrl };
      }

      throw new Error(`تجاوز الحد الأقصى للـ redirects (${maxRedirects})`);
      
    } catch (e) {
      lastError = e as Error;
      console.error(`❌ خطأ في المحاولة ${attempt + 1}:`, lastError.message);
      
      // إذا كانت آخر محاولة، نرمي الخطأ
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('فشلت جميع المحاولات');
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
    console.log('=== بدء استخراج بيانات AliExpress ===');
    
    // استراتيجية 1: JSON-LD (أعلى أولوية)
    const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1]);
        if (jsonData['@type'] === 'Product' || jsonData.name) {
          if (jsonData.name && !data.name) {
            data.name = jsonData.name;
            console.log('✓ اسم المنتج من JSON-LD:', data.name);
          }
          if (jsonData.description && !data.description) {
            data.description = jsonData.description;
            console.log('✓ وصف المنتج من JSON-LD');
          }
          if (jsonData.offers?.price && !data.price) {
            data.price = parseFloat(jsonData.offers.price);
            console.log('✓ السعر من JSON-LD:', data.price);
          }
          if (jsonData.offers?.priceCurrency && !data.currency) {
            data.currency = jsonData.offers.priceCurrency;
          }
          if (jsonData.image) {
            const images = Array.isArray(jsonData.image) ? jsonData.image : [jsonData.image];
            data.images = [...(data.images || []), ...images];
            console.log('✓ صور من JSON-LD:', images.length);
          }
          if (jsonData.brand?.name && !data.brand) {
            data.brand = jsonData.brand.name;
          }
        }
      } catch (e) {
        console.error('خطأ في JSON-LD:', e);
      }
    }

    // استراتيجية 2: window.runParams (البيانات الرئيسية)
    const runParamsMatch = html.match(/window\.runParams\s*=\s*({[\s\S]*?});?\s*(?:window\.|<\/script>)/);
    if (runParamsMatch) {
      try {
        const runParams = JSON.parse(runParamsMatch[1]);
        console.log('✓ وجدنا window.runParams');
        
        if (runParams.data) {
          const productData = runParams.data;
          
          // استخراج العنوان - محاولات متعددة
          if (!data.name) {
            data.name = productData.productTitle || 
                       productData.titleModule?.subject ||
                       productData.titleModule?.title ||
                       productData.metaDataModule?.title;
            if (data.name) console.log('✓ اسم المنتج من runParams:', data.name);
          }
          
          // استخراج الوصف - محاولات متعددة
          if (!data.description) {
            data.description = productData.productDescription ||
                              productData.pageModule?.description ||
                              productData.titleModule?.description ||
                              productData.descriptionModule?.description;
            if (!data.description && productData.descriptionModule?.descriptionUrl) {
              data.description = 'معلومات المنتج متوفرة';
            }
          }
          
          // استخراج السعر - محاولات موسعة
          if (!data.price && productData.priceModule) {
            const pm = productData.priceModule;
            const priceValue = pm.minActivityAmount?.value ||
                              pm.minAmount?.value ||
                              pm.maxActivityAmount?.value ||
                              pm.maxAmount?.value ||
                              pm.formattedPrice?.replace(/[^\d.]/g, '');
            
            if (priceValue) {
              data.price = parseFloat(priceValue);
              data.currency = pm.minActivityAmount?.currency || 
                            pm.minAmount?.currency || 
                            pm.maxActivityAmount?.currency || 
                            'USD';
              console.log('✓ السعر من priceModule:', data.price, data.currency);
            }
          }
          
          // استخراج الصور من imageModule - طرق متعددة
          if (productData.imageModule) {
            const im = productData.imageModule;
            const imageSources = [
              im.imageBigViewURL,
              im.imagePathList,
              im.sumImagePathList,
              im.videos?.map((v: any) => v.coverUrl).filter(Boolean)
            ].filter(Boolean);
            
            imageSources.forEach(source => {
              if (Array.isArray(source)) {
                source.forEach((path: string) => {
                  const fullUrl = path.startsWith('//') ? 'https:' + path : path;
                  if (fullUrl.startsWith('http') && !data.images?.includes(fullUrl)) {
                    data.images?.push(fullUrl);
                  }
                });
              }
            });
            
            if (data.images && data.images.length > 0) {
              console.log('✓ صور من imageModule:', data.images.length);
            }
          }
          
          // Brand من أماكن متعددة
          if (!data.brand) {
            data.brand = productData.storeModule?.storeName ||
                        productData.sellerModule?.sellerName ||
                        productData.brandModule?.brandName;
          }
        }
      } catch (e) {
        const error = e as Error;
        console.error('خطأ في runParams:', error.message);
      }
    } else {
      console.log('✗ لم نجد window.runParams في HTML');
      // محاولة البحث عن data object مباشرة
      const dataObjMatch = html.match(/"data"\s*:\s*({[\s\S]{100,10000}?})\s*[,}]/);
      if (dataObjMatch) {
        try {
          const dataObj = JSON.parse(dataObjMatch[1]);
          console.log('✓ وجدنا data object مباشرة');
          
          if (dataObj.titleModule?.subject && !data.name) {
            data.name = dataObj.titleModule.subject;
          }
          if (dataObj.priceModule?.minAmount?.value && !data.price) {
            data.price = parseFloat(dataObj.priceModule.minAmount.value);
            data.currency = dataObj.priceModule.minAmount.currency || 'USD';
          }
          if (dataObj.imageModule?.imagePathList && Array.isArray(dataObj.imageModule.imagePathList)) {
            dataObj.imageModule.imagePathList.forEach((path: string) => {
              const fullUrl = path.startsWith('//') ? 'https:' + path : path;
              if (fullUrl.startsWith('http') && !data.images?.includes(fullUrl)) {
                data.images?.push(fullUrl);
              }
            });
          }
        } catch (e) {
          const error = e as Error;
          console.error('خطأ في تحليل data object:', error.message);
        }
      }
    }

    // استراتيجية 3: data.imageBigViewURL و imagePathList
    const imageBigViewMatch = html.match(/["']?imageBigViewURL["']?\s*:\s*\[([^\]]+)\]/);
    if (imageBigViewMatch) {
      const imageUrls = imageBigViewMatch[1].match(/["']([^"']+)["']/g);
      if (imageUrls) {
        imageUrls.forEach(url => {
          const cleanUrl = url.replace(/["']/g, '');
          const fullUrl = cleanUrl.startsWith('//') ? 'https:' + cleanUrl : cleanUrl;
          if (fullUrl.startsWith('http') && !data.images?.includes(fullUrl)) {
            data.images?.push(fullUrl);
          }
        });
        console.log('✓ صور من imageBigViewURL:', imageUrls.length);
      }
    }

    const imagePathMatch = html.match(/["']?imagePathList["']?\s*:\s*\[([^\]]+)\]/);
    if (imagePathMatch) {
      const imagePaths = imagePathMatch[1].match(/["']([^"']+)["']/g);
      if (imagePaths) {
        imagePaths.forEach(path => {
          const cleanPath = path.replace(/["']/g, '');
          const fullUrl = cleanPath.startsWith('//') ? 'https:' + cleanPath : cleanPath;
          if (fullUrl.startsWith('http') && !data.images?.includes(fullUrl)) {
            data.images?.push(fullUrl);
          }
        });
        console.log('✓ صور من imagePathList:', imagePaths.length);
      }
    }

    // استراتيجية 4: استخراج صور من CDN مباشرة
    if (!data.images || data.images.length < 3) {
      const cdnPatterns = [
        /https?:\/\/ae01\.alicdn\.com\/kf\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi,
        /https?:\/\/ae\d+\.alicdn\.com\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi,
      ];
      
      const uniqueImages = new Set<string>();
      for (const pattern of cdnPatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          const url = match[0];
          // فقط الصور الكبيرة (تجنب الأيقونات الصغيرة)
          if (!url.includes('_50x50') && 
              !url.includes('_40x40') && 
              !url.includes('avatar') &&
              !url.includes('icon')) {
            uniqueImages.add(url);
          }
        }
      }
      const cdnImages = Array.from(uniqueImages);
      data.images = [...(data.images || []), ...cdnImages];
      if (cdnImages.length > 0) {
        console.log('✓ صور من CDN:', cdnImages.length);
      }
    }

    // استراتيجية 5: استخراج السعر من patterns متعددة
    if (!data.price) {
      const pricePatterns = [
        /["']price["']\s*:\s*{[^}]*["']value["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']price["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']minPrice["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']minActivityAmount["']\s*:\s*{[^}]*["']value["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /["']minAmount["']\s*:\s*{[^}]*["']value["']\s*:\s*["']?(\d+\.?\d*)["']?/i,
        /price["\s:]+(\d+\.?\d*)/i,
      ];

      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          const price = parseFloat(match[1]);
          if (price > 0) {
            data.price = price;
            console.log('✓ السعر من pattern:', data.price);
            break;
          }
        }
      }
    }

    // استراتيجية 6: استخراج الاسم من title tag إذا لم نجده
    if (!data.name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        data.name = titleMatch[1]
          .replace(/\s*-\s*AliExpress.*$/i, '')
          .replace(/\s*\|\s*AliExpress.*$/i, '')
          .trim();
        console.log('✓ اسم المنتج من title:', data.name);
      }
    }

    // تنظيف العملة
    if (!data.currency) {
      data.currency = 'USD';
    }

    console.log('=== نتائج استخراج AliExpress ===');
    console.log('الاسم:', data.name ? '✓' : '✗');
    console.log('السعر:', data.price ? '✓' : '✗');
    console.log('الصور:', data.images?.length || 0);
    console.log('الوصف:', data.description ? '✓' : '✗');
    
  } catch (e) {
    console.error('خطأ عام في extractAliExpressData:', e);
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

// دالة للتحقق من كون الرابط هو category URL
function isCategoryUrl(url: string, hostname: string): boolean {
  const lowerUrl = url.toLowerCase();
  const lowerHost = hostname.toLowerCase();
  
  // AliExpress - أنماط مختلفة
  if (lowerHost.includes('aliexpress')) {
    return lowerUrl.includes('/category/') || 
           lowerUrl.includes('searchtext=') || 
           lowerUrl.includes('/wholesale/') ||
           lowerUrl.includes('/w/wholesale-') ||
           lowerUrl.includes('/premium/') ||
           lowerUrl.includes('/af/') ||
           (lowerUrl.includes('/store/') && lowerUrl.includes('/search'));
  }
  
  // Amazon
  if (lowerHost.includes('amazon')) {
    return lowerUrl.includes('/s?') || 
           lowerUrl.includes('/b/') || 
           lowerUrl.includes('&rh=');
  }
  
  // Shopify
  if (lowerHost.includes('myshopify') || lowerUrl.includes('/collections/')) {
    return lowerUrl.includes('/collections/');
  }
  
  return false;
}

// دالة لاستخراج روابط المنتجات من صفحة category
function extractProductLinks(html: string, hostname: string, baseUrl: string): string[] {
  const links: string[] = [];
  const seen = new Set<string>();
  
  try {
    if (hostname.includes('aliexpress')) {
      console.log('=== استخراج روابط المنتجات من AliExpress ===');
      
      // 1. JSON extraction من window.runParams
      const runParamsMatch = html.match(/window\.runParams\s*=\s*({[\s\S]*?});?\s*(?:window\.|<\/script>)/);
      if (runParamsMatch) {
        try {
          const data = JSON.parse(runParamsMatch[1]);
          console.log('✓ وجدنا window.runParams');
          
          // محاولة 1: items array
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              if (item.productId) {
                const link = `https://www.aliexpress.com/item/${item.productId}.html`;
                if (!seen.has(link)) {
                  seen.add(link);
                  links.push(link);
                }
              }
            });
            console.log(`✓ وجدنا ${data.items.length} منتج في items array`);
          }
          
          // محاولة 2: data.data.productList
          if (data.data?.productList && Array.isArray(data.data.productList)) {
            data.data.productList.forEach((item: any) => {
              if (item.productId) {
                const link = `https://www.aliexpress.com/item/${item.productId}.html`;
                if (!seen.has(link)) {
                  seen.add(link);
                  links.push(link);
                }
              }
            });
            console.log(`✓ وجدنا ${data.data.productList.length} منتج في productList`);
          }
          
          // محاولة 3: mods array
          if (data.mods && Array.isArray(data.mods)) {
            for (const mod of data.mods) {
              if (mod.content?.productList && Array.isArray(mod.content.productList)) {
                mod.content.productList.forEach((item: any) => {
                  if (item.productId) {
                    const link = `https://www.aliexpress.com/item/${item.productId}.html`;
                    if (!seen.has(link)) {
                      seen.add(link);
                      links.push(link);
                    }
                  }
                });
              }
            }
          }
        } catch (e) {
          console.error('خطأ في تحليل runParams:', e);
        }
      }
      
      // 2. Fallback: HTML links - أنماط مختلفة
      const linkPatterns = [
        /<a[^>]*href=["']([^"']*\/item\/\d+\.html[^"']*)["']/gi,
        /<a[^>]*href=["']([^"']*aliexpress\.com\/i\/\d+\.html[^"']*)["']/gi,
        /https?:\/\/[^"'\s]*aliexpress\.com\/item\/\d+\.html/gi,
        /https?:\/\/[^"'\s]*aliexpress\.com\/i\/\d+\.html/gi,
      ];
      
      for (const pattern of linkPatterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
          let link = match[1] || match[0];
          
          // تنظيف الرابط
          if (!link.startsWith('http')) {
            if (link.startsWith('//')) {
              link = 'https:' + link;
            } else if (link.startsWith('/')) {
              link = 'https://www.aliexpress.com' + link;
            }
          }
          
          // تحويل /i/ إلى /item/
          link = link.replace(/\/i\/(\d+)\.html/i, '/item/$1.html');
          
          // إزالة query parameters
          link = link.split('?')[0];
          
          if (!seen.has(link)) {
            seen.add(link);
            links.push(link);
          }
        }
      }
      
      console.log(`✓ إجمالي الروابط المستخرجة: ${links.length}`);
    }
    
    else if (hostname.includes('amazon')) {
      // 1. data-asin attributes
      const asinMatches = html.matchAll(/data-asin=["']([A-Z0-9]{10})["']/gi);
      for (const match of asinMatches) {
        const asin = match[1];
        const link = `https://www.amazon.com/dp/${asin}`;
        if (!seen.has(link)) {
          seen.add(link);
          links.push(link);
        }
      }
      
      // 2. Fallback: href links
      const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*\/dp\/[A-Z0-9]{10}[^"']*)["']/gi);
      for (const match of linkMatches) {
        const link = match[1].startsWith('http') ? match[1] : `https://www.amazon.com${match[1]}`;
        const cleanLink = link.split('?')[0];
        if (!seen.has(cleanLink)) {
          seen.add(cleanLink);
          links.push(cleanLink);
        }
      }
    }
    
    else if (hostname.includes('myshopify') || html.includes('Shopify')) {
      // 1. JSON في script tags
      const jsonMatches = html.matchAll(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const match of jsonMatches) {
        try {
          const data = JSON.parse(match[1]);
          if (data.products && Array.isArray(data.products)) {
            data.products.forEach((product: any) => {
              if (product.handle) {
                const link = `${baseUrl}/products/${product.handle}`;
                if (!seen.has(link)) {
                  seen.add(link);
                  links.push(link);
                }
              }
            });
          }
        } catch (e) {
          // تجاهل
        }
      }
      
      // 2. HTML links
      const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']*\/products\/[^"'\/]+)["']/gi);
      for (const match of linkMatches) {
        const link = match[1].startsWith('http') ? match[1] : `${baseUrl}${match[1]}`;
        const cleanLink = link.split('?')[0];
        if (!seen.has(cleanLink)) {
          seen.add(cleanLink);
          links.push(cleanLink);
        }
      }
    }
  } catch (error) {
    console.error('Error extracting product links:', error);
  }
  
  return links.slice(0, 10);
}

// دالة لاستخراج بيانات منتج واحد
async function scrapeProductData(url: string): Promise<{ success: boolean; product?: ProductData; error?: string; url: string }> {
  try {
    const result = await followRedirects(url);
    const html = result.html;
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    let productData: Partial<ProductData> = {};
    
    // استخراج البيانات حسب الموقع
    if (hostname.includes('aliexpress')) {
      productData = extractAliExpressData(html);
    } else if (hostname.includes('amazon')) {
      productData = extractAmazonData(html);
    } else if (hostname.includes('myshopify') || html.includes('Shopify.theme') || html.includes('cdn.shopify')) {
      productData = extractShopifyData(html);
    }
    
    // Meta tags
    const metaData = extractMetaTags(html);
    productData = { ...metaData, ...productData };
    
    // Gallery images
    const galleryImages = extractImageGallery(html);
    if (galleryImages.length > 0) {
      productData.images = [...(productData.images || []), ...galleryImages];
    }
    
    // Deduplication
    if (productData.images && productData.images.length > 0) {
      productData.images = deduplicateAndFilterImages(productData.images);
    }
    
    // Fallback
    if (!productData.name || !productData.price) {
      const fallbackData = extractFallbackData(html);
      productData = { ...fallbackData, ...productData };
    }
    
    // التحقق من البيانات الأساسية
    if (!productData.name) {
      return {
        success: false,
        error: 'لم يتم العثور على اسم المنتج',
        url
      };
    }
    
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
    
    return {
      success: true,
      product: cleanData,
      url
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      url
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, imagesOnly = false, maxImages = 20 } = await req.json();
    
    console.log('خيارات الاستيراد:', { imagesOnly, maxImages });

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

    const hostname = parsedUrl.hostname.toLowerCase();
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    
    // ============ إذا كان الوضع "صور فقط" ============
    if (imagesOnly) {
      console.log('🖼️ وضع جلب الصور فقط - تنفيذ سريع');
      
      const { html, finalUrl } = await followRedirects(url);
      
      // استخراج الصور فقط
      let allImages: string[] = [];
      
      // استراتيجية خاصة حسب الموقع
      if (hostname.includes('aliexpress')) {
        const aliData = extractAliExpressData(html);
        allImages = aliData.images || [];
        console.log(`✓ AliExpress: ${allImages.length} صورة`);
      } else if (hostname.includes('amazon')) {
        const amzData = extractAmazonData(html);
        allImages = amzData.images || [];
        console.log(`✓ Amazon: ${allImages.length} صورة`);
      } else {
        // استخراج عام للصور
        allImages = extractImageGallery(html);
        if (allImages.length < 5) {
          const fallbackData = extractFallbackData(html);
          allImages = [...allImages, ...(fallbackData.images || [])];
        }
        console.log(`✓ عام: ${allImages.length} صورة`);
      }
      
      // فلترة وإزالة المكررات
      const uniqueImages = deduplicateAndFilterImages(allImages);
      const limitedImages = uniqueImages.slice(0, maxImages);
      
      console.log(`✓ النتيجة النهائية: ${limitedImages.length} صورة`);
      
      return new Response(
        JSON.stringify({
          success: true,
          isBulkImport: false,
          data: {
            name: 'صور المنتج',
            description: '',
            price: 0,
            currency: 'USD',
            images: limitedImages,
            incomplete: false,
          },
          warnings: limitedImages.length === 0 ? ['لم يتم العثور على صور'] : [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // ============ اكتشاف نوع الرابط ============
    const isCategoryPage = isCategoryUrl(url, hostname);
    
    if (isCategoryPage) {
      // ====== معالجة Category URL (Bulk Import) ======
      console.log('Detected category URL, extracting product links...');
      
      let result;
      try {
        result = await followRedirects(url);
      } catch (error) {
        console.error('Error fetching category page:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'FETCH_FAILED',
            message: error instanceof Error ? error.message : 'فشل في جلب صفحة القسم',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      const productLinks = extractProductLinks(result.html, hostname, baseUrl);
      
      if (productLinks.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NO_PRODUCTS_FOUND',
            message: 'لم يتم العثور على منتجات في هذه الصفحة',
            suggestion: 'تأكد من أن الرابط يحتوي على منتجات'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Found ${productLinks.length} products, starting scraping...`);
      
      const results = [];
      for (const productUrl of productLinks) {
        console.log(`Scraping: ${productUrl}`);
        const result = await scrapeProductData(productUrl);
        results.push(result);
        
        // تأخير لتجنب Rate Limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`Bulk import complete: ${successful} successful, ${failed} failed`);
      
      return new Response(
        JSON.stringify({
          success: true,
          isBulkImport: true,
          data: results,
          summary: {
            total: results.length,
            successful,
            failed
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else {
      // ====== معالجة Product URL العادي (Single Import) ======
      console.log('Detected product URL, scraping single product...');
      
      const result = await scrapeProductData(url);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'EXTRACTION_FAILED',
            message: result.error || 'فشل في استخراج بيانات المنتج',
            url: result.url
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          isBulkImport: false,
          data: result.product,
          warnings: result.product?.incomplete ? ['بعض البيانات قد تكون ناقصة، يرجى مراجعتها'] : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
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
