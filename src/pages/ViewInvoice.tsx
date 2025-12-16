import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, User, Phone, Receipt, Package, MapPin, Store, Hash, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
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

type Language = 'ar' | 'en';

const translations = {
  ar: {
    loading: 'جاري تحميل الفاتورة...',
    notFound: 'الفاتورة غير موجودة',
    notFoundDesc: 'عذراً، لم نتمكن من العثور على هذه الفاتورة. قد تكون الفاتورة غير موجودة أو تم حذفها.',
    viewPdf: 'عرض PDF',
    download: 'تحميل',
    invoice: 'فاتورة',
    invoiceInfo: 'معلومات الفاتورة',
    valid: 'صالحة',
    customerName: 'اسم العميل',
    phone: 'رقم الهاتف',
    issueDate: 'تاريخ الإصدار',
    amazonStore: 'اسم المتجر على أمازون',
    taxNumber: 'الرقم الضريبي (VAT)',
    shippingAddress: 'عنوان الشحن',
    productDetails: 'تفاصيل المنتج',
    product: 'المنتج',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    total: 'الإجمالي',
    invoiceSummary: 'ملخص الفاتورة',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة (15%)',
    finalTotal: 'الإجمالي النهائي',
    notes: 'ملاحظات',
    viewInvoicePdf: 'عرض الفاتورة PDF',
    downloadInvoice: 'تحميل الفاتورة',
    brandName: 'لمسة بيوتي',
    thankYou: 'شكراً لتعاملكم معنا',
    currency: 'ر.س',
    switchLang: 'English'
  },
  en: {
    loading: 'Loading invoice...',
    notFound: 'Invoice Not Found',
    notFoundDesc: 'Sorry, we could not find this invoice. It may not exist or has been deleted.',
    viewPdf: 'View PDF',
    download: 'Download',
    invoice: 'Invoice',
    invoiceInfo: 'Invoice Information',
    valid: 'Valid',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    issueDate: 'Issue Date',
    amazonStore: 'Amazon Store Name',
    taxNumber: 'VAT Number',
    shippingAddress: 'Shipping Address',
    productDetails: 'Product Details',
    product: 'Product',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    total: 'Total',
    invoiceSummary: 'Invoice Summary',
    subtotal: 'Subtotal',
    tax: 'Tax (15%)',
    finalTotal: 'Final Total',
    notes: 'Notes',
    viewInvoicePdf: 'View Invoice PDF',
    downloadInvoice: 'Download Invoice',
    brandName: 'Lamset Beauty',
    thankYou: 'Thank you for your business',
    currency: 'SAR',
    switchLang: 'العربية'
  }
};

const ViewInvoice = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const visitTracked = useRef(false);
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRtl = lang === 'ar';

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

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t.notFound}</h1>
            <p className="text-muted-foreground">{t.notFoundDesc}</p>
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

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${t.currency}`;
  };

  return (
    <>
      <SEOHead
        title={`${t.invoice} ${invoice.invoice_number} | ${t.brandName}`}
        description={`${t.invoice} #${invoice.invoice_number}`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Language Toggle */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={toggleLanguage}>
              <Globe className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
              {t.switchLang}
            </Button>
          </div>

          {/* Quick Actions - Top Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => window.open(invoice.pdf_url, '_blank')}
            >
              <FileText className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
              {t.viewPdf}
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
              <Download className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
              {t.download}
            </Button>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t.invoice}</h1>
            <p className="text-muted-foreground">#{invoice.invoice_number}</p>
          </div>

          {/* Invoice Header Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.invoiceInfo}</span>
                <Badge variant="default">{t.valid}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invoice.customer_name && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.customerName}</p>
                      <p className="font-medium">{invoice.customer_name}</p>
                    </div>
                  </div>
                )}

                {invoice.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.phone}</p>
                      <p className="font-medium" dir="ltr">{invoice.customer_phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.issueDate}</p>
                    <p className="font-medium">
                      {format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: isRtl ? ar : enUS })}
                    </p>
                  </div>
                </div>

                {invoice.amazon_store_name && (
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.amazonStore}</p>
                      <p className="font-medium">{invoice.amazon_store_name}</p>
                    </div>
                  </div>
                )}

                {invoice.tax_number && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.taxNumber}</p>
                      <p className="font-medium" dir="ltr">{invoice.tax_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {invoice.shipping_address && (
                <div className="flex items-start gap-3 pt-4 border-t">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t.shippingAddress}</p>
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
                  {t.productDetails}
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
                      <Badge variant="secondary" className="text-base px-4 py-2 font-mono bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        ASIN: {invoice.asin}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={isRtl ? 'text-right' : 'text-left'}>{t.product}</TableHead>
                        <TableHead className="text-center">{t.quantity}</TableHead>
                        <TableHead className="text-center">{t.unitPrice}</TableHead>
                        <TableHead className={isRtl ? 'text-left' : 'text-right'}>{t.total}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">{invoice.product_name}</TableCell>
                        <TableCell className="text-center">{invoice.quantity || 1}</TableCell>
                        <TableCell className="text-center">
                          {unitPrice ? formatCurrency(unitPrice) : '-'}
                        </TableCell>
                        <TableCell className={isRtl ? 'text-left' : 'text-right'}>
                          {subtotal ? formatCurrency(subtotal) : '-'}
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
              <CardTitle>{t.invoiceSummary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subtotal && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
              )}
              
              {invoice.tax_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.tax}</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}

              {invoice.total_amount && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-semibold text-lg">{t.finalTotal}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(invoice.total_amount)}
                  </span>
                </div>
              )}

              {invoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">{t.notes}</p>
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
                  <FileText className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                  {t.viewInvoicePdf}
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
                  <Download className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                  {t.downloadInvoice}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>{t.brandName}</p>
            <p>{t.thankYou}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewInvoice;
