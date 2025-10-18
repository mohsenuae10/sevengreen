-- Add promo_messages column to public_settings table
ALTER TABLE public.public_settings 
ADD COLUMN IF NOT EXISTS promo_messages jsonb DEFAULT '[
  {"text": "عرض خاص: خصم 20% على جميع المنتجات", "icon": "tag"},
  {"text": "شحن مجاني لجميع الطلبات داخل المملكة", "icon": "truck"},
  {"text": "منتجات طبيعية 100% آمنة للبشرة", "icon": "leaf"},
  {"text": "دعم فني متاح عبر واتساب", "icon": "headphones"}
]'::jsonb;

-- Update existing row if exists
UPDATE public.public_settings
SET promo_messages = '[
  {"text": "عرض خاص: خصم 20% على جميع المنتجات", "icon": "tag"},
  {"text": "شحن مجاني لجميع الطلبات داخل المملكة", "icon": "truck"},
  {"text": "منتجات طبيعية 100% آمنة للبشرة", "icon": "leaf"},
  {"text": "دعم فني متاح عبر واتساب", "icon": "headphones"}
]'::jsonb
WHERE promo_messages IS NULL;