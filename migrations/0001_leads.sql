CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  ip_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL,
  district TEXT NOT NULL,
  timeline TEXT NOT NULL,
  area_m2 REAL,
  description TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  budget_band TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  privacy_ack INTEGER NOT NULL DEFAULT 1,
  notification_status INTEGER NOT NULL DEFAULT 0,
  notification_attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_ip_rate_idx ON leads(ip_hash,created_at);
CREATE INDEX IF NOT EXISTS leads_outbox_idx ON leads(notification_status,notification_attempts,created_at);
