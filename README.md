# ResearchBot Monorepo

A modular monorepo for the ResearchBot project, featuring enterprise-grade architecture.

## Structure

```
researchbot-monorepo/
├── apps/
│   ├── web/               # React frontend (Vite)
│   │   └── src/
│   │       ├── api/       # API clients
│   │       ├── components/# UI components
│   │       │   ├── ui/    # Base UI components
│   │       │   └── features/# Feature components
│   │       ├── hooks/     # Custom React hooks
│   │       ├── pages/     # Page components
│   │       ├── routes/    # Route definitions
│   │       ├── store/     # State management
│   │       ├── styles/    # Global styles
│   │       ├── types/     # Type definitions
│   │       └── utils/     # Utility functions
│   └── server/            # Node.js backend
│       └── src/
│           ├── config/    # Configuration
│           ├── middleware/ # HTTP middleware
│           ├── routes/    # API routes
│           ├── services/  # Business logic
│           ├── types/     # Type definitions
│           └── utils/     # Utility functions
├── shared/                # Shared types and utilities
│   └── src/
│       ├── search/        # Bing Search client
│       └── llm/           # LLM client (MiniMax)
├── tools/
│   └── langchain-tools/   # LangChain tool definitions
│       └── src/
│           ├── base/      # Base tool classes
│           ├── registry/  # Tool registry
│           └── tools/     # Tool implementations
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Packages

| Package | Description |
|---------|-------------|
| @researchbot/web | React frontend application |
| @researchbot/server | Node.js backend API server |
| @researchbot/shared | Shared types and utilities |
| @researchbot/langchain-tools | LangChain tool definitions |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development
pnpm dev          # Frontend only (port 3000)
pnpm dev:server   # Backend only (port 3001)
pnpm dev:all      # Both frontend and backend

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MINIMAX_API_KEY` - MiniMax API key for LLM
- `BING_SEARCH_API_KEY` - Bing Search API key
- `PORT` - Server port (default: 3001)