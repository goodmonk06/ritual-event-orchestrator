# Architecture Overview

## System Design

The Ritual Event Orchestrator follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  (Next.js App Router Pages + React Components + API Routes)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                        Service Layer                         │
│       (Business Logic + Domain Events + Orchestration)       │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                       Integration Layer                      │
│         (Adapters + Event Handlers + External APIs)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                        Data Layer                            │
│           (Prisma ORM + PostgreSQL + Repositories)           │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Domain Model (`prisma/schema.prisma`)

The domain model represents the core entities and their relationships:

**Primary Entities:**
- `Community` - Top-level organization container
- `RitualTemplate` - Reusable ritual blueprints
- `RitualStep` - Ordered steps within templates
- `RitualInstance` - Scheduled occurrences of rituals
- `RitualSeries` - Multi-session programs or recurring rituals
- `Facilitator` - People who lead rituals
- `Tag` - Categorization and discovery
- `ParticipantRegistration` - Attendance tracking
- `RitualFeedback` - Structured post-ritual feedback
- `OutcomeRecord` - Personal reflections and outcomes

**Key Relationships:**
- Community → Templates (1:many)
- Community → Facilitators (1:many)
- Template → Steps (1:many)
- Template → Instances (1:many)
- Series → Instances (1:many)
- Instance → Participants (1:many)
- Instance → Feedback (1:many)
- Facilitator → Instances (1:many)

### 2. Service Layer (`lib/services/`)

Encapsulates complex business logic and orchestrates multiple operations:

**RitualInstanceService:**
- `startInstance()` - Transition to in_progress, emit events
- `completeInstance()` - Mark complete, trigger integrations
- `cancelInstance()` - Handle cancellations
- `checkInParticipant()` - Track attendance
- `getInstanceStats()` - Calculate metrics

**AnalyticsService:**
- `getCommunityAnalytics()` - Aggregate community metrics
- `getPopularRituals()` - Identify trending rituals
- `getMemberParticipation()` - Member engagement history
- `getSeriesProgress()` - Track multi-session programs
- `getFacilitatorMetrics()` - Performance analytics

### 3. Event System (`lib/events/`)

Domain events enable loose coupling and extensibility:

**Event Flow:**
```
Action → Service Method → Emit Domain Event → Event Handlers → Side Effects
```

**Key Events:**
- `instance.started` - Ritual begins
- `instance.completed` - Ritual finishes
- `participant.checkedIn` - Attendance recorded
- `feedback.submitted` - Feedback received

**Default Handlers:**
- Send notifications (via NotificationAdapter)
- Award currency rewards (via CurrencyAdapter)
- Update quest progress (via QuestAdapter)
- Track metrics

### 4. Adapter Pattern (`lib/adapters/`)

Clean interfaces for external integrations:

**Interface Types:**
- `INotificationAdapter` - Send messages
- `ICurrencyAdapter` - Award rewards
- `IQuestAdapter` - Track quest progress
- `IProfileAdapter` - Fetch member data
- `IMetricsAdapter` - Record telemetry
- `IStorageAdapter` - File operations

**Implementations:**
- Stub adapters (development/testing)
- HTTP adapters (production)
- Swappable via `AdapterRegistry`

### 5. API Layer (`app/api/`)

RESTful endpoints following Next.js App Router conventions:

**Route Structure:**
```
/api/templates              - Template CRUD
/api/templates/[id]/steps   - Step management
/api/instances              - Instance CRUD
/api/instances/[id]/participants - Participant management
/api/facilitators           - Facilitator CRUD
/api/tags                   - Tag management
/api/analytics              - Analytics endpoints
/api/feedback               - Feedback submission
```

**Error Handling:**
All routes use centralized error handling via `handleApiError()` for consistent responses.

### 6. UI Layer (`app/`)

Next.js pages with React Server Components:

**Page Structure:**
- `/` - Dashboard and overview
- `/templates` - List all templates
- `/templates/[id]` - Template detail and editor
- `/instances` - List ritual instances
- `/instances/[id]` - Instance detail with facilitator controls

## Data Flow Examples

### Creating and Running a Ritual

```
1. User creates template via UI
   └→ POST /api/templates
      └→ Prisma.ritualTemplate.create()
      └→ Emit template.created event

2. User schedules instance
   └→ POST /api/instances
      └→ Prisma.ritualInstance.create()
      └→ Emit instance.scheduled event

3. Participants register
   └→ POST /api/instances/[id]/participants
      └→ Prisma.participantRegistration.create()
      └→ Emit participant.registered event

4. Facilitator starts ritual
   └→ PATCH /api/instances/[id] {status: 'in_progress'}
      └→ ritualInstanceService.startInstance()
         └→ Update database
         └→ Emit instance.started event
            └→ Metrics tracking

5. Participants check in
   └→ PATCH /api/instances/[id]/participants/[pid] {checkIn: true}
      └→ ritualInstanceService.checkInParticipant()
         └→ Update database
         └→ Emit participant.checkedIn event

6. Facilitator completes ritual
   └→ PATCH /api/instances/[id] {status: 'completed'}
      └→ ritualInstanceService.completeInstance()
         └→ Update database
         └→ Emit instance.completed event
            └→ Handler: Send notifications (NotificationAdapter)
            └→ Handler: Award currency (CurrencyAdapter)
            └→ Handler: Update quests (QuestAdapter)
            └→ Handler: Record metrics
```

### Analytics Query

```
1. Request community analytics
   └→ GET /api/analytics?communityId=X&startDate=Y&endDate=Z
      └→ analyticsService.getCommunityAnalytics()
         └→ Parallel queries to database:
            ├→ Count total instances
            ├→ Count completed instances
            ├→ Count participants
            └→ Calculate rates and averages
         └→ Return aggregated metrics
```

## Extension Points

### Adding New Integrations

1. Define interface in `lib/adapters/index.ts`
2. Implement stub version in `lib/adapters/implementations.ts`
3. Register in `lib/adapters/setup.ts`
4. Use via `getXAdapter()` helper

### Adding New Events

1. Define event type in `lib/events/types.ts`
2. Emit from service layer
3. Create handler in `lib/events/handlers.ts`
4. Register in `registerDefaultEventHandlers()`

### Adding New Vertical Slices

1. Define domain model in `prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Create service in `lib/services/`
4. Create API routes in `app/api/`
5. Create UI pages in `app/`
6. Add tests in `__tests__/`
7. Update seed data in `prisma/seed-enhanced.ts`

## Testing Strategy

**Unit Tests:**
- Business logic in service layer
- Domain model validation
- Event emission and handling

**Integration Tests:**
- API routes with database
- End-to-end flows
- Event system integration

**Fixtures:**
- Factories in `__tests__/fixtures/factories.ts`
- Reusable test data builders
- Isolated test scenarios

## Performance Considerations

**Database Optimization:**
- Indexes on foreign keys and query fields
- Selective includes to avoid N+1 queries
- Pagination for large lists

**Caching Strategy:**
- Analytics results (15 min cache)
- Template data (rarely changes)
- Community metadata

**Async Operations:**
- Event handlers run in parallel
- Non-critical side effects are fire-and-forget
- Background jobs for bulk operations

## Security

**Authentication:** (To be implemented)
- JWT-based auth
- Role-based access control (RBAC)
- Community-scoped data access

**Authorization:**
- Community admin can manage templates
- Facilitators can manage their instances
- Participants can only view their data

**Validation:**
- Zod schemas for all API inputs
- SQL injection prevention via Prisma
- XSS prevention via Next.js escaping

## Deployment

**Docker:**
- Multi-stage build for minimal image size
- Health checks for container orchestration
- Environment variable configuration

**Database:**
- Connection pooling via Prisma
- Migration system for schema changes
- Automated backups (external)

**Monitoring:**
- Metrics collection via MetricsAdapter
- Error tracking (to be integrated)
- Performance monitoring (APM)

## Future Architecture Improvements

**Phase 4+ Ideas:**
- GraphQL API layer alongside REST
- Real-time updates via WebSockets
- Event sourcing for audit trail
- CQRS for read/write optimization
- Microservices split (notification, analytics as separate services)
- Message queue for reliable integrations (RabbitMQ, SQS)
- CDN for static assets
- Redis for caching and session management
