# TOCA Player Portal by Yuan Yoshimi

A tech-enabled soccer training dashboard where players can sign in, review past training sessions, track performance metrics, view upcoming appointments, and manage their profile.

Built as a full-stack Single Page Application with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend).

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and **npm** 9+

### Install & Run

```bash
# 1. Install root dependencies (concurrently)
npm install

# 2. Install backend + frontend dependencies
npm run install:all

# 3. Start both servers in dev mode
npm run dev
```

This launches:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:5173

Open http://localhost:5173 in your browser.

### Docker (Alternative)

```bash
docker compose up --build
```

Opens on http://localhost:8080 with the API proxied through Nginx.

### Demo Accounts

| Email | Player |
|---|---|
| `sabrina.williams@example.com` | Sabrina Williams (Costa Mesa) |
| `morgan.johnson@example.com` | Morgan Johnson (Costa Mesa) |
| `alex.jones@example.com` | Alex Jones (Costa Mesa) |

---

## Project Structure

```
/
├── backend/              # Express + TypeScript API server
│   └── src/
│       ├── index.ts          # Server entry point
│       ├── models/types.ts   # Domain type definitions
│       ├── services/         # Data access layer
│       ├── routes/           # Express route handlers
│       ├── middleware/       # Error handling
│       └── __tests__/        # Vitest backend tests
├── frontend/             # React + Vite + TypeScript SPA
│   └── src/
│       ├── components/       # UI components + layout
│       │   └── ui/           # shadcn-style primitives
│       ├── context/          # Auth, Theme, Avatar, Goal contexts
│       ├── lib/              # Utilities (cn, dates, session tags, CSV export)
│       ├── pages/            # Route page components (Home, Book, About, Profile, SessionDetails)
│       ├── services/         # Typed API client
│       ├── types/            # Shared TypeScript models
│       └── __tests__/        # Vitest frontend tests
├── data/                 # JSON data files (source of truth)
│   ├── profiles.json
│   ├── trainingSessions.json
│   └── appointments.json
├── docker-compose.yml    # One-command Docker setup
├── package.json          # Root scripts (dev, build, lint, test)
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/players/by-email?email=` | Look up player by email |
| `GET` | `/api/players/leaderboard` | Ranked leaderboard of all players |
| `GET` | `/api/players/:id/summary` | Computed dashboard summary |
| `GET` | `/api/players/:id/training-sessions?filter=past\|all` | Player's training sessions |
| `GET` | `/api/training-sessions/:sessionId` | Single session details |
| `GET` | `/api/players/:id/appointments?filter=future\|all` | Player's appointments |
| `POST` | `/api/players/:id/appointments` | Book a new appointment |
| `DELETE` | `/api/players/:id/appointments/:appointmentId` | Cancel an appointment |
| `GET` | `/api/players/trainers` | List of available trainers |
| `GET` | `/api/schedule?date=YYYY-MM-DD&trainerName=` | Trainer schedules with slot availability |

All route params (`:id`, `:sessionId`, `:appointmentId`) are validated as UUIDs via Zod. Request bodies are validated with Zod schemas (e.g., ISO 8601 datetime, future-only, end > start). Query params are also validated.

---

## Features

### Core Features (Per Assignment)

#### 1. Sign In
- Email-based lookup (no real auth — per spec)
- Player state persisted in localStorage across refreshes
- Friendly error message when email not found

#### 2. Header & Navigation
- TOCA logo in the sidebar/header with dark-mode compatibility
- Sidebar navigation: **Home**, **Book Session**, **About TOCA**, **Profile**
- Sign-out button that clears session and redirects to sign-in
- Responsive layout: sidebar on desktop, collapsible drawer on mobile

#### 3. Home Dashboard
- **Summary cards**: Last session score, average score, best streak, total sessions
- **Last 30 days**: Quick stats for recent activity
- **Score progress chart**: Recharts line chart plotting score over time with average reference line
- **Past training sessions**: Clickable cards sorted newest-first → navigate to session details
- **Upcoming appointments**: Sorted soonest-first with date/time and trainer
- Error state when data fails to load

#### 4. Session Details
- Full metrics display: score, goals, streak, speed, balls, exercises
- Performance insight comparing session score vs. player average
- Above/near/below average badge

#### 5. About TOCA
- Original content sourced from the TOCA Football website
- Sections: Mission, Origin Story, What Sets TOCA Apart (6 feature cards), Ways to Play, All Locations

#### 6. Profile
- Player card with avatar, name, center, age, avg score, sessions count
- All player fields displayed with inline editing (click pencil → edit → save/cancel)

### Bonus Features

#### Dark Mode
- System-preference-aware theme toggle (light/dark)
- Persisted in localStorage
- All components, charts, and the TOCA logo adapt seamlessly

#### Player Leaderboard
- Ranked list of all players by average score
- Expandable cards showing detailed career stats (goals, streaks, speed, balls, sessions)
- Per-session averages computed inline
- "Head to Head" comparison against the signed-in player with visual indicators

#### Session Comparison (vs. Previous)
- Side-by-side metric comparison with the previous session
- Color-coded diff indicators (green for improvement, red for decline, neutral)

#### Session Quality Tags
- Auto-generated labels based on session metrics (e.g., "Elite Performance", "Sharpshooter", "Hot Streak")
- Shown on session cards in the home list and on the session details page

#### Profile Picture Upload
- Click the camera icon on the player card to upload a photo
- Client-side image resizing (max 256px, JPEG) before storing as Base64 in localStorage
- Remove button to delete the avatar
- Avatar appears in the sidebar and player card

#### Editable Profile Fields
- Every field (first name, last name, email, phone, gender, DOB, center) is inline-editable
- Enter to save, Escape to cancel
- Changes persist via AuthContext → localStorage

#### Goal Setting & Progress Tracking
- Set a target average score to work toward
- Visual progress bar with color-coded status (orange → amber → primary → green)
- Achievement state when goal is reached with celebratory UI
- Persisted in localStorage per player

#### Session Filtering & Search
- Search past sessions by trainer name or date
- Filter by score range (min/max)
- Quick-filter chips for each trainer
- Active filter count badge and clear button

#### Appointment Booking & Cancellation
- **Dedicated booking page** (`/book`) with full scheduling calendar
- **Week calendar view**: Navigate between weeks, click a day to see available time slots
- **Coach selector**: Filter availability by specific coach, or view all coaches at once
- **Coach schedule cards**: Each coach gets a card showing their 9 AM – 5 PM slot grid with color-coded availability
- **One-click booking**: Select an available slot and confirm with a single click
- **Real-time availability**: Booked slots are immediately marked as unavailable across all views (query invalidation)
- **My upcoming sessions**: Summary of booked appointments shown at the bottom of the booking page
- Cancellation available on the Home page (hover to reveal cancel button)
- Zod validation on the backend: must be in the future, end time must be after start time, valid trainer
- Data persists in memory during the server session (resets on restart, per the no-database spec)

#### CSV Data Export
- "Export CSV" button on the past sessions card
- Downloads all training sessions as a properly formatted CSV file
- Includes all metrics: date, trainer, score, goals, streak, speed, balls, exercises

#### Code Splitting & Lazy Loading
- All route pages are lazy-loaded with `React.lazy` + `Suspense`
- Reduces initial bundle from 714KB to 325KB (54% reduction)
- Skeleton loading UI shown during chunk loading

#### Error Boundary
- React class-component error boundary wraps the entire app
- Catches rendering crashes and shows a friendly recovery UI
- "Try Again" (reset) and "Reload Page" options

#### Animated Page Transitions
- Framer Motion fade + slide animations on route changes
- Subtle 200ms ease-out transitions for a polished feel

#### Docker Support
- `docker-compose.yml` for one-command deployment
- Backend: Node.js + tsx runner
- Frontend: Multi-stage build → Nginx serving static assets
- Nginx config with SPA fallback and API proxy

#### Automated Testing
- **Backend**: 22 tests covering data service functions (player lookup, session queries, summary computation, leaderboard ranking)
- **Frontend**: 21 tests covering utility functions (date formatting, age computation), session tag generation (12 test cases), and CSV export
- Total: **43 tests**, all passing
- Framework: Vitest with happy-dom environment

---

## Implementation Notes

### Architecture
- **Backend**: Express server reads JSON files from `/data` once on startup and caches in memory. A service layer encapsulates all data access and computation. Zod validates all incoming query parameters and route params (UUID format). Centralized error handler catches unhandled errors.
- **Frontend**: React Router handles client-side routing with lazy-loaded pages. TanStack Query manages server state with 5-minute stale time. A typed API client module wraps all fetch calls with proper error types. Four React Contexts manage global state (Auth, Theme, Avatar, Goal). ErrorBoundary wraps the app for crash recovery.

### Data Filtering & Sorting
- **Past sessions**: `startTime < now`, sorted newest-first (descending by `startTime`)
- **Future appointments**: `startTime > now`, sorted soonest-first (ascending by `startTime`)
- **Player summary**: Computes stats across all past sessions + last-30-days slice
- **Leaderboard**: Ranked by avgScore descending, totalGoals as tiebreaker

### Persistence
- Signed-in player → `localStorage` key `toca_player`
- Theme preference → `localStorage` key `toca_theme`
- Profile avatars → `localStorage` key `toca_avatars`
- Score goals → `localStorage` key `toca_goals`
- On app load, contexts read from localStorage to restore state
- Protected routes redirect unauthenticated users to `/sign-in`

### Performance
- Route-level code splitting reduces initial load by 54%
- TanStack Query caches API responses for 5 minutes
- Image uploads are resized client-side before storage
- Loading skeletons prevent layout shift during data fetching

### Time Handling
- All times stored in ISO 8601 with UTC (Z suffix)
- `date-fns` parses and formats to user's local timezone
- Display format: "Jan 31, 2026 • 6:00 PM – 7:00 PM"

### Accessibility
- All icon-only buttons have `aria-label` attributes
- Semantic HTML elements and proper heading hierarchy
- Keyboard navigation support (Enter/Escape for inline editing)
- Form labels associated with inputs

### TypeScript Quality
- Strict mode enabled on both frontend and backend
- No `any` types — all data is fully typed with interfaces
- Non-null assertions replaced with proper null guards
- Zod for runtime validation at API boundaries
- Named constants for magic numbers (session tag thresholds)

### Testing Strategy
- **Unit tests** for pure business logic (data service, utilities, tag generation)
- **Integration tests** for data service with real JSON fixtures
- Tests run in <1 second via Vitest's fast execution
- `npm test` runs both backend and frontend test suites

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both backend and frontend in dev mode |
| `npm run build` | Build both projects for production |
| `npm run lint` | Run ESLint on both projects |
| `npm run format` | Run Prettier on both projects |
| `npm run test` | Run all tests (backend + frontend) |
| `npm run test:backend` | Run backend tests only |
| `npm run test:frontend` | Run frontend tests only |
| `npm run install:all` | Install dependencies for backend + frontend |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing | React Router v7 |
| Data Fetching | TanStack Query v5 |
| Styling | TailwindCSS v4, shadcn/ui-style components |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express 4, TypeScript |
| Validation | Zod |
| Date Handling | date-fns |
| Testing | Vitest, React Testing Library |
| Containerization | Docker, Nginx |
