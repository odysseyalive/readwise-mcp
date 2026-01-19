export interface ReadwiseDocument {
  id: string;
  url: string;
  source_url?: string;
  raw_source_url?: string; // S3 presigned URL for direct content access (valid for 1 hour)
  title?: string;
  author?: string;
  source?: string;
  summary?: string;
  published_date?: string | number;
  image_url?: string;
  location: 'new' | 'later' | 'shortlist' | 'archive' | 'feed';
  category?: 'article' | 'book' | 'tweet' | 'pdf' | 'email' | 'youtube' | 'podcast' | 'video';
  tags?: string[] | object;
  site_name?: string;
  word_count?: number | null;
  created_at: string;
  updated_at: string;
  notes?: string;
  parent_id?: string | null;
  reading_progress?: number;
  first_opened_at?: string | null;
  last_opened_at?: string | null;
  saved_at?: string;
  last_moved_at?: string;
  html_content?: string;
}

export interface CreateDocumentRequest {
  url: string;
  html?: string;
  tags?: string[];
  location?: 'new' | 'later' | 'shortlist' | 'archive' | 'feed';
  category?: 'article' | 'book' | 'tweet' | 'pdf' | 'email' | 'youtube' | 'podcast';
}

export interface UpdateDocumentRequest {
  title?: string;
  author?: string;
  summary?: string;
  published_date?: string;
  image_url?: string;
  location?: 'new' | 'later' | 'shortlist' | 'archive' | 'feed';
  category?: 'article' | 'book' | 'tweet' | 'pdf' | 'email' | 'youtube' | 'podcast';
}

export interface ListDocumentsParams {
  id?: string;
  updatedAfter?: string;
  addedAfter?: string;
  location?: 'new' | 'later' | 'shortlist' | 'archive' | 'feed';
  category?: 'article' | 'book' | 'tweet' | 'pdf' | 'email' | 'youtube' | 'podcast';
  tag?: string;
  pageCursor?: string;
  withHtmlContent?: boolean;
  withRawSourceUrl?: boolean; // Request S3 presigned URLs for direct content access
  withFullContent?: boolean;
  limit?: number;
  contentMaxLength?: number;
  contentStartOffset?: number;
  contentFilterKeywords?: string[];
}

export interface ListDocumentsResponse {
  count: number;
  nextPageCursor?: string;
  results: ReadwiseDocument[];
}

export interface ReadwiseTag {
  key: string;
  name: string;
}

export interface ListTagsResponse {
  count: number;
  nextPageCursor?: string;
  results: ReadwiseTag[];
}

export interface ReadwiseConfig {
  token: string;
}

export interface APIMessage {
  type: 'info' | 'warning' | 'error';
  content: string;
}

export interface APIResponse<T> {
  data: T;
  messages?: APIMessage[];
}

// Highlights-specific types (Readwise API v2)
export interface ReadwiseHighlight {
  id: number;
  text: string;
  note?: string;
  location?: number;
  location_type: 'page' | 'order' | 'time_offset';
  highlighted_at?: string;
  url?: string;
  color: 'yellow' | 'blue' | 'pink' | 'orange' | 'green' | 'purple';
  updated: string;
  book_id: number;
  tags: ReadwiseTag[];
}

export interface ReadwiseBook {
  id: number;
  user_book_id: number;
  title: string;
  author: string;
  readable_title: string;
  source: string;
  cover_image_url?: string;
  unique_url?: string;
  book_tags: ReadwiseTag[];
  category: 'books' | 'articles' | 'tweets' | 'podcasts' | 'supplementals';
  document_note?: string;
  summary?: string;
  readwise_url: string;
  source_url?: string;
  asin?: string;
  num_highlights: number;
  last_highlight_at?: string;
  updated: string;
  highlights: ReadwiseHighlight[];
}

export interface ListHighlightsParams {
  page_size?: number;
  page?: number;
  book_id?: number;
  updated__lt?: string;
  updated__gt?: string;
  highlighted_at__lt?: string;
  highlighted_at__gt?: string;
}

export interface ListHighlightsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ReadwiseHighlight[];
}

export interface CreateHighlightRequest {
  highlights: Array<{
    text: string;
    title?: string;
    author?: string;
    image_url?: string;
    source_url?: string;
    source_type?: string;
    category?: 'books' | 'articles' | 'tweets' | 'podcasts';
    note?: string;
    location?: number;
    location_type?: 'page' | 'order' | 'time_offset';
    highlighted_at?: string;
    highlight_url?: string;
  }>;
}

export interface ExportHighlightsParams {
  updatedAfter?: string;
  ids?: string;
  includeDeleted?: boolean;
  pageCursor?: string;
}

export interface ExportHighlightsResponse {
  count: number;
  nextPageCursor?: string;
  results: ReadwiseBook[];
}

export interface DailyReviewResponse {
  review_id: number;
  review_url: string;
  review_completed: boolean;
  highlights: Array<ReadwiseHighlight & {
    title: string;
    author: string;
    source_type: string;
    image_url?: string;
  }>;
}

export interface ListBooksParams {
  page_size?: number;
  page?: number;
  category?: 'books' | 'articles' | 'tweets' | 'supplementals' | 'podcasts';
  source?: string;
  updated__lt?: string;
  updated__gt?: string;
  last_highlight_at__lt?: string;
  last_highlight_at__gt?: string;
}

export interface ListBooksResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Omit<ReadwiseBook, 'highlights'>[];
}

export interface SearchHighlightsParams {
  textQuery?: string;
  fieldQueries?: Array<{
    field: 'document_title' | 'document_author' | 'highlight_text' | 'highlight_note' | 'highlight_tags';
    searchTerm: string;
  }>;
  bookId?: number;
  limit?: number;
}

export interface SearchHighlightsResult {
  highlight: ReadwiseHighlight;
  book: Omit<ReadwiseBook, 'highlights'>;
  score: number;
  matchedFields: string[];
}

// Enhanced search results for topic search
export interface EnhancedTopicSearchResults {
  documents: ReadwiseDocument[];
  highlights?: SearchHighlightsResult[];
  books?: Omit<ReadwiseBook, 'highlights'>[];
}