-- ========================================================
-- ANG HIMAYA: SUPABASE DATABASE SCHEMA
-- Opisyal na Estudyanteng Pampahayagan ng PUP Lopez Campus
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ARTICLES & STORIES TABLE
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('news', 'column', 'editorial', 'feature', 'literary')),
    category TEXT NOT NULL DEFAULT 'Pangunahing Balita',
    deck TEXT,
    body TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'Patnugutan ng Ang Himaya',
    cover_image_url TEXT,
    image_caption TEXT,
    column_name TEXT,
    pull_quote TEXT,
    read_time TEXT DEFAULT '4 min pagbasa',
    is_lead BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(type);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_lead ON articles(is_lead);

-- 2. BREAKING NEWS FLASH DISPATCH (TICKER)
CREATE TABLE IF NOT EXISTS ticker_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DIGITAL EDITIONS & PDF ARCHIVE
CREATE TABLE IF NOT EXISTS editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    volume TEXT NOT NULL,
    issue TEXT NOT NULL,
    theme TEXT,
    description TEXT,
    cover_image_url TEXT,
    pdf_url TEXT,
    pages INTEGER DEFAULT 16,
    published_year INTEGER DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE editions ENABLE ROW LEVEL SECURITY;

-- Public reads are allowed by RLS; writes go through the authenticated Express API
-- using its server-only Supabase Secret/service-role key, which bypasses RLS.
DROP POLICY IF EXISTS "Public articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Editorial staff can insert articles" ON articles;
DROP POLICY IF EXISTS "Editorial staff can update articles" ON articles;
DROP POLICY IF EXISTS "Editorial staff can delete articles" ON articles;
CREATE POLICY "Public articles are viewable by everyone" 
ON articles FOR SELECT 
USING (is_published = true);

-- Ticker policies
DROP POLICY IF EXISTS "Public can view active ticker alerts" ON ticker_alerts;
DROP POLICY IF EXISTS "Editorial staff can manage ticker alerts" ON ticker_alerts;
CREATE POLICY "Public can view active ticker alerts" 
ON ticker_alerts FOR SELECT 
USING (is_active = true);

-- Editions policies
DROP POLICY IF EXISTS "Public can view editions" ON editions;
DROP POLICY IF EXISTS "Editorial staff can manage editions" ON editions;
CREATE POLICY "Public can view editions" 
ON editions FOR SELECT 
USING (true);
