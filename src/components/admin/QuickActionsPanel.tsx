import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  Printer,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface QuickActionsPanelProps {
  currentStatus: OrderStatus;
  orderNumber: string;
  onStatusChange: (newStatus: OrderStatus) => void;
  onShipOrder: () => void;
}

export const QuickActionsPanel = ({ 
  currentStatus, 
  orderNumber,
  onStatusChange,
  onShipOrder
}: QuickActionsPanelProps) => {
  const handleCopyOrderInfo = () => {
    navigator.clipboard.writeText(`رقم الطلب: ${orderNumber}`);
    toast.success('تم نسخ معلومات الطلب');
  };

  const handlePrintInvoice = () => {
    window.print();
    toast.success('جاري طباعة الفاتورة...');
  };

  const getQuickActions = () => {
    const actions = [];

    // أزرار حسب الحالة
    if (currentStatus === 'pending') {
      actions.push(
        <Button
          key="confirm"
          onClick={() => onStatusChange('processing')}
          className="flex-1 gap-2"
          size="lg"
        >
          <CheckCircle className="w-5 h-5" />
          تأكيد الطلب
        </Button>
      );
    }

    if (currentStatus === 'processing') {
      actions.push(
        <Button
          key="pack"
          onClick={() => onStatusChange('packed')}
          variant="secondary"
          className="flex-1 gap-2"
          size="lg"
        >
          <Package className="w-5 h-5" />
          جهز للشحن
        </Button>
      );
    }

    if (currentStatus === 'packed') {
      actions.push(
        <Button
          key="ship"
          onClick={onShipOrder}
          className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          size="lg"
        >
          <Truck className="w-5 h-5" />
          شحن الطلب
        </Button>
      );
    }

    if (currentStatus === 'shipped') {
      actions.push(
        <Button
          key="deliver"
          onClick={() => onStatusChange('delivered')}
          className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          size="lg"
        >
          <CheckCircle className="w-5 h-5" />
          تأكيد التوصيل
        </Button>
      );
    }

    // الإجراءات المتاحة دائماً
    if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
      actions.push(
        <Button
          key="cancel"
          onClick={() => onStatusChange('cancelled')}
          variant="destructive"
          className="gap-2"
          size="lg"
        >
          <XCircle className="w-5 h-5" />
          إلغاء الطلب
        </Button>
      );
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">إجراءات سريعة</h3>
      </div>

      {/* الأزرار الرئيسية */}
      <div className="flex gap-3 flex-wrap">
        {getQuickActions()}
      </div>

      {/* الإجراءات الإضافية */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          onClick={handlePrintInvoice}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          طباعة الفاتورة
        </Button>
        <Button
          onClick={handleCopyOrderInfo}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          نسخ معلومات الطلب
        </Button>
      </div>
    </div>
  );
};
