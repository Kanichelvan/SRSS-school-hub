PRAGMA foreign_keys = ON;

CREATE TABLE site_content_versions (
  id INTEGER PRIMARY KEY,
  version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  published_by INTEGER,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE homepage_sections (
  id INTEGER PRIMARY KEY,
  content_version_id INTEGER NOT NULL REFERENCES site_content_versions(id),
  section_key TEXT NOT NULL,
  heading TEXT,
  eyebrow TEXT,
  body TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE homepage_items (
  id INTEGER PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  title TEXT,
  label TEXT,
  description TEXT,
  numeric_value INTEGER,
  display_value TEXT,
  route TEXT,
  asset_id INTEGER,
  metadata_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE asset_library (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT NOT NULL,
  caption TEXT,
  source TEXT,
  consent_status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE about_page_content (
  id INTEGER PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  hero_eyebrow TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_body TEXT NOT NULL,
  hero_asset_id INTEGER REFERENCES asset_library(id),
  hero_alt_text TEXT NOT NULL,
  founding_title TEXT NOT NULL,
  founding_body TEXT NOT NULL,
  founding_support TEXT NOT NULL,
  value_week_json TEXT NOT NULL,
  principal_message_json TEXT NOT NULL,
  updated_by INTEGER,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE about_page_milestones (
  id INTEGER PRIMARY KEY,
  about_page_content_id INTEGER NOT NULL REFERENCES about_page_content(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE homepage_updates (
  id INTEGER PRIMARY KEY,
  content_version_id INTEGER NOT NULL REFERENCES site_content_versions(id),
  type TEXT NOT NULL CHECK (type IN ('School news', 'Upcoming event', 'Announcement')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  display_date TEXT NOT NULL,
  published_at TEXT,
  route TEXT,
  asset_id INTEGER REFERENCES asset_library(id),
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE INDEX idx_homepage_sections_version ON homepage_sections(content_version_id, sort_order);
CREATE INDEX idx_homepage_items_section ON homepage_items(section_id, sort_order);
CREATE INDEX idx_homepage_updates_status ON homepage_updates(status, published_at);
CREATE INDEX idx_about_milestones_page ON about_page_milestones(about_page_content_id, sort_order);
