export enum KeywordMatchType {
  EXACT = 'EXACT',
  SYNONYM = 'SYNONYM',
  FUZZY = 'FUZZY',
  RELATED = 'RELATED',
}

export enum RecommendationPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum ExtractionMode {
  HYBRID_AI = 'hybrid_ai',
  DETERMINISTIC_FALLBACK = 'deterministic_fallback',
}
