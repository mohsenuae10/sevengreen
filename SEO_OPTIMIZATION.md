# دليل تحسين محركات البحث - لمسة الجمال | Lamset Beauty

## نظرة عامة
يشرح هذا المستند تحسينات محركات البحث (SEO) المطبقة في متجر لمسة الجمال لتحسين ترتيب الموقع في محركات البحث.

## Date Management

### Problem
Static dates in SEO markup and sitemaps can hurt search engine rankings because:
- Outdated `priceValidUntil` dates suggest stale pricing
- Old sitemap `lastmod` dates indicate content hasn't been updated
- Search engines may deprioritize pages that appear outdated

### Solution Implemented

#### 1. Dynamic Price Validity Date
**File:** `src/components/SEO/ProductSchema.tsx`

The `priceValidUntil` field in the Product Schema now dynamically calculates a date 1 year in the future:

```typescript
// Generate dynamic priceValidUntil date (1 year from now)
const priceValidUntil = new Date();
priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
const priceValidUntilString = priceValidUntil.toISOString().split('T')[0];
```

**Benefits:**
- Always shows current, valid pricing to search engines
- Automatically updates without manual intervention
- Signals to search engines that products are actively maintained

#### 2. Dynamic Sitemaps

**Edge Functions:**
- `supabase/functions/generate-sitemap/` - Main sitemap with all pages
- `supabase/functions/generate-product-sitemap/` - Detailed product sitemap with images

**Static Files:**
- `public/sitemap.xml` - Fallback for main pages, updated to current date
- `public/sitemap-products.xml` - Points to dynamic endpoint

**How it works:**
1. Edge functions query the database for active products
2. Generate XML with current timestamps
3. Use `product.updated_at` for accurate lastmod dates
4. Include product images for better image search ranking
5. Calculate priority dynamically based on product price

**الوصول إلى Sitemaps الديناميكية:**
- الرئيسية: `https://lamsetbeauty.com/functions/v1/generate-sitemap`
- المنتجات: `https://lamsetbeauty.com/functions/v1/generate-product-sitemap`

## Robots.txt Configuration

Update your `public/robots.txt` to point search engines to the dynamic sitemaps:

```
User-agent: *
Allow: /

# Point to dynamic sitemaps for freshest data
Sitemap: https://lamsetbeauty.com/functions/v1/generate-sitemap
Sitemap: https://lamsetbeauty.com/functions/v1/generate-product-sitemap
```

## Best Practices

### For Content Updates
1. Update `product.updated_at` whenever product information changes
2. The sitemap will automatically reflect these changes
3. No manual sitemap regeneration needed

### For New Products
1. Add product to database with `is_active = true`
2. Ensure a slug is generated (automatic via trigger)
3. Product will automatically appear in next sitemap generation

### Monitoring SEO Health
Check these regularly:
- Google Search Console for crawl errors
- Sitemap submission status
- Index coverage reports
- Product structured data validity (via Rich Results Test)

## Technical Details

### ProductSchema Fields
The product schema includes all recommended Schema.org Product fields:
- Basic info: name, description, image, sku
- Pricing: price, priceCurrency, priceValidUntil
- Availability: InStock/OutOfStock
- Shipping details: free shipping to Saudi Arabia, 3-5 day delivery
- Return policy: 14-day return window
- Images: All product images included
- Country of origin: When available

### Sitemap Features
- XML format compliant with sitemaps.org protocol
- Image sitemap tags for product photos
- Priority calculation based on content importance
- Change frequency hints for crawlers
- Compressed response with 1-hour cache

## Impact on SEO

### Improvements Made
✅ **Fresh Content Signals** - Dynamic dates show search engines content is current
✅ **Accurate Product Data** - Real-time inventory and pricing information
✅ **Image Discoverability** - Product images included in sitemap for image search
✅ **Proper Structured Data** - Complete Schema.org Product markup
✅ **Crawl Efficiency** - Up-to-date sitemaps help search engines discover content faster

### Expected Results
- Better crawl rate from search engines
- More accurate product listings in search results
- Improved rich snippet display
- Higher ranking for product pages
- Better image search visibility

## Maintenance

### Regular Tasks
- None required for date management (fully automatic)
- Monitor Edge Function logs for errors
- Check sitemap accessibility monthly

### Updates Required When
- Changing domain name → Update base URLs in edge functions
- Modifying product schema → Update ProductSchema.tsx
- Adding new static pages → Update generate-sitemap function

## Troubleshooting

### If sitemaps show old dates
1. Check if Edge Functions are deployed and accessible
2. Verify database connection in Edge Functions
3. Clear CDN cache if applicable
4. Check robots.txt points to correct endpoints

### If products missing from sitemap
1. Verify `is_active = true` in database
2. Check if slug is generated properly
3. Review Edge Function logs for errors
4. Test sitemap endpoint directly

## Resources
- [Google Search Central - Sitemaps](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Schema.org Product Documentation](https://schema.org/Product)
- [Google Merchant Center Product Data Specification](https://support.google.com/merchants/answer/7052112)
