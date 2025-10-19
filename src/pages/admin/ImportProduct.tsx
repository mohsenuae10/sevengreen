import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link as LinkIcon, Download, Check, Sparkles, X, Star } from 'lucide-react';

interface ProductImage {
  url: string;
  isPrimary: boolean;
  id: string;
}

interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];
  brand?: string;
  category?: string;
  incomplete?: boolean;
}

interface BulkImportResult {
  success: boolean;
  product?: ScrapedProduct;
  error?: string;
  url: string;
}

// سيتم تحميل الأقسام من قاعدة البيانات

export default function ImportProduct() {
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedProduct | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isBulkImport, setIsBulkImport] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkImportResult[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [detectedUrlType, setDetectedUrlType] = useState<'single' | 'category' | null>(null);
  const [categories, setCategories] = useState<Array<{ name_ar: string; slug: string }>>([]);
  
  // بيانات النموذج القابلة للتعديل
  const [formData, setFormData] = useState({
    name_ar: '',
    description_ar: '',
    price: 0,
    category: '',
    stock_quantity: 0,
    made_in: '',
    ingredients_ar: '',
    benefits_ar: '',
    how_to_use_ar: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const { toast } = useToast();

  // تحميل الأقسام من قاعدة البيانات
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name_ar, slug')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const detectUrlType = (url: string): 'single' | 'category' | null => {
    if (!url.trim()) return null;
    
    try {
      const urlObj = new URL(url);
      const lowerUrl = url.toLowerCase();
      const hostname = urlObj.hostname.toLowerCase();
      
      // AliExpress
      if (hostname.includes('aliexpress')) {
        if (lowerUrl.includes('/category/') || 
            lowerUrl.includes('searchtext=') || 
            lowerUrl.includes('/wholesale/')) {
          return 'category';
        }
        return 'single';
      }
      
      // Amazon
      if (hostname.includes('amazon')) {
        if (lowerUrl.includes('/s?') || 
            lowerUrl.includes('/b/') || 
            lowerUrl.includes('&rh=')) {
          return 'category';
        }
        return 'single';
      }
      
      // Shopify
      if (hostname.includes('myshopify') || lowerUrl.includes('/collections/')) {
        if (lowerUrl.includes('/collections/')) {
          return 'category';
        }
        return 'single';
      }
      
      // Default: assume single product
      return 'single';
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const type = detectUrlType(productUrl);
    setDetectedUrlType(type);
  }, [productUrl]);

  const handleFetchProduct = async () => {
    if (!productUrl.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال رابط المنتج أو القسم',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsBulkImport(false);
    setBulkResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl },
      });

      if (error) throw error;

      if (!data.success) {
        const errorMsg = data.message || data.error || 'فشل في جلب بيانات المنتج';
        const suggestion = data.suggestion || '';
        
        toast({
          title: 'فشل في جلب البيانات',
          description: (
            <div className="space-y-2">
              <p>{errorMsg}</p>
              {suggestion && <p className="text-sm opacity-80">{suggestion}</p>}
              {data.url && (
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm underline block mt-2"
                >
                  فتح الرابط في نافذة جديدة
                </a>
              )}
            </div>
          ),
          variant: 'destructive',
          duration: 8000,
        });
        return;
      }

      // ====== معالجة Bulk Import ======
      if (data.isBulkImport) {
        setIsBulkImport(true);
        const processedResults = data.data.map((result: any) => {
          if (result.success && result.product) {
            const rawImages = result.product.images || [];
            const processedImages: ProductImage[] = rawImages.map((urlOrImg: string | ProductImage, index: number) => {
              if (typeof urlOrImg === 'string') {
                return {
                  url: urlOrImg,
                  isPrimary: index === 0,
                  id: Math.random().toString(36).substring(7),
                };
              }
              return urlOrImg;
            });
            
            return {
              ...result,
              product: {
                ...result.product,
                images: processedImages,
              },
            };
          }
          return result;
        });
        setBulkResults(processedResults);
        
        // تحديد المنتجات الناجحة تلقائياً
        const successfulIndices = new Set<number>(
          processedResults
            .map((result: BulkImportResult, index: number) => result.success ? index : -1)
            .filter((i: number) => i !== -1)
        );
        setSelectedProducts(successfulIndices);
        
        toast({
          title: 'نجح الاستيراد الجماعي',
          description: `تم جلب ${data.summary.successful} منتج من أصل ${data.summary.total}`,
        });
        return;
      }

      // ====== معالجة Single Import (الكود الحالي) ======
      const rawProduct = data.data;
      const product: ScrapedProduct = {
        ...rawProduct,
        images: (rawProduct.images || []).map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
          id: Math.random().toString(36).substring(7),
        })),
      };
      setScrapedData(product);
      
      const priceInSAR = product.price ? Math.ceil(product.price * 3.75) : 0;
      
      setFormData({
        name_ar: product.name || '',
        description_ar: product.description || '',
        price: priceInSAR,
        category: product.category || '',
        stock_quantity: 10,
        made_in: product.brand || '',
        ingredients_ar: '',
        benefits_ar: '',
        how_to_use_ar: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
      });

      const warnings = data.warnings || [];
      toast({
        title: product.incomplete ? 'تم جلب البيانات (جزئياً)' : 'نجح',
        description: (
          <div className="space-y-1">
            <p>تم جلب بيانات المنتج</p>
            {warnings.map((warning: string, idx: number) => (
              <p key={idx} className="text-sm opacity-80">⚠️ {warning}</p>
            ))}
          </div>
        ),
        variant: product.incomplete ? 'default' : 'default',
      });
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: 'خطأ',
        description: (
          <div className="space-y-2">
            <p>{error.message || 'فشل في جلب بيانات المنتج'}</p>
            <p className="text-sm opacity-80">تأكد من الاتصال بالإنترنت وصحة الرابط</p>
          </div>
        ),
        variant: 'destructive',
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAllFields = async () => {
    if (!formData.name_ar) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إدخال اسم المنتج أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          type: 'all_fields',
          productName: formData.name_ar,
          category: formData.category,
          brand: formData.made_in,
        }
      });

      if (error) throw error;
      
      setFormData({ 
        ...formData, 
        description_ar: data.description,
        ingredients_ar: data.ingredients,
        benefits_ar: data.benefits,
        how_to_use_ar: data.howToUse
      });
      toast({ title: '✨ تم توليد جميع الحقول بنجاح' });
    } catch (error: any) {
      console.error('Generate all fields error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل توليد المحتوى',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateField = async (fieldType: string, fieldName: string) => {
    if (!formData.name_ar) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إدخال اسم المنتج أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingField(fieldType);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          type: fieldType,
          productName: formData.name_ar,
          category: formData.category,
          brand: formData.made_in,
        }
      });

      if (error) throw error;
      
      setFormData({ ...formData, [fieldName]: data.content });
      toast({ title: `✨ تم توليد ${fieldType === 'description' ? 'الوصف' : fieldType === 'ingredients' ? 'المكونات' : fieldType === 'benefits' ? 'الفوائد' : 'طريقة الاستخدام'} بنجاح` });
    } catch (error: any) {
      console.error('Generate field error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل توليد المحتوى',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingField(null);
    }
  };

  const handleGenerateDescription = async () => {
    await handleGenerateField('description', 'description_ar');
  };

  const handleGenerateSEO = async () => {
    if (!formData.name_ar) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إدخال اسم المنتج أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          type: 'seo',
          productName: formData.name_ar,
          category: formData.category,
          brand: formData.made_in,
          existingDescription: formData.description_ar,
        }
      });

      if (error) throw error;
      
      setFormData({ 
        ...formData, 
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        seo_keywords: data.seoKeywords
      });
      toast({ title: '🎯 تم توليد بيانات SEO بنجاح' });
    } catch (error: any) {
      console.error('Generate SEO error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل توليد SEO',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name_ar || !formData.category) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء الحقول المطلوبة (الاسم والتصنيف)',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // إنشاء المنتج
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name_ar: formData.name_ar,
          description_ar: formData.description_ar,
          price: formData.price,
          category: formData.category,
          stock_quantity: formData.stock_quantity,
          made_in: formData.made_in,
          ingredients_ar: formData.ingredients_ar,
          benefits_ar: formData.benefits_ar,
          how_to_use_ar: formData.how_to_use_ar,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: formData.seo_keywords,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // حفظ الصور
      if (scrapedData?.images && scrapedData.images.length > 0) {
        // ترتيب الصور: الصورة الرئيسية أولاً
        const sortedImages = [...scrapedData.images].sort((a, b) => 
          (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
        );

        const imagePromises = sortedImages.map(async (img, index) => {
          try {
            // تحميل الصورة من الرابط الأصلي
            const imageResponse = await fetch(img.url);
            const imageBlob = await imageResponse.blob();
            
            // رفع الصورة إلى Supabase Storage
            const fileName = `${product.id}-${index}-${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, imageBlob, {
                contentType: 'image/jpeg',
                upsert: false,
              });

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
              return null;
            }

            // الحصول على الرابط العام للصورة
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);

            // إضافة سجل الصورة في قاعدة البيانات
            await supabase.from('product_images').insert({
              product_id: product.id,
              image_url: publicUrl,
              is_primary: img.isPrimary,
              display_order: index,
            });

            return publicUrl;
          } catch (error) {
            console.error('Error processing image:', error);
            return null;
          }
        });

        await Promise.all(imagePromises);
      }

      toast({
        title: 'نجح',
        description: 'تم حفظ المنتج بنجاح',
      });

      // إعادة تعيين النموذج
      setProductUrl('');
      setScrapedData(null);
      setFormData({
        name_ar: '',
        description_ar: '',
        price: 0,
        category: '',
        stock_quantity: 0,
        made_in: '',
        ingredients_ar: '',
        benefits_ar: '',
        how_to_use_ar: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
      });
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حفظ المنتج',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBulkProducts = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'تنبيه',
        description: 'الرجاء اختيار منتج واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const index of Array.from(selectedProducts)) {
        const result = bulkResults[index];
        if (!result.success || !result.product) continue;

        const product = result.product;
        const priceInSAR = product.price ? Math.ceil(product.price * 3.75) : 0;

        try {
          // حفظ المنتج
          const { data: savedProduct, error: productError } = await supabase
            .from('products')
            .insert({
              name_ar: product.name,
              description_ar: product.description,
              price: priceInSAR,
              category: product.category || '',
              stock_quantity: 10,
              made_in: product.brand || '',
              is_active: true,
            })
            .select()
            .single();

          if (productError) throw productError;

          // حفظ الصور
          if (product.images && product.images.length > 0) {
            // ترتيب الصور: الصورة الرئيسية أولاً
            const sortedImages = [...product.images].sort((a, b) => 
              (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
            );

            const imagePromises = sortedImages.slice(0, 5).map(async (img, imgIndex) => {
              try {
                const imageResponse = await fetch(img.url);
                const imageBlob = await imageResponse.blob();
                
                const fileName = `${savedProduct.id}-${imgIndex}-${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage
                  .from('product-images')
                  .upload(fileName, imageBlob, {
                    contentType: 'image/jpeg',
                    upsert: false,
                  });

                if (uploadError) return null;

                const { data: { publicUrl } } = supabase.storage
                  .from('product-images')
                  .getPublicUrl(fileName);

                await supabase.from('product_images').insert({
                  product_id: savedProduct.id,
                  image_url: publicUrl,
                  is_primary: img.isPrimary,
                  display_order: imgIndex,
                });

                return publicUrl;
              } catch (error) {
                console.error('Error processing image:', error);
                return null;
              }
            });

            await Promise.all(imagePromises);
          }

          successCount++;
          
          // تأخير لتجنب الضغط على القاعدة
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error('Error saving product:', error);
          failCount++;
        }
      }

      toast({
        title: 'اكتمل الحفظ الجماعي',
        description: `تم حفظ ${successCount} منتج بنجاح${failCount > 0 ? `، فشل ${failCount}` : ''}`,
      });

      // إعادة تعيين
      setIsBulkImport(false);
      setBulkResults([]);
      setSelectedProducts(new Set());
      setProductUrl('');
      
    } catch (error: any) {
      console.error('Error in bulk save:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حفظ المنتجات',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">استيراد منتج</h1>
          <p className="text-muted-foreground mt-2">
            استيراد منتج من رابط خارجي (AliExpress، Amazon، وغيرها)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              رابط المنتج
            </CardTitle>
            <CardDescription>
              <div className="space-y-2">
                <p>الصق رابط المنتج أو رابط القسم من الموقع الخارجي</p>
                <div className="text-xs opacity-70 space-y-1 border-r-2 border-muted pr-2 mt-2">
                  <p className="flex items-center gap-1">
                    <span className="text-blue-600 dark:text-blue-400">📦</span>
                    <span className="font-medium">منتج واحد:</span>
                    <code className="text-[10px] bg-muted px-1 rounded">aliexpress.com/item/...</code>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-purple-600 dark:text-purple-400">📁</span>
                    <span className="font-medium">قسم كامل:</span>
                    <code className="text-[10px] bg-muted px-1 rounded">aliexpress.com/category/...</code>
                    <span className="text-[10px] opacity-60">(حتى 10 منتجات)</span>
                  </p>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://www.aliexpress.com/item/..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  disabled={isLoading}
                  dir="ltr"
                  className="flex-1"
                />
                <Button
                  onClick={handleFetchProduct}
                  disabled={isLoading || !productUrl.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الجلب...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 ml-2" />
                      جلب البيانات
                    </>
                  )}
                </Button>
              </div>
              
              {/* URL Type Indicator */}
              {detectedUrlType && productUrl.trim() && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
                  detectedUrlType === 'category'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                    : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                }`}>
                  <span className="text-lg">{detectedUrlType === 'category' ? '📁' : '📦'}</span>
                  <span className="font-medium">
                    {detectedUrlType === 'category' 
                      ? 'تم اكتشاف: رابط قسم - سيتم استيراد حتى 10 منتجات' 
                      : 'تم اكتشاف: رابط منتج واحد'}
                  </span>
                </div>
              )}
            </div>

            {scrapedData && (
              <div className={`rounded-lg border p-4 ${
                scrapedData.incomplete 
                  ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
                  : 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
              }`}>
                <div className={`flex items-center gap-2 ${
                  scrapedData.incomplete 
                    ? 'text-yellow-800 dark:text-yellow-200'
                    : 'text-green-800 dark:text-green-200'
                }`}>
                  <Check className="h-5 w-5" />
                  <span className="font-medium">
                    {scrapedData.incomplete ? 'تم جلب البيانات (مراجعة مطلوبة)' : 'تم جلب البيانات بنجاح'}
                  </span>
                </div>
                <div className={`text-sm mt-1 space-y-1 ${
                  scrapedData.incomplete 
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  <p>تم العثور على {scrapedData.images.length} صورة</p>
                  {scrapedData.incomplete && (
                    <p className="font-medium">⚠️ يرجى مراجعة البيانات وتعديلها حسب الحاجة</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isBulkImport && bulkResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>المنتجات المستوردة ({bulkResults.length})</CardTitle>
              <CardDescription>
                اختر المنتجات التي تريد حفظها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bulkResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.success
                        ? 'border-green-200 bg-green-50 dark:bg-green-950'
                        : 'border-red-200 bg-red-50 dark:bg-red-950'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {result.success && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(index)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedProducts);
                            if (e.target.checked) {
                              newSelected.add(index);
                            } else {
                              newSelected.delete(index);
                            }
                            setSelectedProducts(newSelected);
                          }}
                          className="mt-1"
                        />
                      )}
                      
                      <div className="flex-1">
                        {result.success && result.product ? (
                          <>
                            <h3 className="font-semibold">{result.product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              السعر: ${result.product.price} | الصور: {result.product.images.length}
                            </p>
                            {result.product.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {result.product.images.slice(0, 3).map((img) => (
                                  <div key={img.id} className="relative group">
                                    <div className="aspect-square rounded overflow-hidden border">
                                      <img
                                        src={img.url}
                                        alt={result.product!.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    
                                    {/* زر الحذف */}
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setBulkResults(prev => prev.map((r, i) => 
                                          i === index && r.product
                                            ? {...r, product: {...r.product, images: r.product.images.filter(im => im.id !== img.id)}}
                                            : r
                                        ));
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>

                                    {/* زر تعيين كصورة رئيسية */}
                                    <Button
                                      type="button"
                                      variant={img.isPrimary ? "default" : "secondary"}
                                      size="icon"
                                      className="absolute -top-1 -left-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setBulkResults(prev => prev.map((r, i) => 
                                          i === index && r.product
                                            ? {...r, product: {...r.product, images: r.product.images.map(im => ({...im, isPrimary: im.id === img.id}))}}
                                            : r
                                        ));
                                      }}
                                    >
                                      <Star className={`w-2 h-2 ${img.isPrimary ? 'fill-current' : ''}`} />
                                    </Button>

                                    {/* مؤشر الصورة الرئيسية */}
                                    {img.isPrimary && (
                                      <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">
                                        رئيسية
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-red-600">
                            <p className="font-semibold">فشل الاستيراد</p>
                            <p className="text-sm">{result.error}</p>
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline"
                            >
                              فتح الرابط
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleSaveBulkProducts}
                  disabled={isSaving || selectedProducts.size === 0}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    `حفظ المنتجات المحددة (${selectedProducts.size})`
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkImport(false);
                    setBulkResults([]);
                    setSelectedProducts(new Set());
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المنتج</CardTitle>
              <CardDescription>
                راجع وعدل البيانات المستوردة قبل الحفظ
              </CardDescription>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleGenerateAllFields}
                disabled={!formData.name_ar || isGenerating}
                className="mt-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    توليد كل الحقول بالذكاء الاصطناعي
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* معاينة الصور */}
              {scrapedData.images.length > 0 && (
                <div>
                  <Label>الصور ({scrapedData.images.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {scrapedData.images.map((img, idx) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-border">
                          <img
                            src={img.url}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        
                        {/* زر الحذف */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setScrapedData(prev => prev ? {
                              ...prev,
                              images: prev.images.filter(i => i.id !== img.id)
                            } : null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>

                        {/* زر تعيين كصورة رئيسية */}
                        <Button
                          type="button"
                          variant={img.isPrimary ? "default" : "secondary"}
                          size="icon"
                          className="absolute -top-2 -left-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setScrapedData(prev => prev ? {
                              ...prev,
                              images: prev.images.map(i => ({
                                ...i,
                                isPrimary: i.id === img.id
                              }))
                            } : null);
                          }}
                        >
                          <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-current' : ''}`} />
                        </Button>

                        {/* مؤشر الصورة الرئيسية */}
                        {img.isPrimary && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            رئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {scrapedData.images.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      اضغط على <Star className="w-3 h-3 inline" /> لتعيين الصورة الرئيسية، أو <X className="w-3 h-3 inline" /> للحذف
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="اسم المنتج بالعربية"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={!formData.name_ar || isGeneratingField === 'description'}
                    >
                      {isGeneratingField === 'description' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التوليد...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 ml-2" />
                          توليد بالذكاء الاصطناعي
                        </>
                      )}
                    </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="ingredients">المكونات</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateField('ingredients', 'ingredients_ar')}
                      disabled={!formData.name_ar || isGeneratingField === 'ingredients'}
                    >
                      {isGeneratingField === 'ingredients' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التوليد...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 ml-2" />
                          توليد بالذكاء الاصطناعي
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients_ar}
                    onChange={(e) => setFormData({ ...formData, ingredients_ar: e.target.value })}
                    placeholder="مكونات المنتج..."
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="benefits">الفوائد</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateField('benefits', 'benefits_ar')}
                      disabled={!formData.name_ar || isGeneratingField === 'benefits'}
                    >
                      {isGeneratingField === 'benefits' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التوليد...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 ml-2" />
                          توليد بالذكاء الاصطناعي
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="benefits"
                    value={formData.benefits_ar}
                    onChange={(e) => setFormData({ ...formData, benefits_ar: e.target.value })}
                    placeholder="فوائد المنتج..."
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="how_to_use">طريقة الاستخدام</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateField('how_to_use', 'how_to_use_ar')}
                      disabled={!formData.name_ar || isGeneratingField === 'how_to_use'}
                    >
                      {isGeneratingField === 'how_to_use' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري التوليد...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 ml-2" />
                          توليد بالذكاء الاصطناعي
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="how_to_use"
                    value={formData.how_to_use_ar}
                    onChange={(e) => setFormData({ ...formData, how_to_use_ar: e.target.value })}
                    placeholder="طريقة استخدام المنتج..."
                    rows={3}
                  />
                </div>
                  <Textarea
                    id="description"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="وصف المنتج بالعربية"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (ريال) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                    {scrapedData.price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        السعر الأصلي: {scrapedData.price.toFixed(2)} {scrapedData.currency}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="stock">الكمية المتوفرة *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.slug} value={cat.slug}>
                            {cat.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="made_in">بلد الصنع / العلامة التجارية</Label>
                    <Input
                      id="made_in"
                      value={formData.made_in}
                      onChange={(e) => setFormData({ ...formData, made_in: e.target.value })}
                      placeholder="مثال: الصين، كوريا"
                    />
                  </div>
                </div>
              </div>

              {/* قسم SEO */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">تحسين محركات البحث (SEO)</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSEO}
                    disabled={!formData.name_ar || isGeneratingSEO}
                  >
                    {isGeneratingSEO ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري التوليد...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 ml-2" />
                        توليد SEO تلقائياً
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <Label htmlFor="seo_title">عنوان SEO</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="عنوان محسّن لمحركات البحث (50-60 حرف)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seo_title.length}/60 حرف
                  </p>
                </div>

                <div>
                  <Label htmlFor="seo_description">وصف SEO</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="وصف محسّن لمحركات البحث (150-160 حرف)"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seo_description.length}/160 حرف
                  </p>
                </div>

                <div>
                  <Label htmlFor="seo_keywords">الكلمات المفتاحية</Label>
                  <Input
                    id="seo_keywords"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    placeholder="كلمة1, كلمة2, كلمة3"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ المنتج'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setScrapedData(null);
                    setProductUrl('');
                    setFormData({
                      name_ar: '',
                      description_ar: '',
                      price: 0,
                      category: '',
                      stock_quantity: 0,
                      made_in: '',
                      ingredients_ar: '',
                      benefits_ar: '',
                      how_to_use_ar: '',
                      seo_title: '',
                      seo_description: '',
                      seo_keywords: '',
                    });
                  }}
                  disabled={isSaving}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
