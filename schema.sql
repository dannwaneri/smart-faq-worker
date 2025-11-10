-- FAQ articles
CREATE TABLE faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Query analytics
CREATE TABLE queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    mode TEXT NOT NULL,
    matched_faq_ids TEXT,
    response_time_ms INTEGER,
    timestamp INTEGER DEFAULT (unixepoch())
);

-- User feedback
CREATE TABLE feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER,
    rating INTEGER,
    helpful BOOLEAN,
    comment TEXT,
    timestamp INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (query_id) REFERENCES queries(id)
);

-- Indexes
CREATE INDEX idx_queries_timestamp ON queries(timestamp);
CREATE INDEX idx_faqs_category ON faqs(category);