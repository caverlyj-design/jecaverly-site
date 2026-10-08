CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY,created_at TEXT NOT NULL,type TEXT NOT NULL CHECK(type IN ('consulting','training')),name TEXT NOT NULL,email TEXT NOT NULL,organization TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',location TEXT NOT NULL,timeframe TEXT NOT NULL,payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS inquiries_created_at ON inquiries(created_at);
CREATE TABLE IF NOT EXISTS inquiry_rate (rate_key TEXT PRIMARY KEY,window_start INTEGER NOT NULL,count INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS inquiry_rate_window ON inquiry_rate(window_start);
