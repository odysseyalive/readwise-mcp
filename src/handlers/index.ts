import { 
  handleSaveDocument, 
  handleListDocuments, 
  handleUpdateDocument, 
  handleDeleteDocument 
} from './document-handlers.js';
import { handleListTags, handleTopicSearch } from './tag-search-handlers.js';
import {
  handleListHighlights,
  handleCreateHighlight,
  handleExportHighlights,
  handleGetDailyReview,
  handleListBooks,
  handleGetBookHighlights,
  handleSearchHighlights,
} from './highlights-handlers.js';

export async function handleToolCall(name: string, args: any) {
  switch (name) {
    case 'readwise_save_document':
      return handleSaveDocument(args);
      
    case 'readwise_list_documents':
      return handleListDocuments(args);
      
    case 'readwise_update_document':
      return handleUpdateDocument(args);
      
    case 'readwise_delete_document':
      return handleDeleteDocument(args);
      
    case 'readwise_list_tags':
      return handleListTags(args);
      
    case 'readwise_topic_search':
      return handleTopicSearch(args);
      
    // ========== HIGHLIGHTS TOOLS ==========
    case 'readwise_list_highlights':
      return handleListHighlights(args);
      
    case 'readwise_create_highlight':
      return handleCreateHighlight(args);
      
    case 'readwise_export_highlights':
      return handleExportHighlights(args);
      
    case 'readwise_get_daily_review':
      return handleGetDailyReview(args);
      
    case 'readwise_list_books':
      return handleListBooks(args);
      
    case 'readwise_get_book_highlights':
      return handleGetBookHighlights(args);
      
    case 'readwise_search_highlights':
      return handleSearchHighlights(args);
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
} 