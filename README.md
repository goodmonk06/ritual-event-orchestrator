# Ritual Event Orchestrator

セミナー・儀式・定例会・オンライン配信などの「儀礼イベント」をAIで設計・スケジュール・振り返りするオーケストレーター。

A fullstack TypeScript service for orchestrating ritual events within a community - seminars, group calls, moon rituals, challenges, festivals, and more.

## Concept

This service manages the complete lifecycle of ritual events:

- **Event templates** with customizable step-by-step flows
- **Scheduled instances** of ritual events
- **Participant management** with registration and attendance tracking
- **Outcome recording** for reflection and growth
- **Integration hooks** for notifications, rewards, and quest progression

## Core Domain Model

Understanding the relationship between **Templates** and **Instances** is fundamental:

### Template vs Instance

- **RitualTemplate**: A reusable blueprint for a type of ritual
  - Example: "New Moon Intention Circle" template defines the structure and steps
  - Contains: name, description, ritual type, and ordered steps
  - Can be used to create multiple instances

- **RitualInstance**: A specific scheduled occurrence of a ritual
  - Example: "New Moon Intention Circle on Dec 15, 2024 at 7 PM"
  - Links to a template but has its own schedule and participants
  - Tracks status: scheduled → in_progress → completed/cancelled

**Analogy**: A template is like a recipe, while an instance is a specific time you cook that recipe.

### Domain Models

```
RitualTemplate
├── id, communityId, key, name
├── descriptionMarkdown
├── ritualType (live_call | asynchronous_challenge | hybrid)
├── defaultDurationMinutes
└── steps: RitualStep[]

RitualStep
├── id, templateId, orderIndex
├── stepType (talk | meditation | breakout | sharing | exercise)
├── title, instructionsMarkdown
└── durationMinutes

RitualInstance
├── id, templateId
├── scheduledStart, scheduledEnd
├── status (scheduled | in_progress | completed | cancelled)
├── participants: ParticipantRegistration[]
└── outcomes: OutcomeRecord[]

ParticipantRegistration
├── id, ritualInstanceId, memberId
├── status (registered | attended | no_show)
└── checkInAt, checkOutAt

OutcomeRecord
├── id, ritualInstanceId, memberId
├── notesMarkdown, rating (1-5)
└── tagsJson
```

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **API**: REST endpoints under `/api`
- **Styling**: Tailwind CSS
- **Testing**: Jest
- **Infrastructure**: Docker + docker-compose

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized setup)
- OR PostgreSQL 16+ (for local development)

### Quick Start with Docker

```bash
# Clone and navigate to the repository
cd ritual-event-orchestrator

# Start the database and application
docker-compose up -d

# Wait for services to be ready, then run migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database with example data
docker-compose exec app npm run db:seed

# Visit http://localhost:3000
```

### Local Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run tests in watch mode
npm run test:ci          # Run tests in CI mode

npm run db:migrate       # Run database migrations (dev)
npm run db:migrate:deploy # Deploy migrations (production)
npm run db:seed          # Seed database with example data
npm run db:studio        # Open Prisma Studio
npm run prisma:generate  # Generate Prisma Client
```

## Project Structure

```
ritual-event-orchestrator/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API routes
│   │   ├── templates/        # Template CRUD
│   │   └── instances/        # Instance management
│   ├── templates/            # Template UI pages
│   ├── instances/            # Instance UI pages
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Home page
├── lib/                      # Shared utilities
│   ├── db.ts                 # Prisma client singleton
│   └── integrations/         # Integration stubs
│       ├── notification-hub.ts
│       ├── currency-economy.ts
│       ├── quest-engine.ts
│       └── index.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── __tests__/                # Jest tests
├── Dockerfile                # Production container
├── docker-compose.yml        # Local development setup
└── README.md                 # This file
```

## API Endpoints

### Templates

```
GET    /api/templates              List all templates
POST   /api/templates              Create a template
GET    /api/templates/:id          Get template details
PATCH  /api/templates/:id          Update template
DELETE /api/templates/:id          Delete template

GET    /api/templates/:id/steps    List steps
POST   /api/templates/:id/steps    Add a step
PUT    /api/templates/:id/steps    Batch update steps (for reordering)
```

### Instances

```
GET    /api/instances              List instances (?upcoming=true, ?status=completed)
POST   /api/instances              Create instance from template
GET    /api/instances/:id          Get instance details
PATCH  /api/instances/:id          Update status (start, complete, cancel)
DELETE /api/instances/:id          Delete instance
```

### Participants

```
GET    /api/instances/:id/participants                    List participants
POST   /api/instances/:id/participants                    Register participant
PATCH  /api/instances/:id/participants/:participantId     Check in/out, update status
DELETE /api/instances/:id/participants/:participantId     Remove participant
```

### Outcomes

```
GET    /api/instances/:id/outcomes    List outcomes
POST   /api/instances/:id/outcomes    Record outcome
```

## Example Workflows

### Creating and Running a Ritual

1. **Design a Template**
   ```
   Navigate to /templates → Create Template
   - Define ritual type (live_call, asynchronous_challenge, hybrid)
   - Add steps in order (talk, meditation, breakout, sharing, exercise)
   - Set durations and instructions for each step
   ```

2. **Schedule an Instance**
   ```
   From template detail page → Schedule Instance
   - Choose date and time
   - Instance is created with status "scheduled"
   ```

3. **Manage Participants**
   ```
   From instance detail page:
   - Add participants (members register)
   - Participants show as "registered"
   ```

4. **Run the Ritual**
   ```
   Facilitator Control Panel:
   - Click "Start Ritual" (scheduled → in_progress)
   - Check in participants as they join
   - Follow the ritual steps displayed on page
   - Click "Complete Ritual" when done
   ```

5. **Completion & Integrations**
   ```
   When status changes to "completed":
   - System automatically triggers integrations
   - Notifications sent to participants
   - Currency rewards awarded
   - Quest steps marked complete
   ```

### Integration Points

The system includes stub implementations for three external services:

#### 1. unified-notification-hub
```typescript
// Sends follow-up messages after ritual completion
await notificationHub.sendRitualCompletionNotification(
  ritualInstanceId,
  participantIds,
  ritualName
)
```

#### 2. community-currency-economy-core
```typescript
// Awards currency for participation
await currencyEconomy.awardParticipationRewards(
  ritualInstanceId,
  participantIds,
  ritualName,
  baseReward // default: 10
)
```

#### 3. quest-based-learning-path-engine
```typescript
// Marks quest steps complete
await questEngine.markRitualQuestSteps(
  ritualTemplateKey,
  participantIds,
  ritualInstanceId
)
```

These are **stub implementations** that log actions but don't make real HTTP calls. To activate them, uncomment the `fetch()` calls in each client file under `lib/integrations/`.

## Testing

The project includes tests for core business logic:

```bash
# Run all tests
npm test

# Run in CI mode
npm run test:ci
```

Test coverage includes:
- Step ordering logic
- Instance status transitions
- Participant management
- Attendance tracking

## Example Data

Run the seed script to populate with two example templates:

1. **New Moon Intention Circle** (90 min, live_call)
   - Opening & Welcome
   - Grounding Meditation
   - Reflection on Past Cycle
   - Circle Sharing - Releases
   - Intention Setting
   - Circle Sharing - Intentions
   - Closing & Integration

2. **Inner Work Weekly Group** (60 min, hybrid)
   - Check-in Round
   - Centering Practice
   - Weekly Theme Introduction
   - Small Group Exploration
   - Insights & Integration
   - Weekly Practice Assignment

## Linking with Other Services

This service is designed to work alongside:

- **unified-notification-hub**: Post-ritual follow-ups and reminders
- **community-currency-economy-core**: Reward participation with community currency
- **quest-based-learning-path-engine**: Progress quests through ritual attendance

### Example Integration Flow

```
1. Member completes "New Moon Intention Circle" instance
2. Facilitator marks ritual as "completed"
3. System triggers:
   ├─ Notification: "Thank you for attending! Here are your reflection prompts..."
   ├─ Currency: Award 10 tokens for participation
   └─ Quest: Mark "Attend New Moon Ritual" step complete
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ritual_orchestrator"

# Integration endpoints (optional)
NOTIFICATION_HUB_URL="http://localhost:3001"
CURRENCY_ECONOMY_URL="http://localhost:3002"
QUEST_ENGINE_URL="http://localhost:3003"
```

## Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name describe_your_change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Production Deployment

### Build Docker Image

```bash
docker build -t ritual-orchestrator .
```

### Deploy with docker-compose

```bash
docker-compose -f docker-compose.yml up -d
```

### Environment Setup

Ensure production `.env` has:
- Secure `DATABASE_URL`
- Correct integration service URLs
- Any required API keys for external services

## Development Principles

This service prioritizes:

1. **Clear, composable models** over fancy UI
2. **Explicit state transitions** for ritual instances
3. **Simple, RESTful APIs** that are easy to integrate
4. **Stub integrations** that can be activated when ready
5. **Flexible ritual steps** that accommodate different formats

## Future Enhancements

Potential additions:
- [ ] Real-time presence during live rituals (WebSockets)
- [ ] Recording upload and storage for asynchronous access
- [ ] Analytics dashboard for ritual engagement
- [ ] Template marketplace for community sharing
- [ ] Automated scheduling (e.g., "every new moon")
- [ ] Email/SMS reminders via notification hub
- [ ] Video conferencing integration (Zoom, Meet)
- [ ] Mobile app for participant check-in

## License

MIT License - see LICENSE file for details

## Contributing

This is a community project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

---

Built with ❤️ for intentional communities
