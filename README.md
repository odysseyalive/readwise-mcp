# readwise-mcp

A fork of [readwise-mcp-enhanced](https://github.com/arnaldo-delisio/readwise-mcp-enhanced), shaped for how I actually read and research.

## What this is

This is a Model Context Protocol (MCP) server that lets Claude (or any MCP-compatible tool) access your Readwise Reader library and highlights. The original package by [Arnaldo De Lisio](https://github.com/arnaldo-delisio) already did most of this well—I forked it because I needed it to read uploaded PDFs, which were hitting a 401 auth error.

## What I changed

The main fix: when you ask for full document content, the original used `source_url` which requires browser authentication for uploaded files. The Readwise API actually provides `raw_source_url`—a temporary S3 link that works without auth. This fork requests that URL and uses it for content fetching.

**Changes from upstream:**
- Request `withRawSourceUrl=true` when fetching full content
- Prioritize S3 presigned URLs for uploaded document content
- Added `raw_source_url` field to document types

Everything else works the same as the original.

## Installation

### From source (what I use)

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

See the [original README](https://github.com/arnaldo-delisio/readwise-mcp-enhanced#readme) for full documentation—I didn't change the tool interfaces.

## Credits

This fork exists because of the work others did first:

- **[Arnaldo De Lisio](https://github.com/arnaldo-delisio)** built [readwise-mcp-enhanced](https://github.com/arnaldo-delisio/readwise-mcp-enhanced), which unified Reader and Highlights into one MCP with smart content controls and context optimization. That's most of what's here.

- **[edricgsh](https://github.com/edricgsh)** created [Readwise-Reader-MCP](https://github.com/edricgsh/Readwise-Reader-MCP), the foundation Arnaldo built on.

I just needed my uploaded PDFs to work, so I added S3 URL support. The heavy lifting was already done.

## License

MIT (same as upstream)
