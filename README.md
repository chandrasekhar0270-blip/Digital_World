# Digital World

A comprehensive platform combining project management, financial tracking, and fitness coaching.

## Project Structure

```
Digital_World/
├─ frontend/              # Next.js 14 app
├─ backend/
│  ├─ pm-api/            # Project Management API
│  ├─ finance-api/       # Financial Twin API
│  ├─ fitness-api/       # Fitness Coach API
│  └─ shared/            # Shared utilities
├─ docker-compose.yml    # Local development
├─ .env.local            # Secrets (don't commit)
└─ README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and configure variables
3. Install dependencies

### Development

```bash
docker-compose up
```

## Services

- **Frontend**: Next.js 14 application
- **PM API**: Project Management API
- **Finance API**: Financial Twin API
- **Fitness API**: Fitness Coach API

## License

MIT
