CREATE TABLE IF NOT EXISTS inventory(product_id INTEGER PRIMARY KEY, stock INTEGER NOT NULL CHECK(stock>=0));
CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, uuid TEXT NOT NULL UNIQUE, issued_at TEXT NOT NULL, subtotal REAL NOT NULL, vat REAL NOT NULL, total REAL NOT NULL, vat_rate REAL NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL, payment_reference TEXT, zatca_status TEXT NOT NULL, zatca_response TEXT);
CREATE TABLE IF NOT EXISTS order_items(order_id TEXT NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL, name TEXT NOT NULL, ar TEXT NOT NULL, qty INTEGER NOT NULL, size TEXT NOT NULL, milk TEXT NOT NULL, unit_price REAL NOT NULL, line_total REAL NOT NULL);
CREATE TABLE IF NOT EXISTS admin_sessions(token_hash TEXT PRIMARY KEY, csrf_hash TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_login_attempts(client_key TEXT PRIMARY KEY, window_started INTEGER NOT NULL, failures INTEGER NOT NULL, blocked_until INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS app_config(key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_orders_issued_at ON orders(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
