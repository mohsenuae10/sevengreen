import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, User, Phone, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { SEOHead } from '@/components/SEO/SEOHead';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  pdf_url: string;
  access_code: string;
  total_amount: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

const ViewInvoice = () => {
  const { accessCode } = useParams<{ accessCode: string }>();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', accessCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('access_code', accessCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!accessCode
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الفاتورة...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">الفاتورة غير موجودة</h1>
            <p className="text-muted-foreground">
              عذراً، لم نتمكن من العثور على هذه الفاتورة. قد تكون الفاتورة غير موجودة أو تم حذفها.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`فاتورة ${invoice.invoice_number} | لمسة بيوتي`}
        description={`عرض فاتورة رقم ${invoice.invoice_number}`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">فاتورة</h1>
            <p className="text-muted-foreground">#{invoice.invoice_number}</p>
          </div>

          {/* Invoice Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>تفاصيل الفاتورة</span>
                <Badge variant="default">نشطة</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.customer_name && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">اسم العميل</p>
                    <p className="font-medium">{invoice.customer_name}</p>
                  </div>
                </div>
              )}

              {invoice.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{invoice.customer_phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                  <p className="font-medium">
                    {format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                </div>
              </div>

              {invoice.total_amount && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">المبلغ الإجمالي</span>
                    <span className="text-2xl font-bold text-primary">
                      {invoice.total_amount.toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => window.open(invoice.pdf_url, '_blank')}
                >
                  <FileText className="ml-2 h-5 w-5" />
                  عرض الفاتورة PDF
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = invoice.pdf_url;
                    link.download = `invoice-${invoice.invoice_number}.pdf`;
                    link.click();
                  }}
                >
                  <Download className="ml-2 h-5 w-5" />
                  تحميل الفاتورة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>لمسة بيوتي</p>
            <p>شكراً لتعاملكم معنا</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewInvoice;
