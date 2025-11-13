-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Create URL redirects table for old slugs
CREATE TABLE IF NOT EXISTS url_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug TEXT UNIQUE NOT NULL,
  new_slug TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  redirect_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read redirects
CREATE POLICY "الـ redirects متاحة للقراءة للجميع"
  ON url_redirects FOR SELECT
  USING (true);

-- Policy: Only admins can manage redirects
CREATE POLICY "المسؤولون فقط يمكنهم إدارة الـ redirects"
  ON url_redirects FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_url_redirects_old_slug ON url_redirects(old_slug);
CREATE INDEX IF NOT EXISTS idx_url_redirects_product_id ON url_redirects(product_id);