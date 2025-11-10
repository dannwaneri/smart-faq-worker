import type { Env, FAQ } from './types';

export async function indexFAQ(faq: FAQ, env: Env): Promise<void> {
	// 1. Store in D1
	await env.DB.prepare(
		'INSERT OR REPLACE INTO faqs (id, question, answer, category, updated_at) VALUES (?, ?, ?, ?, unixepoch())'
	).bind(faq.id, faq.question, faq.answer, faq.category || null).run();

	// 2. Generate embedding
	const text = `${faq.question} ${faq.answer}`;
	const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
		text: [text]
	}) as any;

	// 3. Store in Vectorize
	await env.VECTORIZE.upsert([{
		id: faq.id,
		values: embedding.data[0],
		metadata: {
			question: faq.question,
			category: faq.category || 'general'
		}
	}]);
}

export async function deleteFAQ(id: string, env: Env): Promise<void> {
	await env.DB.prepare('DELETE FROM faqs WHERE id = ?').bind(id).run();
	await env.VECTORIZE.deleteByIds([id]);
}

export async function getAllFAQs(env: Env) {
	const result = await env.DB.prepare('SELECT * FROM faqs ORDER BY created_at DESC').all();
	return result.results;
}