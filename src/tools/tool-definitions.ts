import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  {
    name: 'readwise_save_document',
    description: 'Save a document (URL or HTML content) to Readwise Reader',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the document to save',
        },
        html: {
          type: 'string',
          description: 'HTML content of the document (optional)',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to add to the document',
        },
        location: {
          type: 'string',
          enum: ['new', 'later', 'shortlist', 'archive', 'feed'],
          description: 'Location to save the document (default: new)',
        },
        category: {
          type: 'string',
          enum: ['article', 'book', 'tweet', 'pdf', 'email', 'youtube', 'podcast'],
          description: 'Category of the document (auto-detected if not specified)',
        },
      },
      required: ['url'],
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_list_documents',
    description: 'List documents from Readwise Reader with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Filter by specific document ID',
        },
        updatedAfter: {
          type: 'string',
          description: 'Filter documents updated after this date (ISO 8601)',
        },
        addedAfter: {
          type: 'string',
          description: 'Filter documents added after this date (ISO 8601). Note: This will fetch all documents first and then filter client-side.',
        },
        location: {
          type: 'string',
          enum: ['new', 'later', 'shortlist', 'archive', 'feed'],
          description: 'Filter by document location',
        },
        category: {
          type: 'string',
          enum: ['article', 'book', 'tweet', 'pdf', 'email', 'youtube', 'podcast'],
          description: 'Filter by document category',
        },
        tag: {
          type: 'string',
          description: 'Filter by tag name',
        },
        pageCursor: {
          type: 'string',
          description: 'Page cursor for pagination',
        },
        withHtmlContent: {
          type: 'boolean',
          description: '⚠️ PERFORMANCE WARNING: Include HTML content in the response. This significantly slows down the API. Only use when explicitly requested by the user or when raw HTML is specifically needed for the task.',
        },
        withFullContent: {
          type: 'boolean',
          description: '⚠️ PERFORMANCE WARNING: Include full converted text content in the response. This significantly slows down the API as it fetches and processes each document\'s content. Only use when explicitly requested by the user or when document content is specifically needed for analysis/reading. Default: false for performance.',
        },
        contentMaxLength: {
          type: 'number',
          description: 'Maximum length of content to include per document (in characters). Default: 50000. Use with withFullContent=true to prevent token limit issues.',
        },
        contentStartOffset: {
          type: 'number',
          description: 'Character offset to start content extraction from. Use with contentMaxLength for pagination through large documents. Default: 0.',
        },
        contentFilterKeywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter content to include only sections containing these keywords (case-insensitive). Useful for extracting specific topics from large documents.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of documents to return. Use this to prevent token limit issues when requesting multiple documents with content.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_update_document',
    description: 'Update a document in Readwise Reader',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Document ID to update',
        },
        title: {
          type: 'string',
          description: 'New title for the document',
        },
        author: {
          type: 'string',
          description: 'New author for the document',
        },
        summary: {
          type: 'string',
          description: 'New summary for the document',
        },
        published_date: {
          type: 'string',
          description: 'New published date (ISO 8601)',
        },
        image_url: {
          type: 'string',
          description: 'New image URL for the document',
        },
        location: {
          type: 'string',
          enum: ['new', 'later', 'shortlist', 'archive', 'feed'],
          description: 'New location for the document',
        },
        category: {
          type: 'string',
          enum: ['article', 'book', 'tweet', 'pdf', 'email', 'youtube', 'podcast'],
          description: 'New category for the document',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_delete_document',
    description: 'Delete a document from Readwise Reader',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Document ID to delete',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_list_tags',
    description: 'List all tags from Readwise Reader',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_topic_search',
    description: 'Search documents in Readwise Reader by topic using regex matching on title, summary, notes, and tags',
    inputSchema: {
      type: 'object',
      properties: {
        searchTerms: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of search terms to match against document content (case-insensitive regex matching)',
          minItems: 1,
        },
      },
      required: ['searchTerms'],
      additionalProperties: false,
    },
  },
  // ========== HIGHLIGHTS TOOLS ==========
  {
    name: 'readwise_list_highlights',
    description: 'List highlights from Readwise with optional filtering by book, date, or other criteria',
    inputSchema: {
      type: 'object',
      properties: {
        page_size: {
          type: 'number',
          description: 'Number of results per page (default: 100, max: 1000)',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
        },
        book_id: {
          type: 'number',
          description: 'Filter highlights by specific book ID',
        },
        updated__lt: {
          type: 'string',
          description: 'Filter highlights updated before this date (ISO 8601)',
        },
        updated__gt: {
          type: 'string',
          description: 'Filter highlights updated after this date (ISO 8601)',
        },
        highlighted_at__lt: {
          type: 'string',
          description: 'Filter highlights made before this date (ISO 8601)',
        },
        highlighted_at__gt: {
          type: 'string',
          description: 'Filter highlights made after this date (ISO 8601)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_create_highlight',
    description: 'Create new highlights manually in Readwise',
    inputSchema: {
      type: 'object',
      properties: {
        highlights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'The highlight text (required)',
              },
              title: {
                type: 'string',
                description: 'Title of the source book/article',
              },
              author: {
                type: 'string',
                description: 'Author of the source',
              },
              source_url: {
                type: 'string',
                description: 'URL of the original source',
              },
              source_type: {
                type: 'string',
                description: 'Unique identifier for your app/source',
              },
              category: {
                type: 'string',
                enum: ['books', 'articles', 'tweets', 'podcasts'],
                description: 'Category of the source',
              },
              note: {
                type: 'string',
                description: 'Personal note or annotation for the highlight',
              },
              location: {
                type: 'number',
                description: 'Location in the source (page number, position, etc.)',
              },
              location_type: {
                type: 'string',
                enum: ['page', 'order', 'time_offset'],
                description: 'Type of location reference',
              },
              highlighted_at: {
                type: 'string',
                description: 'When the highlight was made (ISO 8601)',
              },
            },
            required: ['text'],
          },
          description: 'Array of highlights to create',
          minItems: 1,
        },
      },
      required: ['highlights'],
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_export_highlights',
    description: 'Export all highlights from Readwise with optional filtering. Perfect for bulk analysis or backup.',
    inputSchema: {
      type: 'object',
      properties: {
        updatedAfter: {
          type: 'string',
          description: 'Only export highlights updated after this date (ISO 8601) - useful for incremental sync',
        },
        ids: {
          type: 'string',
          description: 'Comma-separated list of book IDs to export highlights from',
        },
        includeDeleted: {
          type: 'boolean',
          description: 'Include deleted highlights in export (default: false)',
        },
        pageCursor: {
          type: 'string',  
          description: 'Cursor for pagination through large exports',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_get_daily_review',
    description: 'Get your daily review highlights for spaced repetition learning',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_list_books',
    description: 'List books that have highlights in Readwise with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page_size: {
          type: 'number',
          description: 'Number of results per page (default: 100, max: 1000)',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
        },
        category: {
          type: 'string',
          enum: ['books', 'articles', 'tweets', 'supplementals', 'podcasts'],
          description: 'Filter books by category',
        },
        source: {
          type: 'string',
          description: 'Filter books by source',
        },
        updated__lt: {
          type: 'string',
          description: 'Filter books updated before this date (ISO 8601)',
        },
        updated__gt: {
          type: 'string',
          description: 'Filter books updated after this date (ISO 8601)',
        },
        last_highlight_at__lt: {
          type: 'string',
          description: 'Filter books with last highlight before this date (ISO 8601)',
        },
        last_highlight_at__gt: {
          type: 'string',
          description: 'Filter books with last highlight after this date (ISO 8601)',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_get_book_highlights',
    description: 'Get all highlights from a specific book',
    inputSchema: {
      type: 'object',
      properties: {
        bookId: {
          type: 'number',
          description: 'The ID of the book to get highlights from',
        },
      },
      required: ['bookId'],
      additionalProperties: false,
    },
  },
  {
    name: 'readwise_search_highlights',
    description: 'Advanced search across all highlights using text queries and field-specific filters. Equivalent to official Readwise MCP search functionality.',
    inputSchema: {
      type: 'object',
      properties: {
        textQuery: {
          type: 'string',
          description: 'Main text to search for across all highlight content (like vector_search_term)',
        },
        fieldQueries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: {
                type: 'string',
                enum: ['document_title', 'document_author', 'highlight_text', 'highlight_note', 'highlight_tags'],
                description: 'Field to search in',
              },
              searchTerm: {
                type: 'string',
                description: 'Term to search for in the specified field',
              },
            },
            required: ['field', 'searchTerm'],
          },
          description: 'Specific field searches (like full_text_queries)',
        },
        bookId: {
          type: 'number',
          description: 'Filter results to specific book',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
        },
      },
      additionalProperties: false,
    },
  },
]; 