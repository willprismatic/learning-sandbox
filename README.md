# Demo App: Integration-Ready SaaS Platform

A standalone SaaS application with a resource-based API and webhook system, designed as a training environment for integration platform implementation walkthroughs.

> **Branch: `learning/tam-se-sync`** - This branch has been stripped of all integration platform code to serve as a clean "customer environment" starting point. Look for `// LEARNING:` comments throughout the codebase marking where integration points would be added.

## Project Structure

### Next.js Demo App (`app/`)

Full-stack application simulating a SaaS product with:

- **Resources API** - Generic CRUD for any vertical (invoices, leads, tickets, todos)
- **Integration Playground** - Live webhook testing with real-time delivery monitoring
- **AI Playground** - AI-powered chat interface with MCP tool support
- **Webhook System** - Fire webhooks on resource lifecycle events (created, updated, deleted)

**Tech Stack**: Next.js 16, TypeScript, React 19, shadcn/ui, Tailwind CSS v4, SQLite

## Quick Start

```bash
cd app
npm install
cp .env.example .env.local   # fill in values from the Notion doc
npm run dev
```

In a second terminal, start your ngrok tunnel:

```bash
ngrok http --domain=YOUR-ASSIGNED-DOMAIN.ngrok-free.app 3000
```

See `app/README.md` for full setup details.

## Training: Integration Points

This branch includes `// LEARNING:` comments at every location where an integration platform (like Prismatic) would be wired in. Key areas:

- **Layout** (`app/(main)/layout.tsx`) - Where to add the platform's context provider
- **Sidebar** (`components/app-sidebar.tsx`) - Where to add embedded marketplace/workflow nav items
- **Dashboard** (`app/(main)/page.tsx`) - Where to show platform setup status
- **Webhooks** (`app/(main)/webhooks/page.tsx`) - Where to add instance/flow auto-selection
- **AI Playground** (`app/(main)/ai-playground/page.tsx`) - Where to connect platform MCP servers
- **Chat API** (`app/api/chat/route.ts`) - Where to add authenticated MCP connections
- **Middleware** (`middleware.ts`) - Bearer token auth for M2M/API access (already implemented)
- **Environment** (`.env.example`) - Where to add platform credentials

## Architecture Highlights

- **Resource-based design** - One table stores all resource types (no schema migrations needed)
- **Generic webhook system** - Fire webhooks on any resource lifecycle event
- **Dual auth** - Cookie sessions for browsers, Bearer token for M2M/API access
- **Dynamic forms** - Auto-generated from resource configurations

---

For detailed app documentation, see `app/README.md`
