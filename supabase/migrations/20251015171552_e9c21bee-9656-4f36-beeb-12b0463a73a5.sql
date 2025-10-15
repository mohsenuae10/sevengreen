-- إضافة عمودي النطاق في جدول site_settings
ALTER TABLE site_settings
ADD COLUMN store_domain TEXT DEFAULT 'sevengreenstore.com',
ADD COLUMN store_url TEXT DEFAULT 'https://sevengreenstore.com';

-- تحديث السجل الموجود بمعلومات النطاق
UPDATE site_settings
SET store_domain = 'sevengreenstore.com',
    store_url = 'https://sevengreenstore.com'
WHERE id = '38be80b4-2e75-4c6d-b8b8-76fa2d1e4348';