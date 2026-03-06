import { Share2, MessageCircle, Twitter, Facebook, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

interface SocialShareProps {
  productName: string;
  productUrl?: string;
}

export default function SocialShare({ productName, productUrl }: SocialShareProps) {
  const { t } = useLanguageCurrency();
  const url = productUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const text = t('social.checkProduct', { name: productName });

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      '_blank'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t('social.linkCopiedTitle'),
        description: t('social.linkCopiedDesc'),
      });
    } catch (error) {
      toast({
        title: t('social.copyFailed'),
        description: t('social.copyFailedDesc'),
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{t('social.shareOnWhatsApp')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2">
          <Twitter className="h-4 w-4" />
          <span>{t('social.shareOnTwitter')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2">
          <Facebook className="h-4 w-4" />
          <span>{t('social.shareOnFacebook')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="gap-2">
          <Copy className="h-4 w-4" />
          <span>{t('social.copyLink')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
