import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, User, Phone, Receipt, Package, MapPin, Store, Hash } from 'lucide-react';
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
  product_name: string | null;
  product_image_url: string | null;
  asin: string | null;
  quantity: number | null;
  tax_amount: number | null;
  shipping_address: string | null;
  amazon_store_name: string | null;
  tax_number: string | null;
}

const ViewInvoice = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const visitTracked = useRef(false);

  // Track visit on page load
  useEffect(() => {
    const trackVisit = async () => {
      if (!accessCode || visitTracked.current) return;
      visitTracked.current = true;
      
      try {
        await supabase.functions.invoke('track-invoice-visit', {
          body: { access_code: accessCode }
        });
      } catch (error) {
        console.log('Visit tracking skipped:', error);
      }
    };
    
    trackVisit();
  }, [accessCode]);

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

  // Calculate subtotal (total - tax)
  const subtotal = invoice.total_amount && invoice.tax_amount 
    ? invoice.total_amount - invoice.tax_amount 
    : invoice.total_amount;

  // Calculate unit price
  const unitPrice = subtotal && invoice.quantity 
    ? subtotal / invoice.quantity 
    : null;

  return (
    <>
      <SEOHead
        title={`فاتورة ${invoice.invoice_number} | لمسة بيوتي`}
        description={`عرض فاتورة رقم ${invoice.invoice_number}`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Quick Actions - Top Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => window.open(invoice.pdf_url, '_blank')}
            >
              <FileText className="ml-2 h-5 w-5" />
              عرض PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const link = document.createElement('a');
                link.href = invoice.pdf_url;
                link.download = `invoice-${invoice.invoice_number}.pdf`;
                link.click();
              }}
            >
              <Download className="ml-2 h-5 w-5" />
              تحميل
            </Button>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">فاتورة</h1>
            <p className="text-muted-foreground">#{invoice.invoice_number}</p>
          </div>

          {/* Invoice Header Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>معلومات الفاتورة</span>
                <Badge variant="default">صالحة</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.customer_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">اسم العميل</p>
                      <p className="font-medium">{invoice.customer_name}</p>
                    </div>
                  </div>
                )}

                {invoice.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                      <p className="font-medium" dir="ltr">{invoice.customer_phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                    <p className="font-medium">
                      {format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: ar })}
                    </p>
                  </div>
                </div>

                {invoice.amazon_store_name && (
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">اسم المتجر على أمازون</p>
                      <p className="font-medium">{invoice.amazon_store_name}</p>
                    </div>
                  </div>
                )}

                {invoice.tax_number && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">الرقم الضريبي (VAT)</p>
                      <p className="font-medium" dir="ltr">{invoice.tax_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {invoice.shipping_address && (
                <div className="flex items-start gap-3 pt-4 border-t">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">عنوان الشحن</p>
                    <p className="font-medium">{invoice.shipping_address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          {invoice.product_name && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  تفاصيل المنتج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  {invoice.product_image_url && (
                    <img 
                      src={invoice.product_image_url} 
                      alt={invoice.product_name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{invoice.product_name}</h3>
                    {invoice.asin && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>ASIN: {invoice.asin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">سعر الوحدة</TableHead>
                        <TableHead className="text-left">الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">{invoice.product_name}</TableCell>
                        <TableCell className="text-center">{invoice.quantity || 1}</TableCell>
                        <TableCell className="text-center">
                          {unitPrice ? `${unitPrice.toFixed(2)} ر.س` : '-'}
                        </TableCell>
                        <TableCell className="text-left">
                          {subtotal ? `${subtotal.toFixed(2)} ر.س` : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subtotal && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
                </div>
              )}
              
              {invoice.tax_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الضريبة (15%)</span>
                  <span className="font-medium">{invoice.tax_amount.toFixed(2)} ر.س</span>
                </div>
              )}

              {invoice.total_amount && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-semibold text-lg">الإجمالي النهائي</span>
                  <span className="text-2xl font-bold text-primary">
                    {invoice.total_amount.toFixed(2)} ر.س
                  </span>
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
