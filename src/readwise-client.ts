import { 
  ReadwiseDocument, 
  CreateDocumentRequest, 
  UpdateDocumentRequest, 
  ListDocumentsParams, 
  ListDocumentsResponse,
  ReadwiseTag,
  ListTagsResponse,
  ReadwiseConfig,
  APIResponse,
  APIMessage,
  ReadwiseHighlight,
  ReadwiseBook,
  ListHighlightsParams,
  ListHighlightsResponse,
  CreateHighlightRequest,
  ExportHighlightsParams,
  ExportHighlightsResponse,
  DailyReviewResponse,
  ListBooksParams,
  ListBooksResponse,
  SearchHighlightsParams,
  SearchHighlightsResult,
  EnhancedTopicSearchResults
} from './types.js';

export class ReadwiseClient {
  private readonly baseUrl = 'https://readwise.io/api/v3';
  private readonly v2BaseUrl = 'https://readwise.io/api/v2';
  private readonly authUrl = 'https://readwise.io/api/v2/auth/';
  private readonly token: string;

  constructor(config: ReadwiseConfig) {
    this.token = config.token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    useV2Api = false
  ): Promise<T> {
    const baseUrl = useV2Api ? this.v2BaseUrl : this.baseUrl;
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Token ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw new Error(`RATE_LIMIT:${retryAfterSeconds}`);
      }
      
      const errorText = await response.text();
      throw new Error(`Readwise API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private createResponse<T>(data: T, messages?: APIMessage[]): APIResponse<T> {
    return { data, messages };
  }

  private createInfoMessage(content: string): APIMessage {
    return { type: 'info', content };
  }

  private createErrorMessage(content: string): APIMessage {
    return { type: 'error', content };
  }

  async validateAuth(): Promise<APIResponse<{ detail: string }>> {
    try {
      const result = await this.makeRequest<{ detail: string }>(this.authUrl);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async createDocument(data: CreateDocumentRequest): Promise<APIResponse<ReadwiseDocument>> {
    try {
      const result = await this.makeRequest<ReadwiseDocument>('/save/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async listDocuments(params: ListDocumentsParams = {}): Promise<APIResponse<ListDocumentsResponse>> {
    try {
      // Extract client-side only parameters
      const { limit, contentMaxLength, contentStartOffset, contentFilterKeywords, ...apiParams } = params;

      // If withFullContent is requested, first check the document count
      if (params.withFullContent) {
        const countParams = { ...apiParams };
        delete countParams.withFullContent;
        delete countParams.withHtmlContent; // Also remove HTML content for the count check
        
        const countSearchParams = new URLSearchParams();
        Object.entries(countParams).forEach(([key, value]) => {
          if (value !== undefined) {
            countSearchParams.append(key, String(value));
          }
        });

        const countQuery = countSearchParams.toString();
        const countEndpoint = `/list/${countQuery ? `?${countQuery}` : ''}`;
        
        const countResponse = await this.makeRequest<ListDocumentsResponse>(countEndpoint);
        
        const userLimit = limit || 5; // Use user's limit or default to 5
        if (countResponse.count > userLimit) {
          // Get limited documents with full content
          const limitedApiParams = { ...apiParams };
          const searchParams = new URLSearchParams();
          
          Object.entries(limitedApiParams).forEach(([key, value]) => {
            if (value !== undefined) {
              searchParams.append(key, String(value));
            }
          });

          const query = searchParams.toString();
          const endpoint = `/list/${query ? `?${query}` : ''}`;
          
          const result = await this.makeRequest<ListDocumentsResponse>(endpoint);
          
          // Apply client-side limit
          const limitedResults = result.results.slice(0, userLimit);
          const limitedResponse = {
            ...result,
            results: limitedResults,
            count: limitedResults.length
          };
          
          let message: APIMessage;
          if (countResponse.count <= 20) {
            message = this.createInfoMessage(
              `Found ${countResponse.count} documents, but only returning the first ${userLimit} due to full content request. ` +
              `To get the remaining ${countResponse.count - userLimit} documents with full content, ` +
              `you can fetch them individually by their IDs using the update/read document API.`
            );
          } else {
            message = this.createErrorMessage(
              `Found ${countResponse.count} documents, but only returning the first ${userLimit} due to full content request. ` +
              `Getting full content for more than 20 documents is not supported due to performance limitations.`
            );
          }
          
          return this.createResponse(limitedResponse, [message]);
        }
      }

      const searchParams = new URLSearchParams();
      
      // Only pass API-supported parameters to the Readwise API
      Object.entries(apiParams).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const query = searchParams.toString();
      const endpoint = `/list/${query ? `?${query}` : ''}`;
      
      const result = await this.makeRequest<ListDocumentsResponse>(endpoint);
      
      // Apply client-side limit if specified
      if (limit && limit > 0) {
        const limitedResults = result.results.slice(0, limit);
        const limitedResponse = {
          ...result,
          results: limitedResults,
          count: limitedResults.length
        };
        return this.createResponse(limitedResponse);
      }
      
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<APIResponse<ReadwiseDocument>> {
    try {
      const result = await this.makeRequest<ReadwiseDocument>(`/update/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<APIResponse<void>> {
    try {
      await this.makeRequest(`/delete/${id}/`, {
        method: 'DELETE',
      });
      return this.createResponse(undefined);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async listTags(): Promise<APIResponse<ReadwiseTag[]>> {
    try {
      const result = await this.makeRequest<ListTagsResponse>('/tags/');
      return this.createResponse(result.results);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async searchDocumentsByTopic(searchTerms: string[]): Promise<APIResponse<ReadwiseDocument[]>> {
    try {
      // Fetch all documents without full content for performance
      const allDocuments: ReadwiseDocument[] = [];
      let nextPageCursor: string | undefined;
      
      do {
        const params: ListDocumentsParams = {
          withFullContent: false,
          withHtmlContent: false,
        };
        
        if (nextPageCursor) {
          params.pageCursor = nextPageCursor;
        }
        
        const response = await this.listDocuments(params);
        allDocuments.push(...response.data.results);
        nextPageCursor = response.data.nextPageCursor;
      } while (nextPageCursor);

      // Create regex patterns from search terms (case-insensitive)
      const regexPatterns = searchTerms.map(term => 
        new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      );

      // Filter documents that match any of the search terms
      const matchingDocuments = allDocuments.filter(doc => {
        // Extract searchable text fields
        const searchableFields = [
          doc.title || '',
          doc.summary || '',
          doc.notes || '',
          // Handle tags - they can be string array or object
          Array.isArray(doc.tags) ? doc.tags.join(' ') : '',
        ];

        const searchableText = searchableFields.join(' ').toLowerCase();

        // Check if any regex pattern matches
        return regexPatterns.some(pattern => pattern.test(searchableText));
      });

      return this.createResponse(matchingDocuments);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  // ========== HIGHLIGHTS API METHODS (v2) ==========

  async listHighlights(params: ListHighlightsParams = {}): Promise<APIResponse<ListHighlightsResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const query = searchParams.toString();
      const endpoint = `/highlights/${query ? `?${query}` : ''}`;
      
      const result = await this.makeRequest<ListHighlightsResponse>(endpoint, {}, true);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async createHighlight(data: CreateHighlightRequest): Promise<APIResponse<any>> {
    try {
      const result = await this.makeRequest<any>('/highlights/', {
        method: 'POST',
        body: JSON.stringify(data),
      }, true);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async exportHighlights(params: ExportHighlightsParams = {}): Promise<APIResponse<ExportHighlightsResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const query = searchParams.toString();
      const endpoint = `/export/${query ? `?${query}` : ''}`;
      
      const result = await this.makeRequest<ExportHighlightsResponse>(endpoint, {}, true);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async getDailyReview(): Promise<APIResponse<DailyReviewResponse>> {
    try {
      const result = await this.makeRequest<DailyReviewResponse>('/review/', {}, true);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async listBooks(params: ListBooksParams = {}): Promise<APIResponse<ListBooksResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });

      const query = searchParams.toString();
      const endpoint = `/books/${query ? `?${query}` : ''}`;
      
      const result = await this.makeRequest<ListBooksResponse>(endpoint, {}, true);
      return this.createResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async getBookHighlights(bookId: number): Promise<APIResponse<ReadwiseHighlight[]>> {
    try {
      const result = await this.listHighlights({ book_id: bookId, page_size: 1000 });
      return this.createResponse(result.data.results);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  async searchHighlights(params: SearchHighlightsParams): Promise<APIResponse<SearchHighlightsResult[]>> {
    try {
      const results: SearchHighlightsResult[] = [];
      
      // Strategy: Use export API for comprehensive search across all data
      const exportResponse = await this.exportHighlights();
      const books = exportResponse.data.results;
      
      // Search through exported data
      for (const book of books) {
        // Filter by bookId if specified
        if (params.bookId && book.id !== params.bookId) continue;
        
        for (const highlight of book.highlights) {
          let score = 0;
          const matchedFields: string[] = [];
          
          // Text query search (main search term)
          if (params.textQuery) {
            const query = params.textQuery.toLowerCase();
            if (highlight.text.toLowerCase().includes(query)) {
              score += 10;
              matchedFields.push('highlight_text');
            }
            if (highlight.note?.toLowerCase().includes(query)) {
              score += 8;
              matchedFields.push('highlight_note');
            }
            if (book.title.toLowerCase().includes(query)) {
              score += 6;
              matchedFields.push('document_title');
            }
            if (book.author.toLowerCase().includes(query)) {
              score += 4;
              matchedFields.push('document_author');
            }
          }
          
          // Field-specific queries
          if (params.fieldQueries) {
            for (const fieldQuery of params.fieldQueries) {
              const searchTerm = fieldQuery.searchTerm.toLowerCase();
              
              switch (fieldQuery.field) {
                case 'document_title':
                  if (book.title.toLowerCase().includes(searchTerm)) {
                    score += 8;
                    matchedFields.push('document_title');
                  }
                  break;
                case 'document_author':
                  if (book.author.toLowerCase().includes(searchTerm)) {
                    score += 8;
                    matchedFields.push('document_author');
                  }
                  break;
                case 'highlight_text':
                  if (highlight.text.toLowerCase().includes(searchTerm)) {
                    score += 10;
                    matchedFields.push('highlight_text');
                  }
                  break;
                case 'highlight_note':
                  if (highlight.note?.toLowerCase().includes(searchTerm)) {
                    score += 8;
                    matchedFields.push('highlight_note');
                  }
                  break;
                case 'highlight_tags':
                  if (highlight.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))) {
                    score += 6;
                    matchedFields.push('highlight_tags');
                  }
                  break;
              }
            }
          }
          
          // If we have matches, add to results
          if (score > 0) {
            const { highlights, ...bookWithoutHighlights } = book;
            results.push({
              highlight,
              book: bookWithoutHighlights,
              score,
              matchedFields: [...new Set(matchedFields)] // Remove duplicates
            });
          }
        }
      }
      
      // Sort by score and apply limit
      results.sort((a, b) => b.score - a.score);
      const limitedResults = params.limit ? results.slice(0, params.limit) : results;
      
      return this.createResponse(limitedResults);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }

  // Enhanced topic search that includes highlights
  async searchDocumentsAndHighlights(searchTerms: string[]): Promise<APIResponse<EnhancedTopicSearchResults>> {
    try {
      // Get documents (existing functionality)
      const documentsResponse = await this.searchDocumentsByTopic(searchTerms);
      
      // Search highlights using the same terms
      const highlightsResponse = await this.searchHighlights({
        textQuery: searchTerms.join(' '),
        limit: 50
      });
      
      // Get relevant books
      const bookIds = [...new Set(highlightsResponse.data.map(result => result.book.id))];
      const booksResponse = await this.listBooks({ page_size: Math.min(bookIds.length, 100) });
      const relevantBooks = booksResponse.data.results.filter(book => bookIds.includes(book.id));
      
      const results: EnhancedTopicSearchResults = {
        documents: documentsResponse.data,
        highlights: highlightsResponse.data,
        books: relevantBooks
      };
      
      return this.createResponse(results);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const seconds = parseInt(error.message.split(':')[1], 10);
        throw new Error(`Rate limit exceeded. Too many requests. Please retry after ${seconds} seconds.`);
      }
      throw error;
    }
  }
}