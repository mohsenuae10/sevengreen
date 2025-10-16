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

// دالة خاصة لاستخراج بيانات AliExpress
function extractAliExpressData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  try {
    // AliExpress يستخدم JSON-LD في الصفحة
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
    if (jsonLdMatch) {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      if (jsonData.name) data.name = jsonData.name;
      if (jsonData.description) data.description = jsonData.description;
      if (jsonData.offers?.price) data.price = parseFloat(jsonData.offers.price);
      if (jsonData.offers?.priceCurrency) data.currency = jsonData.offers.priceCurrency;
      if (jsonData.image) {
        if (Array.isArray(jsonData.image)) {
          data.images = jsonData.image;
        } else {
          data.images = [jsonData.image];
        }
      }
      if (jsonData.brand?.name) data.brand = jsonData.brand.name;
    }

    // محاولة استخراج الصور من imagePathList
    const imagePathMatch = html.match(/imagePathList["']?\s*:\s*\[([^\]]+)\]/);
    if (imagePathMatch) {
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
  } catch (e) {
    console.error('Error parsing AliExpress data:', e);
  }

  return data;
}

// دالة خاصة لاستخراج بيانات Amazon
function extractAmazonData(html: string): Partial<ProductData> {
  const data: Partial<ProductData> = {
    images: [],
  };

  try {
    // استخراج العنوان من span#productTitle
    const titleMatch = html.match(/<span[^>]*id=["']productTitle["'][^>]*>([^<]+)<\/span>/i);
    if (titleMatch) data.name = titleMatch[1].trim();

    // استخراج السعر
    const priceMatch = html.match(/<span[^>]*class=["'][^"']*a-price-whole[^"']*["'][^>]*>([^<]+)<\/span>/i) ||
                      html.match(/["']priceAmount["']\s*:\s*(\d+\.?\d*)/i);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/[,\s]/g, ''));
    }

    // استخراج الصور من data structure
    const imageDataMatch = html.match(/["']colorImages["']\s*:\s*\{[^}]*["']initial["']\s*:\s*\[([^\]]+)\]/);
    if (imageDataMatch) {
      const imageUrls = imageDataMatch[1].matchAll(/["']hiRes["']\s*:\s*["']([^"']+)["']/g);
      for (const match of imageUrls) {
        if (match[1] && match[1] !== 'null') {
          data.images?.push(match[1]);
        }
      }
    }

    // استخراج الوصف
    const descMatch = html.match(/<div[^>]*id=["']feature-bullets["'][^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/div>/i);
    if (descMatch) {
      const bullets = descMatch[1].match(/<span[^>]*>([^<]+)<\/span>/gi);
      if (bullets) {
        data.description = bullets.map(b => b.replace(/<[^>]+>/g, '').trim()).join(' ');
      }
    }
  } catch (e) {
    console.error('Error parsing Amazon data:', e);
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
      throw new Error('URL is required');
    }

    // التحقق من صحة الرابط
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // الحماية من SSRF - السماح فقط بروتوكولات HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    console.log('Fetching product from:', url);

    // جلب محتوى الصفحة
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const hostname = parsedUrl.hostname.toLowerCase();

    let productData: Partial<ProductData> = {};

    // تحديد نوع الموقع واستخراج البيانات المناسبة
    if (hostname.includes('aliexpress')) {
      console.log('Detected AliExpress');
      productData = extractAliExpressData(html);
    } else if (hostname.includes('amazon')) {
      console.log('Detected Amazon');
      productData = extractAmazonData(html);
    }

    // استخراج البيانات العامة من meta tags كـ fallback
    const metaData = extractMetaTags(html);
    productData = {
      ...metaData,
      ...productData, // البيانات المستخرجة بشكل خاص لها الأولوية
    };

    // التأكد من وجود البيانات الأساسية
    if (!productData.name) {
      throw new Error('Could not extract product name from the page');
    }

    // تنظيف البيانات
    const cleanData: ProductData = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || 0,
      currency: productData.currency || 'USD',
      images: (productData.images || []).filter(img => img && img.startsWith('http')),
      specifications: productData.specifications,
      brand: productData.brand,
      category: productData.category,
    };

    console.log('Successfully extracted product data:', cleanData.name);

    return new Response(
      JSON.stringify({
        success: true,
        data: cleanData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error scraping product:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape product';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
