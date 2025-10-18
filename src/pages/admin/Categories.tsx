import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LayoutGrid, Plus, Pencil, Trash2, Loader2, RefreshCw, Upload } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  banner_url: string | null;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const iconOptions = [
  'Sparkles', 'Droplet', 'Heart', 'Flower2', 'User', 'Gift',
  'Leaf', 'Sun', 'Moon', 'Star', 'Zap', 'Cloud'
];

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    description_ar: '',
    icon: 'Sparkles',
    display_order: 0,
    is_active: true,
  });
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedBannerUrl, setGeneratedBannerUrl] = useState<string | null>(null);
  const [uploadingManual, setUploadingManual] = useState(false);

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const slug = data.name_ar
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0621-\u064Aa-z0-9\-]/g, '');

      const { data: result, error } = await supabase
        .from('categories')
        .insert({ ...data, slug, banner_url: generatedBannerUrl })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم إضافة القسم بنجاح');
      resetForm();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error('فشل إضافة القسم: ' + error.message);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم تحديث القسم بنجاح');
      resetForm();
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error('فشل تحديث القسم: ' + error.message);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم حذف القسم بنجاح');
    },
    onError: (error: any) => {
      toast.error('فشل حذف القسم: ' + error.message);
    },
  });

  const generateBanner = async () => {
    if (!formData.name_ar) {
      toast.error('الرجاء إدخال اسم القسم أولاً');
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-category-banner', {
        body: {
          categoryName: formData.name_ar,
          categoryDescription: formData.description_ar || formData.name_ar,
        },
      });

      if (error) throw error;
      
      setGeneratedBannerUrl(data.bannerUrl);
      toast.success('تم توليد الصورة بنجاح');
    } catch (error: any) {
      console.error('Error generating banner:', error);
      toast.error('فشل توليد الصورة: ' + (error.message || 'حدث خطأ غير متوقع'));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleManualUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingManual(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('category-banners')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category-banners')
        .getPublicUrl(fileName);

      setGeneratedBannerUrl(publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error: any) {
      toast.error('فشل رفع الصورة: ' + error.message);
    } finally {
      setUploadingManual(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        ...formData,
        banner_url: generatedBannerUrl || editingCategory.banner_url,
      });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      description_ar: '',
      icon: 'Sparkles',
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
    setGeneratedBannerUrl(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_ar: category.name_ar,
      description_ar: category.description_ar || '',
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setGeneratedBannerUrl(category.banner_url);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    return <Icon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <LayoutGrid className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
          <div className="flex-1">
            <h1 className="text-xl lg:text-3xl font-bold">إدارة الأقسام</h1>
            <p className="text-muted-foreground text-sm lg:text-base">إضافة وتعديل أقسام المتجر</p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة قسم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name_ar">اسم القسم *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description_ar">الوصف</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="icon">الأيقونة</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            {renderIcon(icon)}
                            <span>{icon}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">نشط</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label>صورة البانر</Label>
                  <div className="space-y-3 mt-2">
                    {generatedBannerUrl && (
                      <div className="relative">
                        <img
                          src={generatedBannerUrl}
                          alt="معاينة البانر"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={generateBanner}
                        disabled={generatingImage || !formData.name_ar}
                        variant="outline"
                      >
                        {generatingImage ? (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 ml-2" />
                        )}
                        {generatedBannerUrl ? 'إعادة توليد الصورة' : 'توليد صورة بالذكاء الاصطناعي'}
                      </Button>

                      <Label htmlFor="manual-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 ml-2" />
                            {uploadingManual ? 'جاري الرفع...' : 'رفع صورة يدوياً'}
                          </span>
                        </Button>
                        <Input
                          id="manual-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleManualUpload}
                          disabled={uploadingManual}
                        />
                      </Label>
                    </div>

                    {generatingImage && (
                      <p className="text-sm text-muted-foreground">
                        جاري توليد صورة احترافية بالذكاء الاصطناعي... قد يستغرق هذا 10-15 ثانية
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                    {editingCategory ? 'حفظ التعديلات' : 'إضافة القسم'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right p-4">الصورة</th>
                <th className="text-right p-4">الاسم</th>
                <th className="text-right p-4">الأيقونة</th>
                <th className="text-right p-4">الترتيب</th>
                <th className="text-right p-4">الحالة</th>
                <th className="text-right p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((category) => (
                <tr key={category.id} className="border-b">
                  <td className="p-4">
                    {category.banner_url ? (
                      <img
                        src={category.banner_url}
                        alt={category.name_ar}
                        className="w-24 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                        بدون صورة
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{category.name_ar}</td>
                  <td className="p-4">{renderIcon(category.icon)}</td>
                  <td className="p-4">{category.display_order}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                {category.banner_url && (
                  <img
                    src={category.banner_url}
                    alt={category.name_ar}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {renderIcon(category.icon)}
                    <h3 className="font-semibold">{category.name_ar}</h3>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الترتيب: {category.display_order}</span>
                    <span className={`px-2 py-1 rounded text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(category)} className="flex-1">
                      <Pencil className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}