import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Image, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MigrationResult {
  productId: string;
  productName: string;
  oldUrl: string;
  newUrl?: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export default function MigrateImages() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, skipped: 0 });

  const handleMigration = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    try {
      toast({
        title: 'جاري نقل الصور...',
        description: 'قد تستغرق هذه العملية بضع دقائق',
      });

      const { data, error } = await supabase.functions.invoke('migrate-product-images');

      if (error) throw error;

      setStats(data.stats);
      setResults(data.results || []);
      setProgress(100);

      toast({
        title: 'تم نقل الصور بنجاح! ✓',
        description: `تم: ${data.stats.success} | فشل: ${data.stats.failed} | تم تخطي: ${data.stats.skipped}`,
      });
    } catch (error) {
      console.error('Error migrating images:', error);
      toast({
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'فشل نقل الصور',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">نقل صور المنتجات</h1>
          <p className="text-muted-foreground mt-2">
            نقل صور المنتجات من المصادر الخارجية إلى Supabase Storage لتحسين الأداء والـ SEO
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>ملاحظة:</strong> سيتم نقل جميع الصور من المصادر الخارجية (مثل alicdn.com) إلى التخزين الخاص بالموقع.
            الصور الموجودة بالفعل في Supabase Storage سيتم تخطيها.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              عملية النقل
            </CardTitle>
            <CardDescription>
              انقر على الزر أدناه لبدء عملية نقل الصور تلقائياً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleMigration}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              <Download className="ml-2 h-5 w-5" />
              {isProcessing ? 'جاري النقل...' : 'بدء نقل الصور'}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  جاري المعالجة... {progress}%
                </p>
              </div>
            )}

            {stats.total > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">إجمالي</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{stats.success}</p>
                      <p className="text-sm text-muted-foreground">نجح</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{stats.failed}</p>
                      <p className="text-sm text-muted-foreground">فشل</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{stats.skipped}</p>
                      <p className="text-sm text-muted-foreground">تم تخطيه</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">نتائج العملية (أول 10 منتجات)</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {result.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      {result.status === 'failed' && (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      {result.status === 'skipped' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.productName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.oldUrl}
                        </p>
                        {result.newUrl && (
                          <p className="text-xs text-green-600 truncate mt-1">
                            ← {result.newUrl}
                          </p>
                        )}
                        {result.error && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
