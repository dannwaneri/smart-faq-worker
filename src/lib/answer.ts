import type { Env } from './types';
import { searchFAQs } from './search';

export async function generateAnswer(query: string, env: Env) {
	const startTime = Date.now();

	// Check cache
	const cacheKey = `answer:${query.toLowerCase().trim()}`;
	const cached = await env.CACHE.get(cacheKey, 'json');
	if (cached) {
		return { ...cached, cached: true };
	}

	// 1. Find relevant FAQs
	const searchResults = await searchFAQs(query, env);
	
	// Add null check
	if (!searchResults.results || searchResults.results.length === 0) {
		return {
			answer: "I couldn't find any relevant information in our FAQ. Please contact support for assistance.",
			sources: [],
			confidence: 0,
			responseTime: Date.now() - startTime
		};
	}

	// 2. Build context from top 3 matches
	const context = searchResults.results
		.slice(0, 3)
		.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
		.join('\n\n');

	// 3. Generate AI answer
	const llmResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
		messages: [
			{
				role: 'system',
				content: 'You are a helpful FAQ assistant. Answer the user\'s question using ONLY the provided FAQ entries. Be concise and friendly. If the FAQs don\'t contain the answer, say so politely.'
			},
			{
				role: 'user',
				content: `FAQs:\n${context}\n\nUser Question: ${query}\n\nProvide a clear, helpful answer based on the FAQs above.`
			}
		]
	}) as any;

	const answer = llmResponse.response;
	const responseTime = Date.now() - startTime;

	// Log analytics
	const queryResult = await env.DB.prepare(
		'INSERT INTO queries (query, mode, matched_faq_ids, response_time_ms) VALUES (?, ?, ?, ?) RETURNING id'
	).bind(
		query,
		'answer',
		JSON.stringify(searchResults.results.map(r => r.id)),
		responseTime
	).first();

	const result = {
		answer,
		sources: searchResults.results.slice(0, 3),
		confidence: searchResults.results[0]?.similarity || 0,
		queryId: (queryResult as any)?.id,
		responseTime
	};

	// Cache for 24 hours
	await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 });

	return result;
}