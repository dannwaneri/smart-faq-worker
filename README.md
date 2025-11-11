# 🤖 Smart FAQ System

An AI-powered FAQ management system built on Cloudflare's edge infrastructure. Features semantic search, RAG (Retrieval-Augmented Generation), and real-time analytics.

## 🚀 Live Demos

- **API Endpoint:** https://smart-faq-worker.fpl-test.workers.dev
- **Admin Dashboard:** https://smart-faq-admin.fpl-test.workers.dev
- **Embeddable Widget:** https://faq-widget.fpl-test.workers.dev

## ✨ Features

- **Semantic Search** - Understands user intent, not just keywords
- **RAG Answers** - AI generates natural language responses with source citations
- **Vector Database** - Fast similarity search with Vectorize
- **Caching Layer** - Sub-second response times with KV
- **Analytics** - Track popular queries and response times
- **Admin Dashboard** - Manage FAQs, test search, view analytics
- **Embeddable Widget** - Drop-in chat widget for any website

## 🏗️ Architecture

### Backend (smart-faq-worker)
- **Workers AI** - Text embeddings + LLM inference
- **Vectorize** - Vector similarity search
- **D1 Database** - FAQ storage and analytics
- **KV Cache** - Response caching
- **REST API** - Full CRUD operations

### Frontend (smart-faq-admin)
- **React + TypeScript** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Three-tab Interface** - FAQ management, search testing, analytics

### Widget (faq-widget)
- **Embeddable Chat** - Floating chat button
- **Real-time Search** - Instant AI answers
- **Source Citations** - Shows matched FAQs

## 📊 Tech Stack

- Cloudflare Workers (Edge compute)
- Workers AI (Embeddings + LLM)
- Vectorize (Vector database)
- D1 (SQL database)
- KV (Key-value cache)
- React + TypeScript
- Tailwind CSS

## 🔧 API Endpoints
```
POST /api/seed          - Load demo FAQs
POST /api/search        - Semantic search
POST /api/answer        - Get AI answer (RAG)
GET  /api/faqs          - List all FAQs
POST /api/faqs          - Add new FAQ
DELETE /api/faqs/:id    - Delete FAQ
GET  /api/analytics     - Usage statistics
POST /api/feedback      - Submit feedback
```

## 🎯 Use Cases

- Customer support automation
- Internal knowledge bases
- Product documentation search
- E-commerce help centers
- SaaS product FAQs

## 📈 Performance

- **Response Time:** 500ms - 6s (first query), <1s (cached)
- **Accuracy:** 70-85% similarity for relevant queries
- **Scalability:** Runs on Cloudflare's global edge network
- **Cost:** ~$5-10/day for 100k queries

## 🚀 Quick Start

### Deploy Backend
```bash
cd smart-faq-worker
npm install
npm run deploy
```

### Deploy Admin Dashboard
```bash
cd smart-faq-admin
npm install
npm run deploy
```

### Deploy Widget
```bash
cd faq-widget
npm install
npm run deploy
```

## 📦 Related Repositories

- [Admin Dashboard](https://github.com/dannwaneri/smart-faq-admin)
- [Embeddable Widget](https://github.com/dannwaneri/faq-widget)

## 📄 License

MIT

## 👤 Author

Built by [Daniel Nwaneri](https://github.com/dannwaneri)