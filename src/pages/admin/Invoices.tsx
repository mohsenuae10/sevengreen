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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Upload, QrCode, Download, Trash2, Eye, FileText, Pencil, BarChart3, Globe } from 'lucide-react';
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
  product_name: string | null;
  product_image_url: string | null;
  asin: string | null;
  quantity: number | null;
  tax_amount: number | null;
  shipping_address: string | null;
  amazon_store_name: string | null;
  tax_number: string | null;
  view_count: number | null;
}

interface InvoiceVisit {
  id: string;
  invoice_id: string;
  visited_at: string;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
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
  const [isVisitsDialogOpen, setIsVisitsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // New Amazon fields
  const [productName, setProductName] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [asin, setAsin] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [amazonStoreName, setAmazonStoreName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Calculated values
  const subtotal = unitPrice && quantity ? parseFloat(unitPrice) * parseInt(quantity) : 0;
  const taxAmount = subtotal * 0.15;
  const finalTotal = subtotal + taxAmount;

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

  // Fetch visits for selected invoice
  const { data: invoiceVisits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['invoice-visits', selectedInvoice?.id],
    queryFn: async () => {
      if (!selectedInvoice) return [];
      const { data, error } = await supabase
        .from('invoice_visits')
        .select('*')
        .eq('invoice_id', selectedInvoice.id)
        .order('visited_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as InvoiceVisit[];
    },
    enabled: !!selectedInvoice && isVisitsDialogOpen
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async () => {
      if (!pdfFile) throw new Error('يرجى اختيار ملف PDF');
      if (!invoiceNumber.trim()) throw new Error('يرجى إدخال رقم الفاتورة');

      setIsUploading(true);

      // Upload PDF - sanitize filename to remove Arabic and special characters
      const fileExtension = pdfFile.name.split('.').pop() || 'pdf';
      const sanitizedName = `invoice-${Date.now()}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(sanitizedName, pdfFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(sanitizedName);

      // Create invoice record
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber.trim(),
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
          order_id: orderId || null,
          pdf_url: urlData.publicUrl,
          total_amount: finalTotal || null,
          notes: notes.trim() || null,
          created_at: new Date(issueDate).toISOString(),
          product_name: productName.trim() || null,
          product_image_url: productImageUrl.trim() || null,
          asin: asin.trim() || null,
          quantity: quantity ? parseInt(quantity) : 1,
          tax_amount: taxAmount || null,
          shipping_address: shippingAddress.trim() || null,
          amazon_store_name: amazonStoreName.trim() || null,
          tax_number: taxNumber.trim() || null
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

  // Update invoice mutation
  const updateInvoice = useMutation({
    mutationFn: async () => {
      if (!editingInvoice) throw new Error('لا توجد فاتورة للتحديث');
      if (!invoiceNumber.trim()) throw new Error('يرجى إدخال رقم الفاتورة');

      setIsUploading(true);

      let pdfUrl = editingInvoice.pdf_url;

      // If new PDF file is selected, upload it
      if (pdfFile) {
        const fileExtension = pdfFile.name.split('.').pop() || 'pdf';
        const sanitizedName = `invoice-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(sanitizedName, pdfFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('invoices')
          .getPublicUrl(sanitizedName);

        pdfUrl = urlData.publicUrl;
      }

      // Update invoice record
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          invoice_number: invoiceNumber.trim(),
          customer_name: customerName.trim() || null,
          customer_phone: customerPhone.trim() || null,
          order_id: orderId || null,
          pdf_url: pdfUrl,
          total_amount: finalTotal || null,
          notes: notes.trim() || null,
          created_at: new Date(issueDate).toISOString(),
          product_name: productName.trim() || null,
          product_image_url: productImageUrl.trim() || null,
          asin: asin.trim() || null,
          quantity: quantity ? parseInt(quantity) : 1,
          tax_amount: taxAmount || null,
          shipping_address: shippingAddress.trim() || null,
          amazon_store_name: amazonStoreName.trim() || null,
          tax_number: taxNumber.trim() || null
        })
        .eq('id', editingInvoice.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('تم تحديث الفاتورة بنجاح');
      resetForm();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setEditingInvoice(null);
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
    setNotes('');
    setPdfFile(null);
    setIssueDate(format(new Date(), 'yyyy-MM-dd'));
    setProductName('');
    setProductImageUrl('');
    setAsin('');
    setQuantity('1');
    setUnitPrice('');
    setShippingAddress('');
    setAmazonStoreName('');
    setTaxNumber('');
    setIsEditMode(false);
    setEditingInvoice(null);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditMode(true);
    setInvoiceNumber(invoice.invoice_number);
    setCustomerName(invoice.customer_name || '');
    setCustomerPhone(invoice.customer_phone || '');
    setOrderId(invoice.order_id || '');
    setNotes(invoice.notes || '');
    setIssueDate(format(new Date(invoice.created_at), 'yyyy-MM-dd'));
    setProductName(invoice.product_name || '');
    setProductImageUrl(invoice.product_image_url || '');
    setAsin(invoice.asin || '');
    setQuantity(invoice.quantity?.toString() || '1');
    // Calculate unit price from total and tax
    const storedTax = invoice.tax_amount || 0;
    const storedTotal = invoice.total_amount || 0;
    const storedSubtotal = storedTotal - storedTax;
    const storedQty = invoice.quantity || 1;
    const calculatedUnitPrice = storedQty > 0 ? storedSubtotal / storedQty : 0;
    setUnitPrice(calculatedUnitPrice > 0 ? calculatedUnitPrice.toFixed(2) : '');
    setShippingAddress(invoice.shipping_address || '');
    setAmazonStoreName(invoice.amazon_store_name || '');
    setTaxNumber(invoice.tax_number || '');
    setPdfFile(null);
    setIsDialogOpen(true);
  };

  const getInvoiceUrl = (accessCode: string) => {
    // Use store domain for QR code URL
    return `https://lamsetbeauty.com/invoice/${accessCode}`;
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
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة فاتورة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'قم بتعديل بيانات الفاتورة' : 'ارفع ملف PDF للفاتورة وسيتم إنشاء QR Code تلقائياً'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Select value={orderId || "none"} onValueChange={(val) => setOrderId(val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طلب..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون ربط</SelectItem>
                      {orders?.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.order_number} - {order.customer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issueDate">تاريخ الإصدار *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="unitPrice">سعر الوحدة *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {/* Calculated Values Display */}
                {unitPrice && quantity && (
                  <div className="col-span-full bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المجموع الفرعي ({quantity} × {parseFloat(unitPrice).toFixed(2)})</span>
                      <span className="font-medium">{subtotal.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الضريبة (15%)</span>
                      <span className="font-medium">{taxAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>الإجمالي النهائي</span>
                      <span className="text-primary">{finalTotal.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                )}

                {/* Amazon Product Details Section */}
                <div className="col-span-full border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-3">تفاصيل المنتج (أمازون)</h3>
                </div>

                <div>
                  <Label htmlFor="productName">اسم المنتج</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="اسم المنتج على أمازون"
                  />
                </div>

                <div>
                  <Label htmlFor="asin">رقم ASIN</Label>
                  <Input
                    id="asin"
                    value={asin}
                    onChange={(e) => setAsin(e.target.value)}
                    placeholder="B0XXXXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">العدد</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="amazonStoreName">اسم المتجر على أمازون</Label>
                  <Input
                    id="amazonStoreName"
                    value={amazonStoreName}
                    onChange={(e) => setAmazonStoreName(e.target.value)}
                    placeholder="Amazon Store Name"
                  />
                </div>

                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي (VAT)</Label>
                  <Input
                    id="taxNumber"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="300000000000003"
                  />
                </div>

                <div>
                  <Label htmlFor="productImageUrl">رابط صورة المنتج</Label>
                  <Input
                    id="productImageUrl"
                    value={productImageUrl}
                    onChange={(e) => setProductImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="shippingAddress">عنوان الشحن</Label>
                  <Input
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="عنوان الشحن الكامل"
                  />
                </div>

                {/* File Upload Section */}
                <div className="col-span-full border-t pt-4 mt-2">
                  <h3 className="font-semibold mb-3">ملف الفاتورة</h3>
                </div>

                <div>
                  <Label htmlFor="pdf">
                    ملف الفاتورة PDF {isEditMode ? '(اختياري - اتركه فارغاً للإبقاء على الملف الحالي)' : '*'}
                  </Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {isEditMode && editingInvoice && (
                    <p className="text-sm text-muted-foreground mt-1">
                      الملف الحالي: <a href={editingInvoice.pdf_url} target="_blank" className="text-primary underline">عرض</a>
                    </p>
                  )}
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

                {!isEditMode && (!pdfFile || !invoiceNumber.trim()) && (
                  <p className="col-span-full text-sm text-destructive mb-2">
                    {!invoiceNumber.trim() && !pdfFile 
                      ? '* يرجى إدخال رقم الفاتورة واختيار ملف PDF'
                      : !invoiceNumber.trim() 
                        ? '* يرجى إدخال رقم الفاتورة'
                        : '* يرجى اختيار ملف PDF'}
                  </p>
                )}
                {isEditMode && !invoiceNumber.trim() && (
                  <p className="col-span-full text-sm text-destructive mb-2">
                    * يرجى إدخال رقم الفاتورة
                  </p>
                )}
                <Button
                  onClick={() => isEditMode ? updateInvoice.mutate() : createInvoice.mutate()}
                  disabled={isUploading || (!isEditMode && !pdfFile) || !invoiceNumber.trim()}
                  className="col-span-full w-full"
                >
                  {isUploading ? (
                    <>جاري {isEditMode ? 'التحديث' : 'الرفع'}...</>
                  ) : (
                    <>
                      <Upload className="ml-2 h-4 w-4" />
                      {isEditMode ? 'تحديث الفاتورة' : 'رفع الفاتورة'}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">الفواتير الصالحة</CardTitle>
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
                    <TableHead>الزيارات</TableHead>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsVisitsDialogOpen(true);
                          }}
                        >
                          <BarChart3 className="h-4 w-4 ml-1" />
                          {invoice.view_count || 0}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.created_at), 'dd MMM yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.is_active ? 'default' : 'secondary'}>
                          {invoice.is_active ? 'صالحة' : 'غير صالحة'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(invoice)}
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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

        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle>QR Code - فاتورة {selectedInvoice?.invoice_number}</DialogTitle>
              <DialogDescription>امسح الكود لعرض الفاتورة</DialogDescription>
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

        {/* Visits Analytics Dialog */}
        <Dialog open={isVisitsDialogOpen} onOpenChange={setIsVisitsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                إحصائيات الزيارات - {selectedInvoice?.invoice_number}
              </DialogTitle>
              <DialogDescription>
                إجمالي الزيارات: {selectedInvoice?.view_count || 0} زيارة
              </DialogDescription>
            </DialogHeader>
            {isLoadingVisits ? (
              <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>
            ) : invoiceVisits?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>لا توجد زيارات مسجلة بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Country Stats */}
                <div>
                  <h4 className="font-medium mb-2">الدول</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(
                      invoiceVisits?.reduce((acc: Record<string, number>, visit) => {
                        const country = visit.country_name || 'غير معروف';
                        acc[country] = (acc[country] || 0) + 1;
                        return acc;
                      }, {}) || {}
                    ).map(([country, count]) => (
                      <Badge key={country} variant="secondary" className="text-sm">
                        {country}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recent Visits Table */}
                <div>
                  <h4 className="font-medium mb-2">آخر الزيارات</h4>
                  <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الموقع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceVisits?.slice(0, 20).map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell className="text-sm">
                              {format(new Date(visit.visited_at), 'dd MMM yyyy HH:mm', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-sm">
                              {visit.city && visit.country_name 
                                ? `${visit.city}, ${visit.country_name}`
                                : visit.country_name || 'غير معروف'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
