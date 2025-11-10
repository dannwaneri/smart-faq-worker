export interface Env {
	AI: Ai;
	VECTORIZE: VectorizeIndex;
	DB: D1Database;
	CACHE: KVNamespace;
}

export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category?: string;
}

export interface SearchResult {
	id: string;
	question: string;
	answer: string;
	category?: string;
	similarity: number;
}