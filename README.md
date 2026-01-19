# readwise-mcp

A fork of [readwise-mcp-enhanced](https://github.com/arnaldo-delisio/readwise-mcp-enhanced), shaped for how I actually read and research.

## Why this fork exists

I do a lot of reading—academic papers, research PDFs, articles that feed into coursework and cultural preservation projects. Readwise is where I collect and annotate that material, and I wanted Claude to have direct access to it.

The original MCP by Arnaldo De Lisio does this beautifully, but uploaded PDFs weren't working for me. The API was returning 401 errors when fetching content from files I'd uploaded directly. Turns out the fix was straightforward: Readwise provides temporary S3 links for uploaded content, and the original wasn't requesting them. This fork does.

That's the immediate change. But I'm maintaining this because I want a Readwise integration that fits how I work—research-heavy, PDF-heavy, often pulling content into conversations with Claude as I'm thinking through ideas. If upstream changes break something in that workflow, I'll fix it here. If I need features that don't make sense for the general case, they'll land here too.

## What I changed (so far)

When fetching full document content, this fork:
- Requests `withRawSourceUrl=true` from the Readwise API
- Uses S3 presigned URLs for uploaded documents (bypasses the auth issue)
- Falls back gracefully to other methods if S3 isn't available

Everything else works the same as the original.

## Installation

### From source

```bash
git clone https://github.com/odysseyalive/readwise-mcp.git
cd readwise-mcp
npm install
npm run build
```

### Configuration

Get your Readwise token from https://readwise.io/access_token

**Claude Code:**
```bash
claude mcp add readwise-mcp --transport stdio \
  --env READWISE_TOKEN=your_token_here \
  --scope user \
  -- node /path/to/readwise-mcp/dist/index.js
```

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):
```json
{
  "mcpServers": {
    "readwise-mcp": {
      "command": "node",
      "args": ["/path/to/readwise-mcp/dist/index.js"],
      "env": {
        "READWISE_TOKEN": "your_token_here"
      }
    }
  }
}
```

## What it can do

All 13 tools from the original, including:

**Reader tools:** Save, list, update, delete documents. Search by topic. Smart content extraction with pagination and keyword filtering.

**Highlights tools:** List and search highlights, daily review for spaced repetition, book management, export for backup.

See the [original README](https://github.com/arnaldo-delisio/readwise-mcp-enhanced#readme) for full tool documentation.

## Credits

This fork builds on work by:

- **[Arnaldo De Lisio](https://github.com/arnaldo-delisio)** — created [readwise-mcp-enhanced](https://github.com/arnaldo-delisio/readwise-mcp-enhanced), which unified Reader and Highlights into one MCP with smart content controls and context optimization. That's the foundation here.

- **[edricgsh](https://github.com/edricgsh)** — built [Readwise-Reader-MCP](https://github.com/edricgsh/Readwise-Reader-MCP), the project Arnaldo built on.

## License

MIT (same as upstream)
