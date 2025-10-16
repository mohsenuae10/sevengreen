import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/product/ImageUploader';
import { OptimizedImage } from '@/components/OptimizedImage';

const CATEGORIES = [
  'العناية بالشعر',
  'العناية بالبشرة',
  'العناية بالجسم',
  'الصحة والعافية',
  'العناية بالرجال',
  'الهدايا والمجموعات'
];

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'تم حذف المنتج بنجاح' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name_ar}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>{product.name_ar}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price} ريال</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() =>
                            toggleActiveMutation.mutate({
                              id: product.id,
                              isActive: product.is_active,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function ProductForm({ product, onClose }: { product?: any; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || '',
    description_ar: product?.description_ar || '',
    price: product?.price || '',
    category: product?.category || '',
    stock_quantity: product?.stock_quantity || '',
    image_url: product?.image_url || '',
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
    seo_keywords: product?.seo_keywords || '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الصور الحالية عند التعديل
  useEffect(() => {
    if (product?.id) {
      supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order', { ascending: true })
        .then(({ data }) => {
          if (data) setExistingImages(data);
        });
    }
  }, [product?.id]);

  const handleImagesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const deleteExistingImage = async (imageId: string) => {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الصورة',
        variant: 'destructive',
      });
      return;
    }

    setExistingImages(existingImages.filter(img => img.id !== imageId));
    toast({ title: 'تم حذف الصورة بنجاح' });
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('Uploading image:', fileName);

      const uploadPromise = supabase.storage
        .from('product-images')
        .upload(fileName, file);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة رفع الصورة')), 30000)
      );

      const { error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Image upload exception:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: تحقق من الحقول المطلوبة
    if (!formData.name_ar?.trim()) {
      toast({ 
        title: 'خطأ في البيانات', 
        description: 'يجب إدخال اسم المنتج',
        variant: 'destructive' 
      });
      return;
    }
    
    if (!formData.category?.trim()) {
      toast({ 
        title: 'خطأ في البيانات', 
        description: 'يجب اختيار الفئة',
        variant: 'destructive' 
      });
      return;
    }
    
    if (!formData.price || parseFloat(formData.price as any) <= 0) {
      toast({ 
        title: 'خطأ في البيانات', 
        description: 'يجب إدخال سعر صحيح',
        variant: 'destructive' 
      });
      return;
    }
    
    if (!formData.stock_quantity || parseInt(formData.stock_quantity as any) < 0) {
      toast({ 
        title: 'خطأ في البيانات', 
        description: 'يجب إدخال كمية صحيحة',
        variant: 'destructive' 
      });
      return;
    }
    
    setUploading(true);

    try {
      // رفع الصور الجديدة
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        console.log('Starting upload of', imageFiles.length, 'images...');
        
        for (const file of imageFiles) {
          const url = await handleImageUpload(file);
          if (url) uploadedUrls.push(url);
        }

        if (uploadedUrls.length === 0) {
          toast({
            title: 'فشل رفع الصور',
            description: 'لم يتم رفع أي صورة. يرجى المحاولة مرة أخرى.',
            variant: 'destructive'
          });
          return;
        }
        
        console.log('Images uploaded:', uploadedUrls.length);
      }

      // تحديد الصورة الرئيسية (أول صورة جديدة أو الصورة الحالية)
      const primaryImageUrl = uploadedUrls[0] || existingImages.find(img => img.is_primary)?.image_url || formData.image_url;

      // تنظيف البيانات
      const productData = {
        name_ar: formData.name_ar.trim(),
        description_ar: formData.description_ar?.trim() || null,
        price: parseFloat(formData.price as any),
        category: formData.category.trim(),
        stock_quantity: parseInt(formData.stock_quantity as any),
        image_url: primaryImageUrl || null,
        seo_title: formData.seo_title?.trim() || null,
        seo_description: formData.seo_description?.trim() || null,
        seo_keywords: formData.seo_keywords?.trim() || null,
      };

      console.log('Attempting to save product:', productData);

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) {
          console.error('Update error:', error);
          toast({ 
            title: 'خطأ في تحديث المنتج', 
            description: error.message,
            variant: 'destructive' 
          });
          return;
        }
      } else {
        const { error, data } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          toast({ 
            title: 'خطأ في إضافة المنتج', 
            description: error.message,
            variant: 'destructive' 
          });
          return;
        }
        
        productId = data.id;
      }

      // إضافة الصور الجديدة إلى product_images
      if (uploadedUrls.length > 0 && productId) {
        const startOrder = existingImages.length;
        
        for (let i = 0; i < uploadedUrls.length; i++) {
          await supabase.from('product_images').insert({
            product_id: productId,
            image_url: uploadedUrls[i],
            display_order: startOrder + i,
            is_primary: i === 0 && existingImages.length === 0,
          });
        }
      }

      toast({ 
        title: product ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح',
        description: `المنتج "${productData.name_ar}" تم ${product ? 'تحديثه' : 'إضافته'} بنجاح`
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      onClose();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({ 
        title: 'حدث خطأ', 
        description: error.message || 'فشل في حفظ المنتج',
        variant: 'destructive' 
      });
    } finally {
      console.log('Setting uploading to false');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اسم المنتج</Label>
          <Input
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>الفئة</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
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
      </div>

      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea
          value={formData.description_ar}
          onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>السعر (ريال)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>الكمية المتوفرة</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>صور المنتج</Label>
        <ImageUploader onImagesChange={handleImagesChange} maxImages={10} />
        
        {/* الصور الحالية */}
        {existingImages.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">الصور الحالية ({existingImages.length})</p>
            <div className="grid grid-cols-4 gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group">
                  <OptimizedImage
                    src={img.image_url}
                    alt="صورة المنتج"
                    className="rounded-lg"
                    aspectRatio="1/1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteExistingImage(img.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {img.is_primary && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                      رئيسية
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold">إعدادات SEO</h3>
        <div className="space-y-2">
          <Label>عنوان SEO</Label>
          <Input
            value={formData.seo_title}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>وصف SEO</Label>
          <Textarea
            value={formData.seo_description}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>كلمات مفتاحية</Label>
          <Input
            value={formData.seo_keywords}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {imageFiles.length > 0 ? 'جاري رفع الصور...' : 'جاري الحفظ...'}
            </>
          ) : (
            product ? 'تحديث' : 'إضافة'
          )}
        </Button>
      </div>
    </form>
  );
}
