import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SEOHead } from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateProductSlug } from '@/utils/slugGenerator';

const BlogTags = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    slug: '',
  });

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin-blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name_ar');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingTag) {
        const { error } = await supabase
          .from('blog_tags')
          .update(formData)
          .eq('id', editingTag.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_tags').insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] });
      toast({ title: editingTag ? 'تم تحديث الوسم' : 'تم إضافة الوسم' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-tags'] });
      toast({ title: 'تم حذف الوسم' });
    },
    onError: () => {
      toast({ title: 'خطأ في حذف الوسم', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ name_ar: '', slug: '' });
    setEditingTag(null);
  };

  const openEditDialog = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name_ar: tag.name_ar,
      slug: tag.slug,
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name_ar: name,
      slug: editingTag ? prev.slug : generateProductSlug(name),
    }));
  };

  return (
    <AdminLayout>
      <SEOHead
        title="وسوم المدونة | لوحة التحكم"
        description="إدارة وسوم المدونة"
        url="https://lamsetbeauty.com/admin/blog-tags"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">وسوم المدونة</h1>
            <p className="text-muted-foreground">إدارة وسوم المقالات</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                وسم جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'تعديل الوسم' : 'وسم جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">اسم الوسم *</Label>
                  <Input
                    id="name"
                    value={formData.name_ar}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="مثال: العناية الطبيعية"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="natural-care"
                    dir="ltr"
                  />
                </div>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              الوسوم ({tags?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="group relative">
                    <Badge variant="secondary" className="text-base py-2 px-4 pr-12">
                      {tag.name_ar}
                    </Badge>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الوسم؟')) {
                            deleteMutation.mutate(tag.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد وسوم بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BlogTags;
