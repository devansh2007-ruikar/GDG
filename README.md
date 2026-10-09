# 🚀 GDG Event Management & Registration Platform

A production-grade, full-stack event discovery and registration platform built for the **Google Developer Groups (GDG)** club interview. The system allows users to discover tech events, view real-time seat availability, register with high-concurrency safety, and generate digital QR admission tickets. Administrators can manage events, monitor attendee rosters, and view real-time platform analytics.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Concurrency Safety & Race Condition Prevention](#-concurrency-safety--race-condition-prevention)
- [🌟 Implemented Bonus Features (Step 7)](#-implemented-bonus-features-step-7)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: One-Command Docker Setup (Recommended)](#option-a-one-command-docker-setup-recommended)
  - [Option B: Local Development Setup](#option-b-local-development-setup)
- [Automated Testing & Concurrency Blitz](#-automated-testing--concurrency-blitz)
- [API Documentation & Postman Collection](#-api-documentation--postman-collection)
- [Demo Credentials](#-demo-credentials)

---

## 🏗 Architectural Overview

The backend is built following strict **layered architecture** standards:
```
Routes ──> Controllers ──> Services ──> Prisma ORM ──> SQLite / PostgreSQL
   ▲                                         │
   └────────── Central Error Handler ────────┘
```
- **Separation of Concerns**: Controllers only handle HTTP parsing, parameter validation, and status code delivery. All business rules, invariants, and transactional logic reside exclusively in **Services**.
- **Centralized Error Handling**: Custom `AppError` class ensures standard API responses:
  - **Success**: `{ "success": true, "data": ... }`
  - **Error**: `{ "success": false, "error": { "code": "...", "message": "..." } }`
- **Zero Placeholders**: Every feature, component, route, and test is fully implemented with real logic.

---

## 🛠 Tech Stack

### Backend (`/backend`)
- **Runtime & Framework**: Node.js & Express.js
- **ORM & Database**: Prisma ORM with **SQLite** for zero-config local runs and **PostgreSQL** in Docker
- **Authentication**: Stateless JSON Web Tokens (JWT) + `bcrypt` password hashing (10 salt rounds)
- **Validation**: `Zod` schema validation for bodies, queries, and route parameters
- **Security & Quality**: `helmet`, `cors`, `morgan`, `express-rate-limit`
- **Testing**: `Jest` + `Supertest` with automated test database setup and teardown
- **Documentation**: Swagger / OpenAPI 3.0 via `swagger-ui-express`

### Frontend (`/frontend`)
- **Library & Build**: React 18 with Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios with global JWT injection and automated 401 logout interceptor
- **Styling**: Modern, responsive **Vanilla CSS** design system (dark mode, glassmorphism, custom badges, accessible contrast, micro-animations)

---

## 🎯 Key Features

1. **Authentication & Authorization**
   - User registration with password complexity enforcement (min 8 chars, letter + number).
   - Timing-safe login with generic error messages (`"Invalid email or password"`) to prevent account enumeration attacks.
   - Role-Based Access Control (`USER` vs `ADMIN`). Users can never escalate their own privileges.
   - Brute-force protection on auth endpoints via `express-rate-limit`.

2. **Event Discovery, Search & Filtering**
   - Search across titles, descriptions, and venues.
   - Filter by categories dynamically fetched from active events.
   - Date range filtering (`from`, `to`), upcoming events filter, and sorting.
   - Pagination with metadata (`page`, `limit`, `total`, `totalPages`).
   - Dynamic `seatsLeft` calculation (`capacity - registeredCount`).

3. **Event Lifecycle & Administration**
   - Admin event creation and partial updates.
   - **Capacity Invariant**: Admin cannot decrease capacity below existing registrations (`409 CAPACITY_BELOW_REGISTERED`).
   - Cascade deletion: Deleting an event safely cleans up associated registrations.
   - Attendee rosters: Admins can inspect real-time registration lists with attendee names and emails.

---

## ⚡ Concurrency Safety & Race Condition Prevention

### The Problem: Time-Of-Check to Time-Of-Use (TOCTOU)
In naive implementations, checking seat availability and incrementing the count happen in separate queries:
```
Request A: Read capacity (4/5 seats) -> Available!
Request B: Read capacity (4/5 seats) -> Available!
Request A: Increment count (5/5 seats) -> Registered!
Request B: Increment count (6/5 seats) -> Overbooking! ❌
```

### The Solution: Atomic Conditional Execution in Prisma Transactions
In this project, registrations are executed inside an atomic `prisma.$transaction`:
1. **Immediate Write Lock**: The transaction directly executes an atomic conditional update:
   ```javascript
   const updateResult = await tx.event.updateMany({
     where: {
       id: eventId,
       registeredCount: { lt: capacity }, // Atomic predicate
     },
     data: {
       registeredCount: { increment: 1 },
     },
   });
   ```
2. **Deterministic Full Check**: If `updateResult.count === 0`, either the event does not exist or all seats were already claimed at that millisecond. The transaction immediately throws `409 EVENT_FULL`.
3. **Double Registration Prevention**: The `Registration` model enforces a database unique compound index `@@unique([userId, eventId])`. If a duplicate registration occurs, Prisma throws `P2002` and the transaction automatically rolls back the seat increment.
4. **Past Event Guard**: Transactions verify the event has not already started before booking.

---

## 🌟 Implemented Bonus Features (Step 7)

All 4 bonus features specified in Step 7 have been fully implemented and verified:

### 1. 🐳 Docker & Docker Compose
- **Backend Dockerfile** (`/backend/Dockerfile`): Production Node 20 Alpine container with `docker-entrypoint.sh`.
- **Frontend Dockerfile** (`/frontend/Dockerfile`): Multi-stage build (Vite compilation -> static Nginx Alpine server with SPA routing and API reverse-proxy).
- **PostgreSQL 16**: `docker-compose.yml` runs a dedicated PostgreSQL instance with healthcheck.
- **Automated Provider Switching**: When running in Docker, `docker-entrypoint.sh` detects `DATABASE_URL=postgresql://...`, automatically updates the Prisma schema provider from `sqlite` to `postgresql`, runs `prisma db push`, and seeds the database.
- **Single-Command Launch**: Run `docker compose up --build` to start all three services simultaneously.

### 2. 🎟️ QR Code Tickets
- **Endpoint**: `GET /api/registrations/:id/qr`
- **Security**: Only the ticket owner or an Administrator can view the ticket QR code (non-owners receive `403 FORBIDDEN`).
- **Generation**: Encodes structured ticket metadata (ticket ID, event title, attendee name, email, event date) into a base64 Data URL using the `qrcode` library.
- **Frontend Experience**: The **My Registrations** page includes a **"🎟️ View QR Pass"** button on each confirmed booking, opening an interactive digital admission pass with attendee verification and print/save functionality.

### 3. 📊 Admin Analytics Dashboard
- **Endpoint**: `GET /api/admin/analytics` (Admin only)
- **Aggregated Metrics**:
  - `totalEvents`: Total events published on the platform.
  - `totalUsers`: Total active registered attendees.
  - `totalRegistrations`: Total seats claimed.
  - `topEvents`: Top 5 events ranked by fill rate (`registeredCount / capacity`) with fill percentages.
  - `registrationsByCategory`: Distribution of attendee bookings grouped by category.
- **Frontend Display**: Displayed directly on the **Admin Page** as responsive stat cards and visual progress bars alongside the event directory.

### 4. ⏰ Automated Background Reminders (Cron Job)
- **Schedule**: Recurring background job running every hour via `node-cron`.
- **Logic**: Discovers upcoming events scheduled to start within the next 24 hours.
- **Idempotency**: Utilizes a `remindedAt` timestamp field on the `Registration` model. When reminders are dispatched, `remindedAt` is stamped with the current time, ensuring **no user is ever reminded twice**.
- **Delivery**: Dispatches structured notification logs with attendee details, venue, and start times.

---

## 🚀 Quick Start Guide

### Option A: One-Command Docker Setup (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Docker Compose:

```bash
# Clone the repository
git clone https://github.com/devansh2007-ruikar/GDG.git
cd GDG

# Build and start PostgreSQL, Backend, and Frontend in one command
docker compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

### Option B: Local Development Setup

#### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Initialize SQLite database and seed initial data
npx prisma db push
node prisma/seed.js

# Start backend server in development mode (port 5000)
npm run dev
```

#### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (port 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing & Concurrency Blitz

The backend includes a comprehensive automated test suite of **52 unit, integration, and concurrency tests** powered by `Jest` and `Supertest`.

### Concurrency Stress Test
Located in `backend/tests/concurrency.test.js`:
- Spawns an event with a strict capacity of **5 seats**.
- Creates **20 distinct registered user accounts**.
- Simultaneously fires **20 concurrent HTTP registration requests** using `Promise.all`.
- **Result**: Exactly 5 requests receive `201 Created`, exactly 15 receive `409 EVENT_FULL`, and the database `registeredCount` remains exactly 5 with 0 overbookings.

### Running Tests
```bash
cd backend
npm test
```

Test Suites:
- `tests/bonus.test.js`: QR codes, Admin Analytics, and Cron reminder idempotency.
- `tests/concurrency.test.js`: High-concurrency 20-user race condition test.
- `tests/auth.test.js`: Registration, login enumeration safety, JWT validation, roles.
- `tests/events.test.js`: Event CRUD, filters, search, pagination, capacity invariants.
- `tests/registrations.test.js`: Registration lifecycle, duplicate checks, cancellation.
- `tests/health.test.js`: System health checks and 404 handlers.
- `tests/rateLimiter.test.js`: Auth rate limit enforcement.

---

## 📖 API Documentation & Postman Collection

### Interactive Swagger UI
When the backend is running, open:
```
http://localhost:5000/api/docs
```
Explore, test, and authenticate endpoints directly in the browser with full OpenAPI 3.0 schema definitions.

### Postman Collection
A complete Postman collection is included in the repository:
```
backend/docs/postman_collection.json
```
Import this file directly into Postman to test all endpoints with pre-configured request bodies and environment variables.

---

## 🔑 Demo Credentials

The database is pre-seeded with the following accounts for immediate testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gdg.com` | `Admin@123` | Create/edit/delete events, view rosters, view analytics |
| **User 1** | `user1@gdg.com` | `User@123` | Discover events, register, view QR tickets, unregister |
| **User 2** | `user2@gdg.com` | `User@123` | Discover events, register, view QR tickets, unregister |

*(You can also sign up with any new account via the frontend signup page!)*
