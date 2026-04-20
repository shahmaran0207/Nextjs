/**
 * Normalize text for search (lowercase, trim)
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.toLowerCase().trim();
}

/**
 * Check if text contains search query (case-insensitive)
 * @param text - Text to search in
 * @param query - Search query
 * @returns true if text contains query, false otherwise
 * 
 * Property 1: Text Search Correctness
 * For any search query string, all returned items SHALL contain 
 * the search query as a case-insensitive substring.
 */
export function textContains(
  text: string | null | undefined,
  query: string
): boolean {
  if (!text || !query) return false;
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  return normalizedText.includes(normalizedQuery);
}

/**
 * Check if any of the text fields contain the search query
 * @param fields - Array of text fields to search
 * @param query - Search query
 * @returns true if any field contains query, false otherwise
 */
export function anyFieldContains(
  fields: (string | null | undefined)[],
  query: string
): boolean {
  if (!query) return true; // Empty query matches all
  return fields.some((field) => textContains(field, query));
}

/**
 * Build search index for fast lookup
 * @param items - Array of items to index
 * @param getSearchableFields - Function to extract searchable fields from an item
 * @returns Map of normalized terms to item indices
 */
export function buildSearchIndex<T>(
  items: T[],
  getSearchableFields: (item: T) => (string | null | undefined)[]
): Map<string, number[]> {
  const index = new Map<string, number[]>();

  items.forEach((item, idx) => {
    const fields = getSearchableFields(item);
    const allText = fields
      .filter((f) => f)
      .map((f) => normalizeText(f))
      .join(' ');

    // Tokenize and index each word
    const words = allText.split(/\s+/).filter((w) => w.length > 0);
    words.forEach((word) => {
      if (!index.has(word)) {
        index.set(word, []);
      }
      index.get(word)!.push(idx);
    });
  });

  return index;
}

/**
 * Search items using the index
 * @param items - Array of items
 * @param index - Search index
 * @param query - Search query
 * @returns Array of matching items
 */
export function searchWithIndex<T>(
  items: T[],
  index: Map<string, number[]>,
  query: string
): T[] {
  if (!query) return items;

  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);

  if (queryWords.length === 0) return items;

  // Find items that contain all query words (AND logic)
  const matchingSets = queryWords.map((word) => {
    // Find all index entries that contain this word as substring
    const matchingIndices = new Set<number>();
    for (const [indexWord, indices] of index.entries()) {
      if (indexWord.includes(word)) {
        indices.forEach((idx) => matchingIndices.add(idx));
      }
    }
    return matchingIndices;
  });

  // Intersect all sets (items must match all query words)
  if (matchingSets.length === 0) return [];
  
  let result = matchingSets[0];
  for (let i = 1; i < matchingSets.length; i++) {
    result = new Set([...result].filter((idx) => matchingSets[i].has(idx)));
  }

  return Array.from(result).map((idx) => items[idx]);
}

/**
 * Tokenize text into words
 * @param text - Text to tokenize
 * @returns Array of normalized words
 */
export function tokenize(text: string | null | undefined): string[] {
  if (!text) return [];
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter((w) => w.length > 0);
}
