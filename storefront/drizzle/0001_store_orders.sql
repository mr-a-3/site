CREATE TABLE store_orders (
 id TEXT PRIMARY KEY NOT NULL,
 customer TEXT NOT NULL,
 phone TEXT NOT NULL,
 items TEXT NOT NULL,
 total_minor INTEGER NOT NULL,
 currency TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
