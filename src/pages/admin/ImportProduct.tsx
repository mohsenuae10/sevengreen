import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Link as LinkIcon, Download, Check } from 'lucide-react';

interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  brand?: string;
  category?: string;
  incomplete?: boolean;
}

const CATEGORIES = [
  'العناية بالبشرة',
  'العناية بالشعر',
  'العناية بالجسم',
  'العناية بالرجال',
  'الصحة والعافية',
  'الهدايا',
];

export default function ImportProduct() {
  const [productUrl, setProductUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedProduct | null>(null);
  
  // بيانات النموذج القابلة للتعديل
  const [formData, setFormData] = useState({
    name_ar: '',
    description_ar: '',
    price: 0,
    category: '',
    stock_quantity: 0,
    made_in: '',
  });

  const { toast } = useToast();

  const handleFetchProduct = async () => {
    if (!productUrl.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال رابط المنتج',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: productUrl },
      });

      if (error) throw error;

      if (!data.success) {
        // عرض رسالة خطأ مفصلة
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

      const product = data.data as ScrapedProduct;
      setScrapedData(product);

      // تحويل السعر من الدولار إلى الريال (تقريباً 3.75)
      const priceInSAR = product.price ? Math.ceil(product.price * 3.75) : 0;

      setFormData({
        name_ar: product.name || '',
        description_ar: product.description || '',
        price: priceInSAR,
        category: product.category || '',
        stock_quantity: 10,
        made_in: product.brand || '',
      });

      // عرض رسالة نجاح مع تحذيرات إن وجدت
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
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // حفظ الصور
      if (scrapedData?.images && scrapedData.images.length > 0) {
        const imagePromises = scrapedData.images.map(async (imageUrl, index) => {
          try {
            // تحميل الصورة من الرابط الأصلي
            const imageResponse = await fetch(imageUrl);
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
              is_primary: index === 0,
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
              الصق رابط المنتج من الموقع الخارجي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {scrapedData && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المنتج</CardTitle>
              <CardDescription>
                راجع وعدل البيانات المستوردة قبل الحفظ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* معاينة الصور */}
              {scrapedData.images.length > 0 && (
                <div>
                  <Label>الصور ({scrapedData.images.length})</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    {scrapedData.images.slice(0, 8).map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={img}
                          alt={`صورة ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            رئيسية
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                  <Label htmlFor="description">الوصف</Label>
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
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
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
