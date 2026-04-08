import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link as LinkIcon, Download, Check, Sparkles, X, Star, Upload, FileSpreadsheet, StopCircle, FolderOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

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
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
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
  const [fileImportProgress, setFileImportProgress] = useState<{
    total: number;
    current: number;
    urls: string[];
    results: BulkImportResult[];
  } | null>(null);
  const [isFileImporting, setIsFileImporting] = useState(false);
  const [importMode, setImportMode] = useState<'full' | 'images-only'>('full');
  const [optimizeProductName, setOptimizeProductName] = useState(false);
  const [isOptimizingName, setIsOptimizingName] = useState(false);
  const [isOptimizingNameManual, setIsOptimizingNameManual] = useState(false);

  // ======= حالة استيراد القسم (Category Import) =======
  const [categoryUrl, setCategoryUrl] = useState('');
  const [categoryLinks, setCategoryLinks] = useState<string[]>([]);
  const [isFetchingLinks, setIsFetchingLinks] = useState(false);
  const [categoryImportProgress, setCategoryImportProgress] = useState<{
    current: number;
    total: number;
    results: Array<{ url: string; status: 'pending' | 'scraping' | 'saving' | 'done' | 'error'; name?: string; error?: string; imageUrl?: string }>;
  } | null>(null);
  const [isCategoryImporting, setIsCategoryImporting] = useState(false);
  const [categoryTargetSlug, setCategoryTargetSlug] = useState('');
  const abortCategoryRef = useRef(false);

  // بيانات النموذج القابلة للتعديل
  const [formData, setFormData] = useState({
    name_ar: '',
    description_ar: '',
    price: 0,
    category: '',
    category_ar: '',
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
      
      // AliExpress - دعم جميع أنماط الروابط
      if (hostname.includes('aliexpress')) {
        // روابط الفئات
        if (lowerUrl.includes('/category/') || 
            lowerUrl.includes('searchtext=') || 
            lowerUrl.includes('/wholesale/') ||
            lowerUrl.includes('/w/wholesale-') ||
            lowerUrl.includes('/premium/') ||
            lowerUrl.includes('/af/') ||
            (lowerUrl.includes('/store/') && lowerUrl.includes('/search'))) {
          return 'category';
        }
        // روابط المنتجات الفردية
        if (lowerUrl.includes('/item/') || 
            lowerUrl.includes('/i/') ||
            lowerUrl.match(/\/\d+\.html/)) {
          return 'single';
        }
        // روابط قصيرة (a.aliexpress.com, s.click.aliexpress.com)
        if (hostname.includes('a.aliexpress.com') || 
            hostname.includes('s.click.aliexpress.com') ||
            hostname.includes('sale.aliexpress.com')) {
          return 'single'; // عادة تقود إلى منتج واحد
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
      
      // Salla stores and generic e-commerce category patterns
      // /c{digits} pattern (e.g., careandideas.com/ar/hair-care-tools/c24077328)
      if (lowerUrl.match(/\/c\d{5,}/)) {
        return 'category';
      }
      // Salla category patterns
      if (lowerUrl.includes('/categories/') || lowerUrl.includes('/cat/')) {
        return 'category';
      }
      // Generic /category/ pattern
      if (lowerUrl.includes('/category/')) {
        return 'category';
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
        body: { 
          url: productUrl,
          imagesOnly: importMode === 'images-only',
          maxImages: 20
        },
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
      
      let optimizedName = product.name || '';
      
      // تحسين الاسم بالذكاء الاصطناعي إذا كان الخيار مفعلاً
      if (optimizeProductName && product.name) {
        setIsOptimizingName(true);
        try {
          const { data: nameData, error: nameError } = await supabase.functions.invoke('generate-product-content', {
            body: {
              type: 'optimize_name',
              originalName: product.name,
              category: product.category,
              brand: product.brand,
            }
          });

          if (!nameError && nameData?.content) {
            optimizedName = nameData.content;
            toast({ 
              title: '✨ تم تحسين اسم المنتج',
              description: 'تم إنشاء اسم عربي محسّن وصديق للـ SEO',
            });
          }
        } catch (error) {
          console.error('Error optimizing name:', error);
        } finally {
          setIsOptimizingName(false);
        }
      }
      
      // جلب اسم الفئة بالعربي
      const matchedCategory = categories.find(c => c.slug === product.category);
      
      setFormData({
        name_ar: optimizedName,
        description_ar: product.description || '',
        price: priceInSAR,
        category: product.category || '',
        category_ar: matchedCategory?.name_ar || '',
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

  const handleOptimizeProductName = async () => {
    if (!formData.name_ar) {
      toast({
        title: 'تنبيه',
        description: 'يرجى إدخال اسم المنتج أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsOptimizingNameManual(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          type: 'optimize_name',
          originalName: formData.name_ar,
          category: formData.category,
          brand: formData.made_in,
        }
      });

      if (error) throw error;
      
      setFormData({ ...formData, name_ar: data.content });
      toast({ 
        title: '✨ تم تحسين اسم المنتج',
        description: 'تم إنشاء اسم عربي محسّن وصديق للـ SEO',
      });
    } catch (error: any) {
      console.error('Optimize name error:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل تحسين الاسم',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizingNameManual(false);
    }
  };

  // ======= استيراد قسم كامل - الخطوة 1: جلب الروابط فقط =======
  const handleFetchCategoryLinks = async () => {
    if (!categoryUrl.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال رابط القسم', variant: 'destructive' });
      return;
    }

    setIsFetchingLinks(true);
    setCategoryLinks([]);
    setCategoryImportProgress(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: categoryUrl.trim(), linksOnly: true },
      });

      if (error) throw error;

      if (data.linksOnly && data.links?.length > 0) {
        setCategoryLinks(data.links);
        toast({
          title: 'تم جلب روابط المنتجات',
          description: `تم العثور على ${data.count} منتج في هذا القسم`,
        });
      } else if (!data.success) {
        toast({
          title: 'فشل',
          description: data.message || 'لم يتم العثور على منتجات في هذا الرابط',
          variant: 'destructive',
        });
      } else {
        // linksOnly returned but with 0 links, or unexpected response
        toast({
          title: 'لم يتم العثور على منتجات',
          description: 'لم يتم العثور على روابط منتجات في هذه الصفحة. تأكد أن الرابط هو رابط قسم يحتوي على منتجات.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching category links:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في جلب روابط القسم',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingLinks(false);
    }
  };

  // ======= استيراد قسم كامل - الخطوة 2: استيراد المنتجات واحد بواحد =======
  const handleImportCategoryProducts = async () => {
    if (!categoryTargetSlug) {
      toast({ title: 'خطأ', description: 'الرجاء اختيار القسم المستهدف', variant: 'destructive' });
      return;
    }

    const matchedCategory = categories.find(c => c.slug === categoryTargetSlug);

    abortCategoryRef.current = false;
    setIsCategoryImporting(true);

    const initialResults = categoryLinks.map(url => ({
      url,
      status: 'pending' as const,
    }));
    setCategoryImportProgress({ current: 0, total: categoryLinks.length, results: initialResults });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < categoryLinks.length; i++) {
      if (abortCategoryRef.current) {
        toast({ title: 'تم الإيقاف', description: `توقف الاستيراد عند المنتج ${i} من ${categoryLinks.length}` });
        break;
      }

      const url = categoryLinks[i];

      // تحديث الحالة إلى "scraping"
      setCategoryImportProgress(prev => {
        if (!prev) return prev;
        const results = [...prev.results];
        results[i] = { ...results[i], status: 'scraping' };
        return { ...prev, current: i + 1, results };
      });

      try {
        // سحب بيانات المنتج
        const { data, error } = await supabase.functions.invoke('scrape-product', {
          body: { url, maxImages: 15 },
        });

        if (error) throw error;
        if (!data.success || data.isBulkImport) throw new Error(data.message || 'فشل في سحب المنتج');

        const rawProduct = data.data;
        const priceInSAR = rawProduct.price ? Math.ceil(rawProduct.price * 3.75) : 0;

        // تحديث الحالة إلى "saving"
        setCategoryImportProgress(prev => {
          if (!prev) return prev;
          const results = [...prev.results];
          results[i] = { ...results[i], status: 'saving', name: rawProduct.name };
          return { ...prev, results };
        });

        // حفظ المنتج في قاعدة البيانات
        const { data: savedProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name_ar: rawProduct.name || '',
            description_ar: rawProduct.description || '',
            price: priceInSAR,
            category: categoryTargetSlug,
            category_ar: matchedCategory?.name_ar || '',
            stock_quantity: 10,
            made_in: rawProduct.brand || '',
            is_active: true,
          })
          .select()
          .single();

        if (productError) throw productError;

        // حفظ الصور
        let primaryImageUrl: string | null = null;
        const images = rawProduct.images || [];
        for (let imgIdx = 0; imgIdx < Math.min(images.length, 5); imgIdx++) {
          try {
            const imgUrl = images[imgIdx];
            const imageResponse = await fetch(imgUrl);
            if (!imageResponse.ok) continue;

            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
            const imageBlob = await imageResponse.blob();

            const fileName = `${savedProduct.id}-${imgIdx}-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, imageBlob, { contentType, upsert: false });

            let finalUrl: string;
            if (uploadError) {
              finalUrl = imgUrl;
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
              finalUrl = publicUrl;
            }

            await supabase.from('product_images').insert({
              product_id: savedProduct.id,
              image_url: finalUrl,
              is_primary: imgIdx === 0,
              display_order: imgIdx,
            });

            if (imgIdx === 0) primaryImageUrl = finalUrl;
          } catch (imgErr) {
            console.error('Image error:', imgErr);
          }
        }

        if (primaryImageUrl) {
          await supabase.from('products').update({ image_url: primaryImageUrl }).eq('id', savedProduct.id);
        }

        successCount++;
        setCategoryImportProgress(prev => {
          if (!prev) return prev;
          const results = [...prev.results];
          results[i] = { ...results[i], status: 'done', name: rawProduct.name, imageUrl: primaryImageUrl || undefined };
          return { ...prev, results };
        });
      } catch (err: any) {
        failCount++;
        setCategoryImportProgress(prev => {
          if (!prev) return prev;
          const results = [...prev.results];
          results[i] = { ...results[i], status: 'error', error: err.message || 'خطأ غير معروف' };
          return { ...prev, results };
        });
      }

      // تأخير بين المنتجات
      if (i < categoryLinks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setIsCategoryImporting(false);
    toast({
      title: 'اكتمل استيراد القسم',
      description: `نجح: ${successCount} | فشل: ${failCount} | الإجمالي: ${categoryLinks.length}`,
    });
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
          category_ar: formData.category_ar,
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
      let primaryImageUrl: string | null = null;
      if (scrapedData?.images && scrapedData.images.length > 0) {
        // ترتيب الصور: الصورة الرئيسية أولاً
        const sortedImages = [...scrapedData.images].sort((a, b) => 
          (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)
        );

        const imagePromises = sortedImages.map(async (img, index) => {
          try {
            // محاولة تحميل الصورة ورفعها إلى التخزين
            const imageResponse = await fetch(img.url);
            if (!imageResponse.ok) {
              throw new Error(`Failed to fetch image (status ${imageResponse.status})`);
            }

            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
            const imageBlob = await imageResponse.blob();
            
            // رفع الصورة إلى التخزين
            const fileName = `${product.id}-${index}-${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, imageBlob, {
                contentType,
                upsert: false,
              });

            let finalUrl: string;
            if (uploadError) {
              console.error('Error uploading image, falling back to external URL:', uploadError);
              finalUrl = img.url; // استخدام رابط خارجي عند الفشل
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
              finalUrl = publicUrl;
            }

            // إضافة سجل الصورة في قاعدة البيانات بالرابط النهائي (محلّي أو خارجي)
            await supabase.from('product_images').insert({
              product_id: product.id,
              image_url: finalUrl,
              is_primary: img.isPrimary,
              display_order: index,
            });

            // حفظ رابط الصورة الرئيسية
            if (img.isPrimary) {
              primaryImageUrl = finalUrl;
            }

            return finalUrl;
          } catch (error) {
            console.error('Error processing image, saving external URL as fallback:', error);
            try {
              // إدراج بالرابط الخارجي كحل احتياطي
              await supabase.from('product_images').insert({
                product_id: product.id,
                image_url: img.url,
                is_primary: img.isPrimary,
                display_order: index,
              });
              if (img.isPrimary) {
                primaryImageUrl = img.url;
              }
              return img.url;
            } catch (insertErr) {
              console.error('Error saving external image URL:', insertErr);
              return null;
            }
          }
        });

        await Promise.all(imagePromises);

        // تحديث image_url في جدول products للصورة الرئيسية
        if (primaryImageUrl) {
          await supabase
            .from('products')
            .update({ image_url: primaryImageUrl })
            .eq('id', product.id);
        }
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
        category_ar: '',
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      toast({
        title: 'خطأ',
        description: 'يرجى رفع ملف Excel (.xlsx, .xls) أو CSV',
        variant: 'destructive',
      });
      return;
    }

    try {
      let urls: string[] = [];

      if (fileExtension === 'csv') {
        // قراءة ملف CSV
        const text = await file.text();
        Papa.parse(text, {
          complete: (results) => {
            // استخراج الروابط من الأعمدة
            urls = results.data
              .flat()
              .filter((cell: any) => 
                typeof cell === 'string' && 
                (cell.includes('http://') || cell.includes('https://'))
              )
              .map((url: string) => url.trim());
          },
          skipEmptyLines: true,
        });
      } else {
        // قراءة ملف Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // استخراج الروابط من جميع الخلايا
        urls = jsonData
          .flat()
          .filter((cell: any) => 
            typeof cell === 'string' && 
            (cell.includes('http://') || cell.includes('https://'))
          )
          .map((url: string) => url.trim());
      }

      // إزالة الروابط المكررة
      const uniqueUrls = Array.from(new Set(urls));

      if (uniqueUrls.length === 0) {
        toast({
          title: 'تنبيه',
          description: 'لم يتم العثور على روابط في الملف',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'تم قراءة الملف',
        description: `تم العثور على ${uniqueUrls.length} رابط`,
      });

      // بدء عملية الاستيراد
      await handleBulkImportFromFile(uniqueUrls);

    } catch (error: any) {
      console.error('Error reading file:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في قراءة الملف',
        variant: 'destructive',
      });
    }

    // إعادة تعيين input
    event.target.value = '';
  };

  const handleBulkImportFromFile = async (urls: string[]) => {
    setIsFileImporting(true);
    setFileImportProgress({
      total: urls.length,
      current: 0,
      urls,
      results: [],
    });

    const results: BulkImportResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      setFileImportProgress(prev => prev ? { ...prev, current: i + 1 } : null);

      try {
        const { data, error } = await supabase.functions.invoke('scrape-product', {
          body: { 
            url,
            imagesOnly: true, // دائماً صور فقط في الاستيراد الجماعي من الملف
            maxImages: 15 // عدد أقل للاستيراد السريع
          },
        });

        if (error) throw error;

        if (data.success && !data.isBulkImport) {
          const rawProduct = data.data;
          const product: ScrapedProduct = {
            ...rawProduct,
            images: (rawProduct.images || []).map((url: string, index: number) => ({
              url,
              isPrimary: index === 0,
              id: Math.random().toString(36).substring(7),
            })),
          };

          results.push({
            success: true,
            product,
            url,
          });
        } else {
          results.push({
            success: false,
            error: data.message || 'فشل في جلب البيانات',
            url,
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          error: error.message || 'خطأ في الاتصال',
          url,
        });
      }

      // تأخير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setFileImportProgress(prev => prev ? { ...prev, results } : null);
    setIsFileImporting(false);

    // عرض النتائج في واجهة الاستيراد الجماعي
    setBulkResults(results);
    setIsBulkImport(true);
    
    const successfulIndices = new Set<number>(
      results
        .map((result, index) => result.success ? index : -1)
        .filter(i => i !== -1)
    );
    setSelectedProducts(successfulIndices);

    toast({
      title: 'اكتمل الاستيراد',
      description: `تم استيراد ${results.filter(r => r.success).length} من ${urls.length} منتج`,
    });
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
          let primaryImageUrl: string | null = null;
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

                // حفظ رابط الصورة الرئيسية
                if (img.isPrimary) {
                  primaryImageUrl = publicUrl;
                }

                return publicUrl;
              } catch (error) {
                console.error('Error processing image:', error);
                return null;
              }
            });

            await Promise.all(imagePromises);

            // تحديث image_url في جدول products للصورة الرئيسية
            if (primaryImageUrl) {
              await supabase
                .from('products')
                .update({ image_url: primaryImageUrl })
                .eq('id', savedProduct.id);
            }
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

  // حسابات التقدم للاستيراد الجماعي
  const completedCount = categoryImportProgress?.results.filter(r => r.status === 'done').length || 0;
  const errorCount = categoryImportProgress?.results.filter(r => r.status === 'error').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Download className="h-7 w-7 text-primary" />
            استيراد المنتجات
          </h1>
          <p className="text-muted-foreground mt-2">
            استورد المنتجات من متاجر سلة، AliExpress، Amazon، وغيرها
          </p>
        </div>

        {/* ======= التبويبات ======= */}
        <div className="flex gap-2 bg-muted rounded-xl p-1 max-w-sm">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            منتج واحد
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'bulk'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            استيراد قسم
          </button>
        </div>

        {/* ──────── تبويب: منتج واحد ──────── */}
        {activeTab === 'single' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">استيراد منتج من رابط</CardTitle>
                <CardDescription>
                  الصق رابط المنتج من أي متجر إلكتروني وسنقوم بجلب البيانات تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* خيارات الاستيراد */}
                <div className="flex gap-2 p-3 bg-muted/30 rounded-lg">
                  <Button
                    type="button"
                    variant={importMode === 'full' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMode('full')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 ml-2" />
                    استيراد كامل
                  </Button>
                  <Button
                    type="button"
                    variant={importMode === 'images-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setImportMode('images-only')}
                    className="flex-1"
                  >
                    <FileSpreadsheet className="h-4 w-4 ml-2" />
                    الصور فقط
                  </Button>
                </div>

                {/* حقل الرابط */}
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.aliexpress.com/item/..."
                    value={productUrl}
                    onChange={(e) => setProductUrl(e.target.value)}
                    disabled={isLoading || isFileImporting}
                    dir="ltr"
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchProduct()}
                  />
                  <Button
                    onClick={handleFetchProduct}
                    disabled={isLoading || isFileImporting || !productUrl.trim() || isOptimizingName}
                  >
                    {isLoading || isOptimizingName ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        {isOptimizingName ? 'تحسين الاسم...' : 'جاري الجلب...'}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 ml-2" />
                        {importMode === 'images-only' ? 'جلب الصور' : 'جلب المنتج'}
                      </>
                    )}
                  </Button>
                </div>

                {/* مؤشر التحميل */}
                {isLoading && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">جاري جلب البيانات وتحميل الصور...</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">يتم تحميل الصور وحفظها في السيرفر الخاص بك</p>
                    </div>
                  </div>
                )}

                {/* رسالة النجاح */}
                {scrapedData && (
                  <div className={`rounded-lg border p-4 ${
                    scrapedData.incomplete
                      ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
                      : 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
                  }`}>
                    <div className={`flex items-center gap-2 ${scrapedData.incomplete ? 'text-yellow-800 dark:text-yellow-200' : 'text-green-800 dark:text-green-200'}`}>
                      <Check className="h-5 w-5" />
                      <span className="font-medium">
                        {scrapedData.incomplete ? 'تم جلب البيانات (مراجعة مطلوبة)' : 'تم جلب البيانات بنجاح'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${scrapedData.incomplete ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                      تم العثور على {scrapedData.images.length} صورة
                    </p>
                  </div>
                )}

                {/* استيراد من ملف */}
                <div className="space-y-2 p-4 border-2 border-dashed rounded-lg bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">أو استيراد من ملف Excel/CSV</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      disabled={isFileImporting || isLoading}
                      className="flex-1"
                    />
                    <Button variant="outline" disabled={isFileImporting || isLoading} className="whitespace-nowrap">
                      <Upload className="h-4 w-4 ml-2" />
                      رفع الملف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* شريط تقدم استيراد الملف */}
            {fileImportProgress && isFileImporting && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري استيراد المنتجات من الملف...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>المنتج {fileImportProgress.current} من {fileImportProgress.total}</span>
                  <span>{Math.round((fileImportProgress.current / fileImportProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(fileImportProgress.current / fileImportProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  الرابط الحالي: {fileImportProgress.urls[fileImportProgress.current - 1] || '...'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="name">اسم المنتج *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOptimizeProductName}
                        disabled={!formData.name_ar || isOptimizingNameManual}
                      >
                        {isOptimizingNameManual ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            جاري التحسين...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 ml-2" />
                            تحسين الاسم
                          </>
                        )}
                      </Button>
                      {/* خيار تحسين اسم المنتج بالذكاء الاصطناعي تلقائياً */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="optimize-name"
                          checked={optimizeProductName}
                          onChange={(e) => setOptimizeProductName(e.target.checked)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="optimize-name" className="cursor-pointer flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium">تلقائي</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <Input
                    id="name"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    placeholder="اسم المنتج بالعربية"
                  />
                  {optimizeProductName && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      ✨ سيتم تحويل الاسم تلقائياً إلى عربي مختصر وصديق لمحركات البحث SEO عند الاستيراد
                    </p>
                  )}
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
                      category_ar: '',
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
          </>
        )}

        {/* ──────── تبويب: استيراد قسم كامل ──────── */}
        {activeTab === 'bulk' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">استيراد جماعي من قسم</CardTitle>
                <CardDescription>
                  الصق رابط قسم من أي متجر (سلة، AliExpress، وغيرها) وسيتم جلب كل المنتجات تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* حقل رابط القسم */}
                <div className="flex gap-2">
                  <Input
                    value={categoryUrl}
                    onChange={(e) => setCategoryUrl(e.target.value)}
                    placeholder="https://store.salla.sa/categories/... أو أي رابط قسم"
                    className="flex-1"
                    dir="ltr"
                    disabled={isFetchingLinks || isCategoryImporting}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchCategoryLinks()}
                  />
                  <Button
                    onClick={handleFetchCategoryLinks}
                    disabled={isFetchingLinks || isCategoryImporting || !categoryUrl.trim()}
                  >
                    {isFetchingLinks ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري البحث...
                      </>
                    ) : (
                      <>
                        <FolderOpen className="h-4 w-4 ml-2" />
                        جلب المنتجات
                      </>
                    )}
                  </Button>
                </div>

                {/* مؤشر التحميل */}
                {isFetchingLinks && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">جاري البحث عن المنتجات في القسم...</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">يتم تحليل الصفحة واستخراج روابط المنتجات</p>
                    </div>
                  </div>
                )}

                {/* اختيار القسم المستهدف + زر الاستيراد */}
                {categoryLinks.length > 0 && (
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        تم العثور على {categoryLinks.length} منتج
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium">القسم المستهدف</Label>
                      <Select value={categoryTargetSlug} onValueChange={setCategoryTargetSlug} disabled={isCategoryImporting}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
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

                    <div className="flex gap-2">
                      {!isCategoryImporting ? (
                        <>
                          <Button
                            onClick={handleImportCategoryProducts}
                            disabled={!categoryTargetSlug}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 ml-2" />
                            استيراد الكل ({categoryLinks.length} منتج)
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCategoryLinks([]);
                              setCategoryImportProgress(null);
                              setCategoryTargetSlug('');
                            }}
                          >
                            إلغاء
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => { abortCategoryRef.current = true; }}
                          className="flex-1"
                        >
                          <StopCircle className="h-4 w-4 ml-2" />
                          إيقاف الاستيراد
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* شريط التقدم */}
                {categoryImportProgress && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span>التقدم: {completedCount + errorCount} / {categoryImportProgress.total}</span>
                      <span>{Math.round(((completedCount + errorCount) / categoryImportProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((completedCount + errorCount) / categoryImportProgress.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="w-3 h-3" /> {completedCount} نجح
                      </span>
                      <span className="flex items-center gap-1 text-red-600">
                        <X className="w-3 h-3" /> {errorCount} فشل
                      </span>
                      <span className="text-muted-foreground">
                        {categoryImportProgress.total - completedCount - errorCount} متبقي
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* قائمة المنتجات مع الحالة */}
            {categoryImportProgress && categoryImportProgress.results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">المنتجات ({categoryImportProgress.results.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {categoryImportProgress.results.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          item.status === 'done' ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                          item.status === 'error' ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' :
                          item.status === 'scraping' || item.status === 'saving' ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' :
                          'bg-muted/30 border-border'
                        }`}
                      >
                        {/* أيقونة الحالة */}
                        <div className="flex-shrink-0">
                          {item.status === 'done' && <Check className="h-5 w-5 text-green-600" />}
                          {item.status === 'error' && <X className="h-5 w-5 text-red-500" />}
                          {(item.status === 'scraping' || item.status === 'saving') && <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />}
                          {item.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
                        </div>

                        {/* صورة مصغرة */}
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        )}

                        {/* التفاصيل */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.name || `منتج ${idx + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">
                            {item.status === 'scraping' ? 'جاري سحب البيانات...' :
                             item.status === 'saving' ? 'جاري الحفظ...' :
                             item.status === 'error' ? item.error :
                             item.url}
                          </p>
                        </div>

                        {/* حالة */}
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          item.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          item.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          item.status === 'scraping' || item.status === 'saving' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {item.status === 'pending' && 'في الانتظار'}
                          {item.status === 'scraping' && 'جلب البيانات...'}
                          {item.status === 'saving' && 'جاري الحفظ...'}
                          {item.status === 'done' && 'تم'}
                          {item.status === 'error' && 'فشل'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
