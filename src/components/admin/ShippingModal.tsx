import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, ExternalLink } from 'lucide-react';

const shippingCompanies = [
  { value: 'smsa', label: 'SMSA Express', trackingUrl: 'https://www.smsaexpress.com/ar/tracking/?tracking=' },
  { value: 'aramex', label: 'Aramex', trackingUrl: 'https://www.aramex.com/ae/ar/track/results?shipment_number=' },
  { value: 'dhl', label: 'DHL', trackingUrl: 'https://www.dhl.com/sa-ar/home/tracking/tracking-express.html?submit=1&tracking-id=' },
  { value: 'fedex', label: 'FedEx', trackingUrl: 'https://www.fedex.com/apps/fedextrack/?tracknumbers=' },
  { value: 'ups', label: 'UPS', trackingUrl: 'https://www.ups.com/track?tracknum=' },
  { value: 'other', label: 'شركة أخرى', trackingUrl: '' }
];

interface ShippingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { trackingNumber: string; company: string; sendEmail: boolean }) => void;
  loading?: boolean;
}

export const ShippingModal = ({ open, onClose, onSubmit, loading }: ShippingModalProps) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [company, setCompany] = useState('smsa');
  const [sendEmail, setSendEmail] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    
    onSubmit({
      trackingNumber: trackingNumber.trim(),
      company,
      sendEmail
    });
  };

  const selectedCompany = shippingCompanies.find(c => c.value === company);
  const trackingUrl = selectedCompany?.trackingUrl 
    ? `${selectedCompany.trackingUrl}${trackingNumber}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            شحن الطلب
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* شركة الشحن */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-base font-semibold">
              شركة الشحن
            </Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger id="company" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shippingCompanies.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* رقم التتبع */}
          <div className="space-y-2">
            <Label htmlFor="tracking" className="text-base font-semibold">
              رقم التتبع (Tracking Number)
            </Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="أدخل رقم التتبع..."
              className="h-12 text-lg"
              dir="ltr"
              required
            />
          </div>

          {/* رابط التتبع */}
          {trackingUrl && trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">رابط تتبع الشحنة:</p>
              <a 
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                {trackingUrl}
              </a>
            </div>
          )}

          {/* إرسال بريد للعميل */}
          <div className="flex items-center gap-3 bg-accent/50 p-4 rounded-lg">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <Label
              htmlFor="sendEmail"
              className="text-sm font-medium cursor-pointer flex-1"
            >
              إرسال بريد إلكتروني للعميل برقم التتبع
            </Label>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              disabled={loading || !trackingNumber.trim()}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Truck className="w-5 h-5" />
              )}
              {loading ? 'جاري الحفظ...' : 'حفظ وإرسال'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
