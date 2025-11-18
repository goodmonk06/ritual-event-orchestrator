# Ritual Event Orchestrator

<div align="center">

**A production-grade service for orchestrating community ritual events**

セミナー・儀式・定例会・オンライン配信などの「儀礼イベント」をAIで設計・スケジュール・振り返りするオーケストレーター

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-brightgreen)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

</div>

---

## Overview

The **Ritual Event Orchestrator** is a comprehensive, production-ready service for managing the complete lifecycle of community ritual events—from template design through execution to reflection and analytics. It serves as the "event engine" within a larger AI-driven community operating system.

### What It Does

- 📋 **Template System** - Create reusable ritual blueprints with customizable step sequences
- 📅 **Scheduling** - Plan and manage ritual instances with facilitator assignment
- 👥 **Participant Management** - Track registrations, attendance, check-ins
- 📊 **Analytics** - Deep insights into engagement, popular rituals, facilitator performance
- 🔗 **Integrations** - Extensible adapter system for notifications, rewards, quest progression
- 🎯 **Series Support** - Multi-session programs and recurring rituals
- ⭐ **Feedback System** - Structured post-ritual feedback and ratings
- 🏷️ **Tagging & Discovery** - Categorize and search rituals by type, theme, skill level

### Who It's For

- **Community Platforms** managing regular gatherings and ceremonies
- **Spiritual Communities** coordinating moon rituals, meditation sessions, circles
- **Educational Programs** running workshops, cohorts, and learning series
- **Corporate Teams** organizing team rituals, retrospectives, celebrations
- **Wellness Centers** scheduling classes, sessions, and programs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) with TypeScript |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **API** | REST endpoints, typed with Zod validation |
| **Styling** | Tailwind CSS |
| **Testing** | Jest with test factories |
| **Infrastructure** | Docker + docker-compose |
| **Architecture** | Layered (Presentation → Service → Integration → Data) |

---

## Domain Model

### Core Concept: Templates vs Instances

**RitualTemplate**: A reusable blueprint (like a recipe)
- Example: "New Moon Intention Circle" defines structure and steps
- Contains: name, description, ritual type, ordered steps

**RitualInstance**: A specific scheduled occurrence (like cooking that recipe)
- Example: "New Moon Intention Circle on Dec 15, 2024 at 7 PM"
- Tracks: status, participants, actual timing, outcomes

### Entity Overview

\`\`\`
Community
├── RitualTemplate (many)
│   ├── RitualStep[] (ordered steps)
│   ├── RitualInstance[] (scheduled occurrences)
│   └── Tags[] (categorization)
├── Facilitator (many)
│   └── RitualInstance[] (rituals they lead)
└── RitualSeries (many)
    └── RitualInstance[] (sessions in series)

RitualInstance
├── ParticipantRegistration[] (who's attending)
├── RitualFeedback[] (structured ratings)
└── OutcomeRecord[] (personal reflections)
\`\`\`

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed design documentation.

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL 16+** (if running locally without Docker)

### Quick Start with Docker

\`\`\`bash
# Clone the repository
git clone <repo-url>
cd ritual-event-orchestrator

# Start database and application
docker-compose up -d

# Wait for services to be ready, then run migrations
docker-compose exec app npx prisma migrate deploy

# Seed with comprehensive demo data
docker-compose exec app npm run db:seed:enhanced

# Visit http://localhost:3000
\`\`\`

### Local Development Setup

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run db:migrate

# Seed database with enhanced data
npm run db:seed:enhanced

# Start development server
npm run dev

# Visit http://localhost:3000
\`\`\`

---

## Available Scripts

### Development

\`\`\`bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
\`\`\`

### Database

\`\`\`bash
npm run db:migrate       # Create and run new migration
npm run db:seed:enhanced # Seed comprehensive demo data ⭐
npm run db:studio        # Open Prisma Studio GUI
\`\`\`

### CLI Tools

\`\`\`bash
npm run cli stats        # Show database statistics
npm run cli list-templates # List all ritual templates
npm run cli list-instances # List recent instances
\`\`\`

---

## API Documentation

### Core Endpoints

#### Templates
\`\`\`
GET    /api/templates              # List all templates
POST   /api/templates              # Create template
GET    /api/templates/:id          # Get template details
\`\`\`

#### Instances
\`\`\`
GET    /api/instances              # List instances
POST   /api/instances              # Create instance
PATCH  /api/instances/:id          # Update (status changes)
\`\`\`

#### Analytics
\`\`\`
GET    /api/analytics              # Community analytics
GET    /api/analytics/popular      # Popular rituals
\`\`\`

Full API documentation in code comments.

---

## Architecture Highlights

- **Event-Driven**: Domain events for loose coupling
- **Adapter Pattern**: Swappable integrations
- **Service Layer**: Business logic separate from API
- **Type-Safe**: End-to-end TypeScript with Zod validation
- **Extensible**: Plugin system for custom handlers

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

---

## License

MIT License - see LICENSE file for details

---

<div align="center">

**Built with ❤️ for intentional communities**

*Transforming gatherings into meaningful, trackable, improvable experiences*

</div>
