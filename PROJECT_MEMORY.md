# Project Memory - Pharos Agent Skills (Phase 1)

## System Overview
A performance-optimized Fastify application exposing standardized developer execution mechanisms on Pharos Atlantic Testnet (Chain ID 688688). Consists of a **Payment Execution Skill** and a **Marketplace Registry Skill** accessible via clean RESTful APIs and a native **Model Context Protocol (MCP)** SSE gateway.

## Core Architectural Decisions
1. **Double Interface Layout**: Direct HTTP Routing + SSE Model Context Protocol. Exposes tool calls to LLMs over `/mcp/sse` and `/mcp/messages`.
2. **Prisma Connection Pooling**: Configured with direct and pooled connection strings to manage Supabase PostgreSQL connections cleanly.
3. **TypeScript Compatibility**: Set up with standard `"module": "node16"` and `"moduleResolution": "node16"` for reliable compilation.

## Completed Milestones
* [x] Phase 1 Directory Scaffold and Configurations
* [x] Database Schema Sync with Supabase PostgreSQL
* [x] Base Utility Initializations (Pino logger, custom type-safe environment loader)
* [x] Payment Execution Skill (Intent tracking and on-chain polling confirmation)
* [x] Marketplace Registry Skill (Profile registration and priced listing publishing)
* [x] Model Context Protocol Server over SSE implementation
* [x] Project health validation and Swagger OpenAPI generation

## Key Implementation Notes
- **PowerShell Encoding**: Always avoid generating empty files with native `New-Item` PowerShell commands directly, as they default to UTF-16LE with BOM, which breaks parser files. Always create new files directly in VS Code (defaults to BOM-free UTF-8).
- **Postgres Connection Strings**: Special characters like `@` and `$` in connection strings must be percent-encoded (`%40` and `%24`) to prevent connection parsing errors.
- **MCP SSE Message Handling**: In MCP SDK v1.x.x, `SSEServerTransport.handleMessage` expects the parsed JSON body directly (`request.body`) rather than raw streams.