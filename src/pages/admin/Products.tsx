import { useState } from 'react';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // الحد الأقصى: 5MB
      const maxSize = 5 * 1024 * 1024;
      
      if (file.size > maxSize) {
        toast({
          title: 'حجم الملف كبير جداً',
          description: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Image file selected:', file.name, 'Size:', file.size, 'bytes');
      setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image_url;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `products/${Date.now()}.${fileExt}`;

      console.log('Uploading image:', fileName);
      console.log('File size:', imageFile.size, 'bytes');

      // إضافة timeout: 30 ثانية كحد أقصى
      const uploadPromise = supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة رفع الصورة. يرجى المحاولة مرة أخرى.')), 30000)
      );

      const { error: uploadError, data } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]) as any;

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({ 
          title: 'خطأ في رفع الصورة', 
          description: uploadError.message,
          variant: 'destructive' 
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error('Image upload exception:', error);
      toast({ 
        title: 'خطأ في رفع الصورة', 
        description: error.message || 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive' 
      });
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
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        console.log('Starting image upload...');
        imageUrl = await handleImageUpload();
        
        if (!imageUrl) {
          console.error('Image upload failed - imageUrl is null');
          toast({
            title: 'فشل رفع الصورة',
            description: 'لم يتم رفع الصورة. يرجى المحاولة مرة أخرى.',
            variant: 'destructive'
          });
          return;
        }
        
        console.log('Image upload completed:', imageUrl);
      }

      // تنظيف البيانات: إزالة المسافات الزائدة
      const productData = {
        name_ar: formData.name_ar.trim(),
        description_ar: formData.description_ar?.trim() || null,
        price: parseFloat(formData.price as any),
        category: formData.category.trim(),
        stock_quantity: parseInt(formData.stock_quantity as any),
        image_url: imageUrl || formData.image_url || null,
        seo_title: formData.seo_title?.trim() || null,
        seo_description: formData.seo_description?.trim() || null,
        seo_keywords: formData.seo_keywords?.trim() || null,
      };

      console.log('Attempting to save product:', productData);

      if (product) {
        const { error, data } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select();

        if (error) {
          console.error('Update error details:', error);
          toast({ 
            title: 'خطأ في تحديث المنتج', 
            description: error.message || 'حدث خطأ غير متوقع',
            variant: 'destructive' 
          });
          return;
        }
        
        console.log('Product updated successfully:', data);
      } else {
        const { error, data } = await supabase
          .from('products')
          .insert(productData)
          .select();

        if (error) {
          console.error('Insert error details:', error);
          toast({ 
            title: 'خطأ في إضافة المنتج', 
            description: error.message || 'حدث خطأ غير متوقع',
            variant: 'destructive' 
          });
          return;
        }
        
        console.log('Product inserted successfully:', data);
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
        <Label>صورة المنتج</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <p className="text-sm text-muted-foreground">الحد الأقصى لحجم الملف: 5 ميجابايت</p>
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
              {imageFile ? 'جاري رفع الصورة...' : 'جاري الحفظ...'}
            </>
          ) : (
            product ? 'تحديث' : 'إضافة'
          )}
        </Button>
      </div>
    </form>
  );
}
