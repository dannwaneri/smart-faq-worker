import type { Env, SearchResult } from './types';

export async function searchFAQs(query: string, env: Env) {
	const startTime = Date.now();

	// Check cache first
	const cacheKey = `search:${query.toLowerCase().trim()}`;
	const cached = await env.CACHE.get(cacheKey, 'json');
	if (cached) {
		return { ...cached, cached: true };
	}

	// Generate query embedding
	const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
		text: [query]
	}) as any;

	// Search Vectorize
	const vectorResults = await env.VECTORIZE.query(queryEmbedding.data[0], {
		topK: 5,
		returnMetadata: true
	});

	// Fetch full FAQ details from D1
	const faqIds = vectorResults.matches.map(m => m.id);
	
	if (faqIds.length === 0) {
		return { results: [], responseTime: Date.now() - startTime };
	}

	const placeholders = faqIds.map(() => '?').join(',');
	const faqs = await env.DB.prepare(
		`SELECT * FROM faqs WHERE id IN (${placeholders})`
	).bind(...faqIds).all();

	// Merge and rank
	const results: SearchResult[] = vectorResults.matches.map(match => {
        const faq = faqs.results.find((f: any) => f.id === match.id);
        return {
            id: match.id,
            question: (faq?.question || match.metadata?.question || '') as string,
            answer: (faq?.answer || '') as string,
            category: faq?.category as string | undefined,
            similarity: match.score || 0
        };
    }).filter(r => r.similarity > 0.7); 

	const responseTime = Date.now() - startTime;

	// Log analytics
	await env.DB.prepare(
		'INSERT INTO queries (query, mode, matched_faq_ids, response_time_ms) VALUES (?, ?, ?, ?)'
	).bind(
		query,
		'search',
		JSON.stringify(faqIds),
		responseTime
	).run();

	// Cache for 1 hour
	await env.CACHE.put(cacheKey, JSON.stringify({ results, responseTime }), { expirationTtl: 3600 });

	return { results, responseTime };
}