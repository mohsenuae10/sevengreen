import { Facebook, Instagram, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary mb-3">Seven Green</h3>
            <p className="text-sm text-muted-foreground">
              منتجات العناية الطبيعية - صوابين، شامبو، ومنتجات التجميل
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  المنتجات
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">تواصل معنا</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Seven Green. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};
