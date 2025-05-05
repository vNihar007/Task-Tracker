# Task Tracker

A RESTful API for managing tasks and tracking their progress, built with Node.js, Express, PostgreSQL, and Prisma ORM.

## Features

- Create, read, update, and delete tasks
- Mark tasks as completed/incomplete
- Filter tasks by status, priority, or due date
- User authentication and authorization
- Task categorization and tagging

## Tech Stack

- **Backend**: Node.js, Express.js 
- **Database**: PostgreSQL (running in Podman container)
- **ORM**: Prisma
- **Authentication**: JWT

## Prerequisites

- Node.js v16+
- Podman (or Docker)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vNihar007/Task-Tracker.git
cd Task-Tracker
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up PostgreSQL using Podman

```bash
# Pull PostgreSQL image
podman pull postgres:latest

# Create and run PostgreSQL container
podman run --name task-tracker-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tasktracker -p 5432:5432 -d postgres
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tasktracker?schema=public"
JWT_SECRET="your-super-secret-key"
PORT=3000
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 6. Start the development server

```bash
npm run dev
# or
yarn dev
```

The server will start on `http://localhost:3000`

## Database Schema

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED
  priority    String    @default("MEDIUM")  // LOW, MEDIUM, HIGH
  dueDate     DateTime?
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  tags        Tag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  tasks     Task[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /api/auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tasks

#### Create a new task

```
POST /api/tasks
```

Request header:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "title": "Implement authentication",
  "description": "Add JWT authentication to the API",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2025-05-15T00:00:00.000Z",
  "tags": ["backend", "security"]
}
```

Response:
```json
{
  "id": 1,
  "title": "Implement authentication",
  "description": "Add JWT authentication to the API",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2025-05-15T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2025-05-05T12:34:56.789Z",
  "updatedAt": "2025-05-05T12:34:56.789Z",
  "tags": [
    { "id": 1, "name": "backend" },
    { "id": 2, "name": "security" }
  ]
}
```

#### Get all tasks

```
GET /api/tasks
```

Request header:
```
Authorization: Bearer <token>
```

Query parameters:
- `status`: Filter by status (PENDING, IN_PROGRESS, COMPLETED)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH)
- `dueDate`: Filter by due date
- `tag`: Filter by tag name

Response:
```json
[
  {
    "id": 1,
    "title": "Implement authentication",
    "description": "Add JWT authentication to the API",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "dueDate": "2025-05-15T00:00:00.000Z",
    "userId": 1,
    "createdAt": "2025-05-05T12:34:56.789Z",
    "updatedAt": "2025-05-05T12:34:56.789Z",
    "tags": [
      { "id": 1, "name": "backend" },
      { "id": 2, "name": "security" }
    ]
  },
  // ... more tasks
]
```

#### Get a specific task

```
GET /api/tasks/:id
```

Request header:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "id": 1,
  "title": "Implement authentication",
  "description": "Add JWT authentication to the API",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2025-05-15T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2025-05-05T12:34:56.789Z",
  "updatedAt": "2025-05-05T12:34:56.789Z",
  "tags": [
    { "id": 1, "name": "backend" },
    { "id": 2, "name": "security" }
  ]
}
```

#### Update a task

```
PUT /api/tasks/:id
```

Request header:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "title": "Implement JWT authentication",
  "status": "COMPLETED",
  "tags": ["backend", "security", "authentication"]
}
```

Response:
```json
{
  "id": 1,
  "title": "Implement JWT authentication",
  "description": "Add JWT authentication to the API",
  "priority": "HIGH",
  "status": "COMPLETED",
  "dueDate": "2025-05-15T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2025-05-05T12:34:56.789Z",
  "updatedAt": "2025-05-05T13:00:00.000Z",
  "tags": [
    { "id": 1, "name": "backend" },
    { "id": 2, "name": "security" },
    { "id": 3, "name": "authentication" }
  ]
}
```

#### Delete a task

```
DELETE /api/tasks/:id
```

Request header:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Task deleted successfully"
}
```

### Tags

#### Get all tags

```
GET /api/tags
```

Request header:
```
Authorization: Bearer <token>
```

Response:
```json
[
  { "id": 1, "name": "backend" },
  { "id": 2, "name": "security" },
  { "id": 3, "name": "authentication" }
]
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response example:

```json
{
  "error": "Task not found",
  "statusCode": 404
}
```

## Deployment

### Build for production

```bash
npm run build
# or
yarn build
```

### Start production server

```bash
npm start
# or
yarn start
```

## License

MIT
