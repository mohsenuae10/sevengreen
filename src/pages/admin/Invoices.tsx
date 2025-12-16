import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Upload, QrCode, Download, Trash2, Eye, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  order_id: string | null;
  pdf_url: string;
  access_code: string;
  total_amount: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
}

const Invoices = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    }
  });

  // Fetch orders for dropdown
  const { data: orders } = useQuery({
    queryKey: ['orders-for-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Order[];
    }
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async () => {
      if (!pdfFile) throw new Error('يرجى اختيار ملف PDF');
      if (!invoiceNumber.trim()) throw new Error('يرجى إدخال رقم الفاتورة');

      setIsUploading(true);

      // Upload PDF
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(fileName);

      // Create invoice record
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber.trim(),
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
          order_id: orderId || null,
          pdf_url: urlData.publicUrl,
          total_amount: totalAmount ? parseFloat(totalAmount) : null,
          notes: notes.trim() || null
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم إضافة الفاتورة بنجاح');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Delete invoice mutation
  const deleteInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      // Extract filename from URL
      const urlParts = invoice.pdf_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from('invoices').remove([fileName]);

      // Delete record
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم حذف الفاتورة');
    },
    onError: () => {
      toast.error('فشل حذف الفاتورة');
    }
  });

  const resetForm = () => {
    setInvoiceNumber('');
    setCustomerName('');
    setCustomerPhone('');
    setOrderId('');
    setTotalAmount('');
    setNotes('');
    setPdfFile(null);
  };

  const getInvoiceUrl = (accessCode: string) => {
    return `${window.location.origin}/invoice/${accessCode}`;
  };

  const downloadQRCode = (invoice: Invoice) => {
    const svg = document.getElementById(`qr-${invoice.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `invoice-${invoice.invoice_number}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الفواتير</h1>
            <p className="text-muted-foreground">إدارة فواتير العملاء مع QR Code</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة فاتورة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة فاتورة جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoiceNumber">رقم الفاتورة *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-001"
                  />
                </div>

                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل (اختياري)"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">رقم الهاتف</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div>
                  <Label>ربط بطلب (اختياري)</Label>
                  <Select value={orderId} onValueChange={setOrderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طلب..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون ربط</SelectItem>
                      {orders?.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - {order.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="totalAmount">المبلغ الإجمالي</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="pdf">ملف الفاتورة PDF *</Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات إضافية..."
                    rows={2}
                  />
                </div>

                <Button
                  onClick={() => createInvoice.mutate()}
                  disabled={isUploading || !pdfFile || !invoiceNumber.trim()}
                  className="w-full"
                >
                  {isUploading ? (
                    <>جاري الرفع...</>
                  ) : (
                    <>
                      <Upload className="ml-2 h-4 w-4" />
                      رفع الفاتورة
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الفواتير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الفواتير النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices?.filter(i => i.is_active).length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبالغ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0).toFixed(2)} ريال
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
            ) : invoices?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>لا توجد فواتير بعد</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {invoice.customer_name || '-'}
                        {invoice.customer_phone && (
                          <div className="text-sm text-muted-foreground">{invoice.customer_phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.total_amount ? `${invoice.total_amount.toFixed(2)} ريال` : '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.created_at), 'dd MMM yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.is_active ? 'default' : 'secondary'}>
                          {invoice.is_active ? 'نشط' : 'معطل'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsQRDialogOpen(true);
                            }}
                            title="عرض QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(invoice.pdf_url, '_blank')}
                            title="عرض PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                                deleteInvoice.mutate(invoice);
                              }
                            }}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {/* QR Code Dialog */}
        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle>QR Code - فاتورة {selectedInvoice?.invoice_number}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    id={`qr-${selectedInvoice.id}`}
                    value={getInvoiceUrl(selectedInvoice.access_code)}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-muted-foreground break-all">
                  {getInvoiceUrl(selectedInvoice.access_code)}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => downloadQRCode(selectedInvoice)}>
                    <Download className="ml-2 h-4 w-4" />
                    تحميل QR
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(getInvoiceUrl(selectedInvoice.access_code));
                      toast.success('تم نسخ الرابط');
                    }}
                  >
                    نسخ الرابط
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Invoices;
