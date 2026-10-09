# 🚀 GDG Event Management & Registration Platform

A production-grade, full-stack event discovery, registration, and administration platform built for the **Google Developer Groups (GDG) RBU** club recruitment technical task. Engineered for high concurrency with atomic database-level bookings, timing-safe authentication, live administrative analytics, and digital QR admission passes.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render&logoColor=white)](https://render.com/)

---

## 🔗 Live Demo

| Service | Live URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [https://gdg-iota-inky.vercel.app](https://gdg-iota-inky.vercel.app) | Responsive React UI hosted on Vercel |
| **Backend API Base** | [https://gdg-oz97.onrender.com/api](https://gdg-oz97.onrender.com/api) | Express REST API hosted on Render |
| **Swagger API Docs** | [https://gdg-oz97.onrender.com/api/docs](https://gdg-oz97.onrender.com/api/docs) | Interactive OpenAPI 3.0 documentation |
| **System Health Check** | [https://gdg-oz97.onrender.com/api/health](https://gdg-oz97.onrender.com/api/health) | Real-time service uptime & health status |
| **GitHub Repository** | [https://github.com/devansh2007-ruikar/GDG](https://github.com/devansh2007-ruikar/GDG) | Source code repository |
| **Cloud Database** | PostgreSQL hosted on Neon | Serverless PostgreSQL with connection pooling |

> ⏳ **Note for Reviewers**: The backend runs on Render's free tier and spins down when idle. It may take **~50 seconds** to wake up on the first request. Please open the [Health Check link](https://gdg-oz97.onrender.com/api/health) first to wake the server before testing.

---

## 👤 Demo Accounts

The database is pre-seeded with the following credentials for immediate evaluation:

| Role | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gdg.com` | `Admin@123` | Full administrative control: Create, edit, delete events, view attendee rosters, live analytics |
| **Attendee 1** | `user1@gdg.com` | `User@123` | Normal attendee: Browse events, register, cancel, download QR tickets |
| **Attendee 2** | `user2@gdg.com` | `User@123` | Normal attendee: Secondary account to test capacity race conditions & duplicate rules |

> 💡 **Quick Login**: The login page contains preset buttons (`Fill Admin` and `Fill Attendee`) to populate credentials with one click. You can also register a brand-new user; accounts are stored permanently in the Neon PostgreSQL database.

---

## ✅ Reviewer Quick Check (5 Minutes)

Follow this 5-minute checklist on the live site to verify all core and bonus features:

1. **Verify API Health**: Open [Health Check](https://gdg-oz97.onrender.com/api/health) in your browser -> Verify `{"success":true,"data":{"status":"ok",...}}`.
2. **Browse & Filter Events**: Visit [https://gdg-iota-inky.vercel.app](https://gdg-iota-inky.vercel.app) -> Test keyword search (debounced 400ms), domain filter pills (Tech, Workshop, Hackathon, etc.), and the "Upcoming Only" toggle.
3. **Register New User**: Click "Join Us" -> Create a new user -> Log in -> Open any event detail page -> Click **"Register for Event"** -> Verify badge changes to "Confirmed Attendee" with live seat decrement.
4. **Test Duplicate Prevention**: Click the register button again (or fire another registration request) -> Verify the system rejects duplicates with **`409 ALREADY_REGISTERED`**.
5. **Test Capacity Enforcement**: Locate the single-seat event (*"Exclusive Hands-on Agentic AI Masterclass"*, capacity: 1). Register user 1 -> Log out -> Log in as user 2 and attempt to register -> Verify registration is blocked with **`409 EVENT_FULL`**.
6. **Self-Service Cancellation**: Go to **"My Registrations"** -> Click **"Cancel"** on your booked event -> Verify seat count increments back immediately.
7. **Digital QR Code Passes**: Under "My Registrations", click **"View Digital Pass"** on an upcoming booking -> Verify generated scannable QR ticket modal with print capability.
8. **Admin Operations & Real-Time Analytics**: Log in as `admin@gdg.com` -> Navigate to **"Admin"** -> Check the 5 real-time stat cards (Total Events, Upcoming Events, Registered Users, Total Bookings, Unique Attendees). Create an event, edit an event, view attendee rosters, or delete an event -> Verify analytics auto-refetch dynamically.
9. **Role-Based Protection**: Log out -> Manually navigate to `https://gdg-iota-inky.vercel.app/admin` in your address bar -> Verify route is automatically protected and redirects to `/login`.
10. **Interactive Swagger Docs**: Open [Swagger UI](https://gdg-oz97.onrender.com/api/docs) -> Click **Authorize** -> Enter Bearer JWT -> Test endpoints with persistent token authorization.

---

## 🧪 Test the API with curl

All commands run directly against the live Render API:

### 1. Health Check
```bash
curl -X GET https://gdg-oz97.onrender.com/api/health
```
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptimeSeconds": 1420,
    "timestamp": "2026-10-09T22:15:00.000Z",
    "environment": "production"
  }
}
```

### 2. Login & Obtain JWT Token
```bash
curl -X POST https://gdg-oz97.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@gdg.com","password":"User@123"}'
```
*Copy the returned `token` from the response JSON:*
```bash
TOKEN="<PASTE_TOKEN_HERE>"
```

### 3. List Events with Search & Category Query Parameters
```bash
curl -X GET "https://gdg-oz97.onrender.com/api/events?search=Cloud&category=Tech&upcoming=true&page=1&limit=10"
```

### 4. Register for an Event (Authenticated)
```bash
# Replace <EVENT_ID> with an id from the events list
curl -X POST https://gdg-oz97.onrender.com/api/events/<EVENT_ID>/register \
  -H "Authorization: Bearer $TOKEN"
```
```json
{
  "success": true,
  "data": {
    "id": "c138f618-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "userId": "1eb60f6a-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "eventId": "<EVENT_ID>",
    "createdAt": "2026-10-09T22:15:30.000Z"
  }
}
```

### 5. Duplicate Registration Attempt (Rejected)
```bash
# Execute the exact same command again
curl -X POST https://gdg-oz97.onrender.com/api/events/<EVENT_ID>/register \
  -H "Authorization: Bearer $TOKEN"
```
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "You are already registered for this event"
  }
}
```

### 6. Role-Based Access Control: Regular User Creating Event (Forbidden)
```bash
curl -X POST https://gdg-oz97.onrender.com/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Event",
    "description": "Testing RBAC violation from regular user",
    "dateTime": "2026-11-20T10:00:00.000Z",
    "venue": "Lab 101",
    "capacity": 50,
    "category": "Tech"
  }'
```
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: insufficient permissions"
  }
}
```

---

## 📋 Task Requirements Coverage

Every required feature is fully implemented in code, documented, and covered by automated tests:

| Requirement Category | Description | Implementation Status | Code Location |
| :--- | :--- | :---: | :--- |
| **Authentication & RBAC** | User registration & login with timing-safe error responses, JWT issuance, `authenticate` & `authorize` middleware | ✅ Complete | [`backend/src/routes/authRoutes.js`](file:///home/devansh/Documents/GDG/backend/src/routes/authRoutes.js)<br>[`backend/src/services/authService.js`](file:///home/devansh/Documents/GDG/backend/src/services/authService.js)<br>[`backend/src/middleware/auth.js`](file:///home/devansh/Documents/GDG/backend/src/middleware/auth.js) |
| **Event CRUD** | Full CRUD with validation (title 3-100, description 10-2000, future date, venue, capacity 1-10000, category). Admin-restricted. | ✅ Complete | [`backend/src/routes/eventRoutes.js`](file:///home/devansh/Documents/GDG/backend/src/routes/eventRoutes.js)<br>[`backend/src/services/eventService.js`](file:///home/devansh/Documents/GDG/backend/src/services/eventService.js)<br>[`backend/src/validators/eventValidators.js`](file:///home/devansh/Documents/GDG/backend/src/validators/eventValidators.js) |
| **Event Discovery & Filtering** | Public event listing with multi-param search (title, description, venue), category filter, date range, upcoming toggle, pagination | ✅ Complete | [`backend/src/services/eventService.js`](file:///home/devansh/Documents/GDG/backend/src/services/eventService.js) |
| **Capacity & Invariant Rules** | Dynamic `seatsLeft = capacity - registeredCount`. Preventing capacity reductions below existing registrations. | ✅ Complete | [`backend/src/services/eventService.js`](file:///home/devansh/Documents/GDG/backend/src/services/eventService.js#L140) |
| **Atomic Registrations** | Concurrency-safe atomic seat increments inside `prisma.$transaction`. Guaranteed duplicate and overbooking prevention. | ✅ Complete | [`backend/src/services/registrationService.js`](file:///home/devansh/Documents/GDG/backend/src/services/registrationService.js) |
| **Self-Service Cancellation** | Authenticated users can unregister from upcoming events with atomic seat restoration. Past events locked against cancellation. | ✅ Complete | [`backend/src/services/registrationService.js`](file:///home/devansh/Documents/GDG/backend/src/services/registrationService.js#L120) |
| **User Registrations View** | Users view registered events sorted upcoming first, then past | ✅ Complete | [`backend/src/services/registrationService.js`](file:///home/devansh/Documents/GDG/backend/src/services/registrationService.js#L160) |
| **Attendee Rosters (Admin)** | Administrators view full attendee roster (`name`, `email`, `registeredAt`) | ✅ Complete | [`backend/src/services/registrationService.js`](file:///home/devansh/Documents/GDG/backend/src/services/registrationService.js#L190) |
| **React Frontend SPA** | Responsive client app: Event browsing, debounced search, details, ticket booking, attendee portal, admin management | ✅ Complete | [`frontend/src/pages/`](file:///home/devansh/Documents/GDG/frontend/src/pages/)<br>[`frontend/src/components/`](file:///home/devansh/Documents/GDG/frontend/src/components/) |
| **Rate Limiting (Bonus)** | IP-based rate limiting on sensitive auth endpoints (15 req/15 min) | ✅ Complete | [`backend/src/middleware/rateLimiter.js`](file:///home/devansh/Documents/GDG/backend/src/middleware/rateLimiter.js) |
| **Docker Compose (Bonus)** | Multi-container setup orchestrating PostgreSQL 16, backend API, and Vite + Nginx frontend | ✅ Complete | [`docker-compose.yml`](file:///home/devansh/Documents/GDG/docker-compose.yml)<br>[`backend/Dockerfile`](file:///home/devansh/Documents/GDG/backend/Dockerfile)<br>[`frontend/Dockerfile`](file:///home/devansh/Documents/GDG/frontend/Dockerfile) |
| **QR Code Tickets (Bonus)** | Base64 QR code generation (`qrcode`), secure owner/admin access, print modal on frontend | ✅ Complete | [`backend/src/services/qrService.js`](file:///home/devansh/Documents/GDG/backend/src/services/qrService.js)<br>[`frontend/src/components/QrTicketModal.jsx`](file:///home/devansh/Documents/GDG/frontend/src/components/QrTicketModal.jsx) |
| **Admin Analytics (Bonus)** | Live computation of registered users, total bookings, unique attendees, upcoming events, top 5 fill rates, and domain breakdown | ✅ Complete | [`backend/src/services/analyticsService.js`](file:///home/devansh/Documents/GDG/backend/src/services/analyticsService.js)<br>[`frontend/src/pages/AdminPage.jsx`](file:///home/devansh/Documents/GDG/frontend/src/pages/AdminPage.jsx) |
| **Background Cron Job (Bonus)** | Hourly cron worker (`node-cron`) checking events starting within 24 hours, recording `remindedAt` for idempotency | ✅ Complete | [`backend/src/services/reminderService.js`](file:///home/devansh/Documents/GDG/backend/src/services/reminderService.js) |
| **Dark Theme (Bonus)** | Seamless dark/light neo-brutalist theme toggle persisted in `localStorage` | ✅ Complete | [`frontend/src/context/ThemeContext.jsx`](file:///home/devansh/Documents/GDG/frontend/src/context/ThemeContext.jsx)<br>[`frontend/src/styles/theme.css`](file:///home/devansh/Documents/GDG/frontend/src/styles/theme.css) |
| **OpenAPI / Swagger** | Complete interactive API documentation with `persistAuthorization: true` | ✅ Complete | [`backend/src/docs/swagger.json`](file:///home/devansh/Documents/GDG/backend/src/docs/swagger.json) |
| **Postman Collection** | Exported Postman collection covering all endpoints | ✅ Complete | [`backend/docs/postman_collection.json`](file:///home/devansh/Documents/GDG/backend/docs/postman_collection.json) |
| **Redis Caching** | Distributed in-memory caching | ❌ Not Implemented | *Deferred to Future Improvements* |

---

## 🔒 How Duplicate & Overbooking Prevention Works

Concurrency bugs like **overbooking** and **double-booking** typically happen due to the classic **Time-of-Check to Time-of-Use (TOCTOU)** race condition:

```text
[Request A] Reads capacity (99/100) -> Thinks seat is free
[Request B] Reads capacity (99/100) -> Thinks seat is free
[Request A] Inserts registration -> Sets count to 100
[Request B] Inserts registration -> Sets count to 101  <-- OVERBOOKED!
```

### The Solution: Multi-Layered Concurrency Safety

The platform eliminates race conditions entirely inside a single `prisma.$transaction`:

```text
Incoming Request -> ACID Transaction
                       ├── 1. Atomic Conditional UPDATE (registeredCount < capacity)
                       │      └── If 0 rows affected -> Abort with 409 EVENT_FULL
                       ├── 2. INSERT into Registration (userId, eventId)
                       │      └── Compound Unique Index rejects duplicate -> 409 ALREADY_REGISTERED
                       └── 3. If insert fails, Transaction Rolls Back Automatically!
```

1. **Atomic Conditional Update**:
   Instead of a vulnerable `SELECT` followed by `INSERT`, we execute an atomic SQL update with a row-level conditional check:
   ```javascript
   const seatClaimResult = await tx.event.updateMany({
     where: {
       id: eventId,
       dateTime: { gt: new Date() },
       registeredCount: { lt: tx.event.fields.capacity }, // Database-level condition
     },
     data: {
       registeredCount: { increment: 1 },
     },
   });
   ```
   Relational database engines acquire an exclusive row lock for `UPDATE`. If 20 simultaneous requests compete for the final seat, exactly **one** transaction claims the lock, increments the counter, and returns `count === 1`. The remaining 19 evaluate against the updated counter, fail the condition (`count < capacity`), and return `count === 0`, immediately returning **`409 EVENT_FULL`**.

2. **Database Compound Unique Index**:
   The `Registration` table enforces `@@unique([userId, eventId])`. If a user fires multiple simultaneous clicks, the database rejects the second insert with Prisma error code `P2002`, returning **`409 ALREADY_REGISTERED`**.

3. **Automatic Rollback**:
   Because both operations run within `prisma.$transaction`, if the unique constraint or any validation fails, the entire transaction rolls back, automatically undoing the counter increment.

### Verified Concurrency Test
The concurrency safety is validated by an automated test in [`backend/tests/concurrency.test.js`](file:///home/devansh/Documents/GDG/backend/tests/concurrency.test.js):
- Creates an event with a strict capacity of **5 seats**.
- Creates **20 unique user accounts**.
- Fires all **20 registration requests simultaneously** using `Promise.all`.
- **Result**: Exactly **5 succeed** with `201 Created`, exactly **15 receive `409 EVENT_FULL`**, and `registeredCount` in the database equals strictly **5**.

---

## 🏗️ Architecture

```mermaid
graph TD
    User([Client / Browser]) -->|HTTPS| Frontend[React SPA<br/>Vercel]
    Frontend -->|Axios REST API| Backend[Express.js API<br/>Render]
    
    subgraph Backend_Architecture [Backend Layered Architecture]
        Backend --> RateLimiter[Rate Limiter<br/>express-rate-limit]
        RateLimiter --> Router[Express Router]
        Router --> AuthMiddleware[Auth / RBAC Middleware<br/>JWT Verification]
        AuthMiddleware --> ZodValidator[Zod Input Validation]
        ZodValidator --> Controller[Controllers]
        Controller --> Service[Business Logic Services]
        Service --> Prisma[Prisma ORM Client]
        Service -.-> Cron[Hourly Reminder Cron<br/>node-cron]
        Service -.-> QR[QR Code Engine<br/>qrcode]
    end
    
    Prisma -->|Pooled TCP / SSL| DB[(PostgreSQL 16<br/>Neon Serverless)]
```

### Why This Stack?
- **React 18 & Vite**: Fast client-side rendering with instant HMR and optimized production bundles.
- **Node.js & Express 5**: Lightweight, event-driven async I/O ideal for high-throughput REST APIs.
- **Prisma ORM**: Declarative schema definition, end-to-end type safety, and database-level field references.
- **PostgreSQL (Neon)**: ACID transaction compliance, row-level write locks for concurrency, and serverless auto-scaling.
- **Zod**: Composable schema validation with fail-fast error formatting.
- **JWT & Bcrypt**: Stateless session verification with adaptive salted password hashing.

---

## 🗄️ Database Schema

The database schema is defined in [`backend/prisma/schema.prisma`](file:///home/devansh/Documents/GDG/backend/prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o{ Event : "creates (Admin)"
    User ||--o{ Registration : "makes"
    Event ||--o{ Registration : "receives"

    User {
        String id PK "UUID"
        String name
        String email UK
        String passwordHash
        Role role "USER | ADMIN"
        DateTime createdAt
    }

    Event {
        String id PK "UUID"
        String title
        String description
        DateTime dateTime "Indexed"
        String venue
        Int capacity
        String category "Indexed"
        Int registeredCount "Default: 0"
        String createdById FK
        DateTime createdAt
        DateTime updatedAt
    }

    Registration {
        String id PK "UUID"
        String userId FK "Cascade Delete"
        String eventId FK "Cascade Delete"
        DateTime createdAt
        DateTime remindedAt "Nullable (Cron)"
    }
```

### Key Schema Safeguards
- `@@unique([userId, eventId])`: Compound unique constraint preventing duplicate event registrations.
- `onDelete: Cascade`: Deleting an event or user automatically cleans up associated registrations without orphaned rows.
- `@@index([dateTime])` & `@@index([category])`: B-Tree indexes optimizing the most frequent filtering and sorting queries.

---

## 📡 API Endpoints

Interactive documentation with runnable requests is hosted live at **[https://gdg-oz97.onrender.com/api/docs](https://gdg-oz97.onrender.com/api/docs)**.

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :---: | :---: | :--- |
| **System** | | | | |
| `GET` | `/api/health` | None | Public | Health status, uptime, timestamp, environment |
| `GET` | `/api/docs` | None | Public | Interactive Swagger / OpenAPI documentation UI |
| **Authentication** | | | | |
| `POST` | `/api/auth/register` | None | Public | Register new user (`name`, `email`, `password`). Always assigns `USER` role. Rate-limited. |
| `POST` | `/api/auth/login` | None | Public | Authenticate user; returns JWT token + user profile. Rate-limited. |
| `GET` | `/api/auth/me` | Bearer | All | Fetch authenticated user profile |
| **Event Discovery** | | | | |
| `GET` | `/api/events` | None | Public | List events (`search`, `category`, `from`, `to`, `upcoming`, `sort`, `page`, `limit`) |
| `GET` | `/api/events/categories` | None | Public | List distinct categories from published events |
| `GET` | `/api/events/:id` | Optional | Public / User | Event details + `seatsLeft`. If logged in, includes `isRegistered: boolean` |
| **Event Administration** | | | | |
| `POST` | `/api/events` | Bearer | Admin | Create event (`title`, `description`, `dateTime`, `venue`, `capacity`, `category`) |
| `PUT` | `/api/events/:id` | Bearer | Admin | Update event details. Rejects setting `capacity < registeredCount`. |
| `DELETE`| `/api/events/:id` | Bearer | Admin | Cascade delete event and associated attendee registrations |
| `GET` | `/api/events/:id/registrations`| Bearer | Admin | View attendee roster (`name`, `email`, `registeredAt`) |
| **Registrations & Tickets** | | | | |
| `POST` | `/api/events/:id/register` | Bearer | User | Concurrency-safe atomic event booking |
| `DELETE`| `/api/events/:id/register` | Bearer | User | Cancel registration and restore seat count (blocked on past events) |
| `GET` | `/api/users/me/registrations` | Bearer | User | List user's registered events (upcoming first, then past) |
| `GET` | `/api/registrations/:id/qr` | Bearer | Owner/Admin | Generate base64 Data URL QR ticket for event admission |
| **Analytics** | | | | |
| `GET` | `/api/admin/analytics` | Bearer | Admin | Real-time platform metrics (totals, unique attendees, top fill rates, category distribution) |

---

## ⚠️ Error Codes

All errors return a predictable JSON envelope with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": {
    "code": "EVENT_FULL",
    "message": "This event is fully booked",
    "details": null
  }
}
```

| HTTP Status | Error Code | Trigger Condition |
| :---: | :--- | :--- |
| **400** | `INVALID_ID` | Malformed or missing UUID parameter |
| **400** | `INVALID_JSON` | Malformed JSON payload in HTTP request body |
| **400** | `EVENT_ALREADY_STARTED` | Attempting to register or unregister for an event in the past |
| **401** | `UNAUTHORIZED` | Missing `Authorization: Bearer <TOKEN>` header |
| **401** | `INVALID_TOKEN` | Malformed, forged, or invalid JWT signature |
| **401** | `TOKEN_EXPIRED` | Expired authentication token |
| **403** | `FORBIDDEN` | Authenticated user lacks required permission / role |
| **404** | `EVENT_NOT_FOUND` | Event ID does not exist in the database |
| **404** | `NOT_REGISTERED` | Attempting to unregister from an event not booked by the user |
| **404** | `ROUTE_NOT_FOUND` | Requested HTTP path does not exist on the server |
| **409** | `EMAIL_EXISTS` | Registration attempt with an email that is already registered |
| **409** | `ALREADY_REGISTERED` | User is already registered for this event (duplicate violation) |
| **409** | `EVENT_FULL` | Event has reached maximum capacity (`registeredCount == capacity`) |
| **409** | `CAPACITY_TOO_LOW` | Admin attempted to lower capacity below current registered attendees |
| **422** | `VALIDATION_ERROR` | Request payload failed Zod schema validation (field-level details included) |
| **429** | `TOO_MANY_REQUESTS` | Rate limit threshold exceeded on `/api/auth/*` (15 requests per 15 minutes) |
| **500** | `INTERNAL_SERVER_ERROR`| Unhandled server exception (stack traces hidden from production clients) |

---

## 🛡️ Security

- **Password Hashing**: Passwords hashed with `bcrypt` using 10 salt rounds before storage.
- **Timing-Safe Auth**: Login failures return generic `"Invalid email or password"` error messages for non-existent emails and wrong passwords alike to prevent user enumeration attacks.
- **Stateless Tokens**: JWTs signed with `HS256`, strictly validated per request, expiring in 7 days.
- **Role-Based Access Control**: Route-level `authorize('ADMIN')` guards enforce privileges. Client-side attempts to escalate role during registration are ignored (role is explicitly forced to `USER`).
- **HTTP Security Headers**: Powered by `helmet` to set secure response headers (HSTS, X-Content-Type-Options, Frameguard).
- **CORS Protection**: Cross-Origin requests restricted to authorized frontend domains via `CLIENT_URL`.
- **Brute-Force Rate Limiting**: Auth endpoints protected by `express-rate-limit` (15 requests per 15-minute window).
- **Strict Input Validation**: All inputs parsed and sanitized with `zod` schemas before touching controllers.
- **Zero Information Leakage**: Centralized error middleware masks internal database errors from API clients.

---

## 💻 Run Locally

### Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x+)
- *(Optional)* Docker Desktop (if using Docker)

### Option 1: Standard npm Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/devansh2007-ruikar/GDG.git
cd GDG
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run database migrations and seed sample data
npx prisma migrate dev
node prisma/seed.js

# Start backend server in development mode (Port 5000)
npm run dev
```

#### 3. Frontend Setup
In a separate terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start Vite development server (Port 5173)
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Option 2: One-Command Docker Setup

Requires Docker Desktop or Docker Engine + Docker Compose:

```bash
docker compose up --build
```

Services will be immediately accessible at:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

### Environment Variables Reference

#### Backend (`backend/.env`)

| Variable | Default Value | Required | Description |
| :--- | :--- | :---: | :--- |
| `PORT` | `5000` | No | Port for the Express server (set automatically on Render) |
| `DATABASE_URL` | *See `.env.example`* | Yes | PostgreSQL connection string (`postgresql://user:pass@host:5432/db?sslmode=require`) |
| `JWT_SECRET` | *Random 32-char string* | Yes | Secret key used to sign and verify JWT authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | No | Expiration duration for issued JWT tokens |
| `CLIENT_URL` | `http://localhost:5173` | Yes | Allowed frontend origin for CORS (supports comma-separated URLs) |
| `NODE_ENV` | `development` | No | Application environment (`development`, `production`, `test`) |

#### Frontend (`frontend/.env`)

| Variable | Default Value | Required | Description |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | `http://localhost:5000/api` | Yes | Base URL for the backend API consumed by Axios |

---

## 🧪 Running Tests

The test suite is built with **Jest** and **Supertest**, executing against an isolated test database with automated setup, seeding, and teardown:

```bash
cd backend
npm test
```

### Test Suite Summary (52 Tests, 7 Suites — 100% Passing)

- `tests/auth.test.js`: User registration, role escalation rejection, duplicate email handling, login validation, protected routes, and RBAC authorization.
- `tests/events.test.js`: Event discovery, multi-parameter search, category filter, pagination, single event view, admin create/update/delete, and capacity invariant enforcement.
- `tests/registrations.test.js`: Authentication requirement, past-event rejection, registration success, duplicate registration rejection, capacity bounds, self-service cancellation, user registration history, and admin attendee rosters.
- `tests/concurrency.test.js`: High-concurrency race simulation (20 simultaneous users competing for 5 seats -> exactly 5 succeed, 15 get `409 EVENT_FULL`, DB count = 5).
- `tests/bonus.test.js`: Scannable QR code tickets, admin platform analytics calculation, and hourly cron reminder dispatch with idempotency checking.
- `tests/health.test.js`: Health endpoint response and unmatched route 404 handler.
- `tests/rateLimiter.test.js`: Rate limiter threshold enforcement on authentication endpoints.

---

## 🚀 Deployment

- **Database**: PostgreSQL hosted on [Neon](https://neon.tech) (serverless PostgreSQL with connection pooling and SSL encryption).
- **Backend**: Hosted on [Render](https://render.com) as a Web Service. The start command runs `prisma migrate deploy && node src/server.js`, automatically applying any pending database migrations before starting the Express server.
- **Frontend**: Hosted on [Vercel](https://vercel.com) as a Vite single-page application. Configured with [`frontend/vercel.json`](file:///home/devansh/Documents/GDG/frontend/vercel.json) client-side rewrites (`/(.*) -> /index.html`) so refreshing direct sub-routes (such as `/events/:id` or `/my-registrations`) does not result in 404 errors.

---

## 📁 Project Structure

```text
GDG/
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Version-controlled PostgreSQL migrations
│   │   ├── schema.prisma           # Prisma data models, relations, and indexes
│   │   └── seed.js                 # Database seeder (Admin, Users, Sample Events)
│   ├── src/
│   │   ├── config/                 # Environment variables and Prisma client
│   │   ├── controllers/            # Request handlers (auth, events, registrations, admin)
│   │   ├── docs/                   # OpenAPI 3.0 swagger.json & Postman collection
│   │   ├── middleware/             # Auth, RBAC, error handling, rate limiting, validation
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # Core business logic (auth, events, registration, analytics, reminders, QR)
│   │   ├── utils/                  # AppError class and custom utilities
│   │   ├── validators/             # Zod input validation schemas
│   │   ├── app.js                  # Express application setup, security, and routes
│   │   └── server.js               # Server entry point and cron scheduler initialization
│   ├── tests/                      # Jest & Supertest automated test suites
│   ├── Dockerfile                  # Production Docker container definition for backend
│   └── package.json
├── frontend/
│   ├── public/                     # Static assets and favicon
│   ├── src/
│   │   ├── assets/                 # Icons and image assets
│   │   ├── components/             # Reusable UI components (EventCard, Navbar, Modals)
│   │   ├── context/                # React Contexts (AuthContext, ThemeContext, ToastContext)
│   │   ├── pages/                  # Page views (EventsPage, EventDetailPage, MyRegistrations, Admin, Login, Signup)
│   │   ├── services/               # Axios API instance with JWT interceptor
│   │   ├── styles/                 # Theme tokens (theme.css) and Neo-brutalist system
│   │   ├── App.jsx                 # Route definitions and layout
│   │   ├── index.css               # Global typography & layout rules
│   │   └── main.jsx                # Application root
│   ├── Dockerfile                  # Multi-stage production build container
│   ├── nginx.conf                  # Nginx production reverse proxy config
│   ├── vercel.json                 # Vercel client-side routing rewrite rules
│   └── package.json
├── docs/
│   └── screenshots/                # Application UI screenshots
│       └── .gitkeep
├── docker-compose.yml              # Local multi-service orchestration
├── .gitignore                      # Git ignore rules (secrets, databases, node_modules)
├── LICENSE                         # MIT License
└── README.md                       # Comprehensive platform documentation
```

---

## 📸 Screenshots

| View | Screenshot |
| :--- | :--- |
| **Events Discovery** | ![Events View](docs/screenshots/events.png)<br>*(Browse events with real-time seat availability and multi-param filters)* |
| **Event Details & Booking** | ![Event Details](docs/screenshots/event-details.png)<br>*(Comprehensive event details, status indicators, and one-click booking)* |
| **My Registrations & QR Passes** | ![My Registrations](docs/screenshots/my-registrations.png)<br>*(Attendee portal with digital admission QR code modals)* |
| **Admin Command Center** | ![Admin Dashboard](docs/screenshots/admin-dashboard.png)<br>*(Live metrics, fill-rate rankings, category breakdown, and event directory)* |
| **Interactive Swagger Docs** | ![Swagger UI](docs/screenshots/swagger.png)<br>*(Interactive OpenAPI 3.0 testing interface with persistent Bearer authorization)* |

---

## 🔮 Future Improvements

Features intentionally planned for subsequent iterations:
- **Google OAuth 2.0 Integration**: One-click Google sign-in for seamless campus authentication.
- **Email Dispatching**: Transactional booking confirmation emails and calendar `.ics` attachments via SendGrid / Resend.
- **Distributed In-Memory Caching (Redis)**: Redis caching on high-frequency public endpoints (`/api/events`, `/api/events/categories`) with cache invalidation on admin mutations.
- **WebSockets / Server-Sent Events (SSE)**: Real-time live seat counter broadcast to clients without polling.
- **Waitlist Queue**: Automated promotion from waitlist to confirmed registration when a seat is cancelled.

---

## 👨‍💻 Author

**Devansh Ruikar**
- GitHub: [@devansh2007-ruikar](https://github.com/devansh2007-ruikar)
- Developed for the **Google Developer Groups (GDG) RBU Recruitment 2026-27** (Web Development - Backend Track).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
