import type { Env, FAQ } from './lib/types';
import { searchFAQs } from './lib/search';
import { generateAnswer } from './lib/answer';
import { indexFAQ, deleteFAQ, getAllFAQs } from './lib/faq-manager';

// Demo FAQs for seeding
const DEMO_FAQS: FAQ[] = [
	{
		id: '1',
		question: 'How do I reset my password?',
		answer: 'Click "Forgot Password" on the login page. Enter your email and we\'ll send you a reset link within 5 minutes.',
		category: 'account'
	},
	{
		id: '2',
		question: 'What payment methods do you accept?',
		answer: 'We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are encrypted and secure.',
		category: 'billing'
	},
	{
		id: '3',
		question: 'How long does shipping take?',
		answer: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available for $15 extra.',
		category: 'shipping'
	},
	{
		id: '4',
		question: 'Can I cancel my order?',
		answer: 'Yes, you can cancel within 24 hours of ordering. Go to My Orders and click Cancel. Refunds take 5-7 business days.',
		category: 'orders'
	},
	{
		id: '5',
		question: 'What is your return policy?',
		answer: 'Items can be returned within 30 days of delivery. Products must be unused and in original packaging. Return shipping is free.',
		category: 'returns'
	}
];

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Seed demo data
			if (url.pathname === '/api/seed' && request.method === 'POST') {
				for (const faq of DEMO_FAQS) {
					await indexFAQ(faq, env);
				}
				return Response.json({ success: true, count: DEMO_FAQS.length }, { headers: corsHeaders });
			}

			// Public API: Search
			if (url.pathname === '/api/search' && request.method === 'POST') {
				const { query } = await request.json() as { query: string };
				const results = await searchFAQs(query, env);
				return Response.json(results, { headers: corsHeaders });
			}

			// Public API: Get AI Answer
			if (url.pathname === '/api/answer' && request.method === 'POST') {
				const { query } = await request.json() as { query: string };
				const result = await generateAnswer(query, env);
				return Response.json(result, { headers: corsHeaders });
			}

			// Public API: Submit Feedback
			if (url.pathname === '/api/feedback' && request.method === 'POST') {
				const { queryId, rating, helpful, comment } = await request.json() as any;
				await env.DB.prepare(
					'INSERT INTO feedback (query_id, rating, helpful, comment) VALUES (?, ?, ?, ?)'
				).bind(queryId, rating, helpful, comment).run();
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// Admin API: Get all FAQs
			if (url.pathname === '/api/faqs' && request.method === 'GET') {
				const faqs = await getAllFAQs(env);
				return Response.json(faqs, { headers: corsHeaders });
			}

			// Admin API: Add FAQ
			if (url.pathname === '/api/faqs' && request.method === 'POST') {
				const faq = await request.json() as FAQ;
				await indexFAQ(faq, env);
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// Admin API: Delete FAQ
			if (url.pathname.startsWith('/api/faqs/') && request.method === 'DELETE') {
				const id = url.pathname.split('/').pop();
				if (id) await deleteFAQ(id, env);
				return Response.json({ success: true }, { headers: corsHeaders });
			}

			// Admin API: Analytics
			if (url.pathname === '/api/analytics' && request.method === 'GET') {
				const analytics = await getAnalytics(env);
				return Response.json(analytics, { headers: corsHeaders });
			}

			// Home page
			return new Response(`
🤖 Smart FAQ Assistant API

Available Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/seed          → Load demo FAQs
POST /api/search        → Semantic search
POST /api/answer        → Get AI answer (RAG)
POST /api/feedback      → Submit feedback
GET  /api/faqs          → List all FAQs
POST /api/faqs          → Add new FAQ
DELETE /api/faqs/:id    → Delete FAQ
GET  /api/analytics     → Usage stats

Status: ✅ Online
			`, {
				headers: { 'Content-Type': 'text/plain', ...corsHeaders }
			});

		} catch (error: any) {
			console.error('Worker error:', error);
			return Response.json({ 
				error: error.message || 'An error occurred'
			}, { 
				status: 500,
				headers: corsHeaders
			});
		}
	}
};

async function getAnalytics(env: Env) {
	// Popular queries
	const popularQueries = await env.DB.prepare(`
		SELECT query, COUNT(*) as count, AVG(response_time_ms) as avg_time
		FROM queries
		WHERE timestamp > unixepoch() - 604800
		GROUP BY query
		ORDER BY count DESC
		LIMIT 10
	`).all();

	// Feedback stats
	const feedbackStats = await env.DB.prepare(`
		SELECT 
			AVG(rating) as avg_rating,
			SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
			COUNT(*) as total_feedback
		FROM feedback
	`).first();

	return {
		popularQueries: popularQueries.results,
		feedbackStats
	};
}
