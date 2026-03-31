# Demo App

A Next.js application simulating a SaaS platform with a resource-based API and webhook system. This is a standalone product ready for integration platform implementation.

## Prerequisites

- Node.js 22+
- ngrok CLI installed (`brew install ngrok`)
- Your assigned ngrok domain and authtoken (check the Notion doc)

## Setup

```bash
cd app
npm install
cp .env.example .env.local
```

Edit `.env.local` with the values from the Notion doc:

```env
NEXT_PUBLIC_APP_URL=https://YOUR-ASSIGNED-DOMAIN.ngrok-free.app
OPENAI_API_KEY=sk-xxxxx
```

## Running

Two terminals:

```bash
# Terminal 1 — ngrok tunnel
ngrok http --domain=YOUR-ASSIGNED-DOMAIN.ngrok-free.app 3000

# Terminal 2 — app
cd app && npm run dev
```

Visit your ngrok URL to verify everything is working. The app is also available at `http://localhost:3000`.

## Application Features

| Route | Description |
|-------|-------------|
| `/` | Dashboard - Application overview |
| `/resources` | View and manage sample data |
| `/webhooks` | Configure webhook endpoints |
| `/forms` | Integration Playground - Test webhooks in real-time |
| `/ai-playground` | AI chat interface with MCP tool support |

## Architecture

- **Resource-based design** — One table stores all resource types (no schema migrations needed)
- **Generic webhook system** — Fire webhooks on any resource lifecycle event (created, updated, deleted)
- **Dynamic forms** — Auto-generated from resource configurations
- **Dual auth** — Cookie sessions for browsers, Bearer token for M2M/API access

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Run linting
```

## Troubleshooting

### Webhooks not received

1. Verify ngrok is running and your domain matches `.env.local`
2. Use the ngrok web interface at `http://localhost:4040` to inspect requests
3. Restart the Next.js dev server after changing `.env.local`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
