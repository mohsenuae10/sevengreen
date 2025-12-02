import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SEOHead } from '@/components/SEO/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Save, Eye, Image as ImageIcon, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateProductSlug } from '@/utils/slugGenerator';

const BlogPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title_ar: '',
    slug: '',
    excerpt_ar: '',
    content_ar: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    category_id: '',
    status: 'draft',
    reading_time: 5,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['blog-categories-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name_ar')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['blog-tags-select'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blog_tags').select('id, name_ar').order('name_ar');
      if (error) throw error;
      return data;
    },
  });

  const { data: post } = useQuery({
    queryKey: ['blog-post-edit', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const { data: postTags } = useQuery({
    queryKey: ['blog-post-tags', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('blog_post_tags').select('tag_id').eq('post_id', id);
      if (error) throw error;
      return data?.map(pt => pt.tag_id) || [];
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title_ar: post.title_ar || '',
        slug: post.slug || '',
        excerpt_ar: post.excerpt_ar || '',
        content_ar: post.content_ar || '',
        featured_image: post.featured_image || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        category_id: post.category_id || '',
        status: post.status || 'draft',
        reading_time: post.reading_time || 5,
      });
    }
  }, [post]);

  useEffect(() => {
    if (postTags) {
      setSelectedTags(postTags);
    }
  }, [postTags]);

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title_ar: title,
      slug: generateProductSlug(title),
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `blog/${fileName}`;

    const { error } = await supabase.storage.from('store-assets').upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from('store-assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = formData.featured_image;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImage(imageFile);
        setUploading(false);
      }

      const postData: any = {
        ...formData,
        featured_image: imageUrl,
        category_id: formData.category_id || null,
      };

      if (formData.status === 'published' && !post?.published_at) {
        postData.published_at = new Date().toISOString();
      }

      let postId = id;

      if (isEditing) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('blog_posts').insert(postData).select('id').single();
        if (error) throw error;
        postId = data.id;
      }

      // Update tags
      if (postId) {
        await supabase.from('blog_post_tags').delete().eq('post_id', postId);
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({ post_id: postId, tag_id: tagId }));
          await supabase.from('blog_post_tags').insert(tagInserts);
        }
      }

      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast({ title: isEditing ? 'تم تحديث المقال بنجاح' : 'تم إنشاء المقال بنجاح' });
      if (!isEditing) {
        navigate(`/admin/blog/edit/${postId}`);
      }
    },
    onError: (error: any) => {
      toast({ title: 'خطأ في حفظ المقال', description: error.message, variant: 'destructive' });
    },
  });

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <AdminLayout>
      <SEOHead
        title={isEditing ? 'تعديل المقال | لوحة التحكم' : 'مقال جديد | لوحة التحكم'}
        description="محرر المقالات"
        url="https://lamsetbeauty.com/admin/blog/new"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{isEditing ? 'تعديل المقال' : 'مقال جديد'}</h1>
              <p className="text-muted-foreground">
                {isEditing ? 'قم بتعديل محتوى المقال' : 'أنشئ مقالاً جديداً للمدونة'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {formData.slug && formData.status === 'published' && (
              <Button variant="outline" asChild>
                <a href={`/blog/${formData.slug}`} target="_blank">
                  <Eye className="h-4 w-4 ml-2" />
                  معاينة
                </a>
              </Button>
            )}
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || uploading}>
              <Save className="h-4 w-4 ml-2" />
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المحتوى الأساسي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان المقال *</Label>
                  <Input
                    id="title"
                    value={formData.title_ar}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="أدخل عنوان المقال"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="رابط-المقال"
                    dir="ltr"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">الملخص</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt_ar: e.target.value }))}
                    placeholder="ملخص قصير للمقال (يظهر في قائمة المقالات)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">المحتوى *</Label>
                  <Textarea
                    id="content"
                    value={formData.content_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, content_ar: e.target.value }))}
                    placeholder="محتوى المقال (يدعم HTML)"
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يمكنك استخدام HTML للتنسيق (h2, h3, p, ul, ol, strong, em, a, img)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">عنوان SEO</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="عنوان يظهر في نتائج البحث"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_title.length}/60 حرف
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_description">وصف SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="وصف يظهر في نتائج البحث"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 حرف
                  </p>
                </div>

                <div>
                  <Label htmlFor="meta_keywords">الكلمات المفتاحية</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="كلمة1، كلمة2، كلمة3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>النشر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                      <SelectItem value="archived">مؤرشف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>التصنيف</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name_ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reading_time">وقت القراءة (دقيقة)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    min={1}
                    value={formData.reading_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الصورة الرئيسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.featured_image && (
                  <div className="relative">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2"
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="image">رفع صورة جديدة</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">أو رابط الصورة</Label>
                  <Input
                    id="image_url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الوسوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name_ar}
                    </Badge>
                  ))}
                </div>
                {tags?.length === 0 && (
                  <p className="text-sm text-muted-foreground">لا توجد وسوم. أضف وسوماً من صفحة إدارة الوسوم.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogPostEditor;
