PRAGMA foreign_keys = ON;

CREATE TABLE parent_hub_users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL CHECK (role IN ('parent', 'admin')), display_name TEXT NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE parent_hub_notices (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, audience TEXT NOT NULL, date TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, author_id INTEGER REFERENCES parent_hub_users(id));
CREATE TABLE parent_hub_events (id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, time TEXT, category TEXT NOT NULL, created_by INTEGER REFERENCES parent_hub_users(id));
CREATE TABLE parent_hub_documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, url TEXT, asset_id TEXT, updated_at TEXT NOT NULL);
CREATE TABLE parent_hub_assets (id TEXT PRIMARY KEY, filename TEXT NOT NULL, mime_type TEXT NOT NULL, data_url TEXT NOT NULL, alt_text TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE parent_hub_absences (id TEXT PRIMARY KEY, child_name TEXT NOT NULL, date TEXT NOT NULL, reason TEXT NOT NULL, note TEXT, status TEXT NOT NULL DEFAULT 'submitted', submitted_at TEXT NOT NULL);
