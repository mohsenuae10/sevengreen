-- Migration: Add missing English language columns to products, categories, and blog_posts tables
-- This migration is safe to re-run (uses IF NOT EXISTS)
-- All new columns are nullable to preserve existing data

-- Products table English columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS long_description_en TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_en TEXT,
  ADD COLUMN IF NOT EXISTS how_to_use_en TEXT,
  ADD COLUMN IF NOT EXISTS benefits_en TEXT,
  ADD COLUMN IF NOT EXISTS warnings_en TEXT,
  ADD COLUMN IF NOT EXISTS category_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_description_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords_en TEXT;

-- Categories table English columns
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Blog posts table English columns
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_description_en TEXT;
