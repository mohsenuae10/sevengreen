import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, Sparkles, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Banner {
  id: string;
  product_id: string;
  offer_description: string;
  banner_image_url: string | null;
  is_active: boolean;
  display_order: number;
  products: {
    name_ar: string;
    image_url: string;
  };
}

export default function PromotionalBanners() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"generate" | "upload">("generate");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch all banners
  const { data: banners, isLoading } = useQuery({
    queryKey: ['promotional-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*, products(name_ar, image_url)')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Banner[];
    },
  });

  // Fetch active products
  const { data: products } = useQuery({
    queryKey: ['products-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, image_url')
        .eq('is_active', true)
        .order('name_ar');
      
      if (error) throw error;
      return data;
    },
  });

  // Generate banner mutation
  const generateBannerMutation = useMutation({
    mutationFn: async () => {
      let productInfo = null;
      
      if (selectedProductId) {
        const product = products?.find(p => p.id === selectedProductId);
        if (product) {
          productInfo = {
            name: product.name_ar,
            image: product.image_url
          };
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-promotional-banner', {
        body: {
          bannerDescription: offerDescription,
          productInfo: productInfo
        }
      });

      if (error) throw error;
      return data.bannerUrl;
    },
    onSuccess: (url) => {
      setBannerUrl(url);
      toast.success('تم توليد البنر بنجاح');
    },
    onError: (error: any) => {
      console.error('Error generating banner:', error);
      toast.error('فشل في توليد البنر');
    },
  });

  // Save banner mutation
  const saveBannerMutation = useMutation({
    mutationFn: async () => {
      if (!offerDescription || !bannerUrl) {
        throw new Error('يرجى ملء الحقول المطلوبة');
      }

      const bannerData = {
        product_id: selectedProductId || null,
        offer_description: offerDescription,
        banner_image_url: bannerUrl,
        is_active: isActive,
        display_order: displayOrder,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('promotional_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('promotional_banners')
          .insert(bannerData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success(editingBanner ? 'تم تحديث البنر' : 'تم إضافة البنر');
      resetForm();
    },
    onError: (error: any) => {
      console.error('Error saving banner:', error);
      toast.error('فشل في حفظ البنر');
    },
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotional_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success('تم حذف البنر');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Error deleting banner:', error);
      toast.error('فشل في حذف البنر');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('promotional_banners')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-banners'] });
      toast.success('تم تحديث حالة البنر');
    },
  });

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingBanner(null);
    setSelectedProductId("");
    setOfferDescription("");
    setBannerUrl("");
    setIsActive(false);
    setDisplayOrder(0);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setSelectedProductId(banner.product_id || "");
    setOfferDescription(banner.offer_description);
    setBannerUrl(banner.banner_image_url || "");
    setIsActive(banner.is_active);
    setDisplayOrder(banner.display_order);
    setIsFormOpen(true);
  };

  const handleGenerateBanner = async () => {
    if (!offerDescription || offerDescription.trim().length < 20) {
      toast.error('يرجى كتابة وصف تفصيلي للبنر (على الأقل 20 حرف)');
      return;
    }
    setIsGenerating(true);
    await generateBannerMutation.mutateAsync();
    setIsGenerating(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadingImage(true);

    try {
      const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('promotional-banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('promotional-banners')
        .getPublicUrl(fileName);

      setBannerUrl(publicUrl);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">البنرات الترويجية</h1>
          <p className="text-muted-foreground">إدارة البنرات الترويجية للصفحة الرئيسية</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة بنر جديد
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBanner ? 'تعديل البنر' : 'إضافة بنر جديد'}</CardTitle>
            <CardDescription>قم بإنشاء بنر ترويجي باستخدام الذكاء الاصطناعي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>المنتج (اختياري)</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنتج (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون منتج</SelectItem>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                اختر منتج لربط البنر به، أو اترك الحقل فارغاً لبنر عام
              </p>
            </div>

            <div className="space-y-2">
              <Label>وصف كامل للبنر المطلوب *</Label>
              <Textarea
                placeholder="مثال: بنر ترويجي بمناسبة اليوم الوطني السعودي، يحتوي على العلم السعودي، خصم 50%، ألوان أخضر وأبيض، نص بالعربية بخط كبير وواضح، صورة منتج الشامبو الطبيعي على اليسار"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                اكتب وصفاً تفصيلياً للبنر: المناسبة، العرض، الألوان، النصوص، الصور، أي عناصر تريد إضافتها
              </p>
            </div>

            <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "generate" | "upload")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">توليد بالذكاء الاصطناعي</TabsTrigger>
                <TabsTrigger value="upload">رفع صورة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate" className="space-y-4">
                <Button 
                  onClick={handleGenerateBanner} 
                  disabled={isGenerating || !offerDescription || offerDescription.trim().length < 20}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ml-2 h-4 w-4" />
                      توليد البنر بالذكاء الاصطناعي
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="banner-upload">رفع صورة البنر (الحجم الموصى به: 1536x512 بكسل)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {uploadingImage && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    الحد الأقصى لحجم الملف: 5 ميجابايت. الصيغ المدعومة: JPG, PNG, WEBP
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {bannerUrl && (
              <div className="space-y-2">
                <Label>معاينة البنر</Label>
                <img src={bannerUrl} alt="Banner preview" className="w-full rounded-lg border" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                  min={0}
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-8">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  id="is-active"
                />
                <Label htmlFor="is-active">تفعيل البنر</Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
              <Button 
                onClick={() => saveBannerMutation.mutate()}
                disabled={!bannerUrl || saveBannerMutation.isPending}
              >
                {saveBannerMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ البنر'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>البنرات الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : banners && banners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البنر</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>وصف العرض</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      {banner.banner_image_url && (
                        <img 
                          src={banner.banner_image_url} 
                          alt={banner.offer_description}
                          className="h-16 w-32 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>{banner.products.name_ar}</TableCell>
                    <TableCell className="max-w-xs truncate">{banner.offer_description}</TableCell>
                    <TableCell>{banner.display_order}</TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: banner.id, isActive: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => setDeleteId(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              لا توجد بنرات حالياً. قم بإضافة بنر جديد للبدء.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف البنر نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBannerMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
