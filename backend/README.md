# JobNest Backend API

Production-ready backend for JobNest - A job matching platform connecting job seekers with employers based on skills, preferences, and cultural fit.

## 🏗️ Architecture

**Stack:** MongoDB + Express.js + Node.js + Socket.IO (MERN with Real-time)

**Pattern:** Layered Architecture
- Routes → Controllers → Services → Repositories → Models

## 📦 Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── gridfs.js               # GridFS initialization
│   │   └── multer.js               # File upload configuration
│   ├── controllers/                # Request handlers
│   │   ├── auth.controller.js
│   │   └── file.controller.js
│   ├── services/                   # Business logic
│   │   ├── auth.service.js
│   │   └── file.service.js
│   ├── repositories/               # Database operations
│   │   ├── user.repository.js
│   │   ├── jobseeker.repository.js
│   │   ├── employer.repository.js
│   │   ├── job.repository.js
│   │   ├── application.repository.js
│   │   ├── assessment.repository.js
│   │   ├── connection.repository.js
│   │   ├── message.repository.js
│   │   └── notification.repository.js
│   ├── models/                     # Mongoose schemas
│   │   ├── user.js
│   │   ├── jobSeekerProfile.js
│   │   ├── employerProfile.js
│   │   ├── job.js
│   │   ├── application.js
│   │   ├── assessment.js
│   │   ├── connections.js
│   │   ├── message.js
│   │   └── notification.js
│   ├── routes/                     # API routes
│   │   ├── auth.routes.js
│   │   └── file.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── validateRequest.middleware.js
│   │   ├── upload.middleware.js    # File upload handlers
│   │   └── errorHandler.middleware.js
│   ├── validators/                 # Request validation (Joi)
│   │   └── auth.validator.js
│   ├── utils/
│   │   ├── jwt.util.js             # JWT helpers
│   │   └── response.util.js        # Response formatters
│   ├── sockets/
│   │   └── socket.handler.js       # Socket.IO events
│   └── uploads/                    # Temp upload directory
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Using MongoDB locally
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Run the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:4000`

## 📚 API Documentation

### Authentication APIs

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "jobseeker" // or "employer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "...",
    "role": "jobseeker",
    "accessToken": "..."
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

### File Management APIs

All file endpoints require authentication via Bearer token.

#### Download File
```http
GET /api/files/:fileId/download
Authorization: Bearer <accessToken>
```

#### View File (Inline)
```http
GET /api/files/:fileId/view
Authorization: Bearer <accessToken>
```

#### Get File Info
```http
GET /api/files/:fileId/info
Authorization: Bearer <accessToken>
```

#### Delete File
```http
DELETE /api/files/:fileId
Authorization: Bearer <accessToken>
```

#### Get User's Files
```http
GET /api/files/my-files
Authorization: Bearer <accessToken>
```

## 🔐 Authentication

The API uses JWT-based authentication:

- **Access Token:** Used for API requests (configurable expiration, default 1 day)

Include access token in requests:
```
Authorization: Bearer <accessToken>
```

## 🗄️ Database Models

### User
- Unified authentication table for all user types
- Roles: `jobseeker`, `employer`, `admin`
- Links to profile tables via `jobSeekerProfileId` or `employerProfileId`

### JobSeekerProfile
- Skills, experience, preferences
- Resume, cover letter, profile photo (GridFS references)
- Salary expectations, preferred locations, job types

### EmployerProfile
- Company information, culture, values
- Company logo, office images (GridFS references)
- Hiring roles, skill categories

### Job
- Job postings created by employers
- Required skills, salary range, location
- Full-text search enabled

### Application
- Job applications with status tracking
- Prevents duplicate applications (unique index)
- Status: applied, viewed, shortlisted, rejected, accepted, withdrawn

### Assessment
- Personality assessment questions and answers
- Scoring and report generation
- Links to job seeker profile

### Connection
- LinkedIn-style connection requests
- Status: pending, accepted, rejected, blocked
- Prevents duplicate requests

### Message
- Real-time chat messages
- Conversation tracking
- Read status, attachments

### Notification
- User notifications
- Types: new_message, connection_request, connection_accept, job_match, application_status

## 📁 File Storage (GridFS)

Files are stored in MongoDB using GridFS:
- **Collections:** `uploads.files` (metadata), `uploads.chunks` (binary data)
- **Supported formats:**
  - Images: JPEG, PNG (max 2MB)
  - Documents: PDF, DOC, DOCX, TXT (max 5MB)

File references stored in models as ObjectIds.

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_conversation` | `{ conversationId }` | Join conversation room |
| `send_message` | `{ receiverId, text, ... }` | Send message |
| `typing_start` | `{ receiverId }` | Start typing indicator |
| `typing_stop` | `{ receiverId }` | Stop typing indicator |
| `mark_read` | `{ messageId, senderId }` | Mark message as read |
| `send_connection_request` | `{ receiverId }` | Send connection request |
| `accept_connection` | `{ senderId }` | Accept connection |
| `check_online` | `{ userId }` | Check user online status |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `{ senderId, text, ... }` | New message received |
| `message_sent` | `{ success, message }` | Message delivery confirmation |
| `user_typing` | `{ userId, isTyping }` | Typing indicator |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `connection_request` | `{ senderId, timestamp }` | New connection request |
| `connection_accepted` | `{ acceptedBy, timestamp }` | Connection accepted |
| `application_received` | `{ jobId, applicationId, ... }` | New job application |
| `message_read` | `{ messageId, readBy, readAt }` | Message was read |

### Socket Authentication

Socket connections require JWT token:
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: accessToken }
});
```

## 🛡️ Security Features

- ✅ JWT with token rotation
- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Rate limiting (20 req/min on auth endpoints)
- ✅ Helmet.js for HTTP security headers
- ✅ CORS configuration
- ✅ Input validation (Joi)
- ✅ Role-based access control (RBAC)
- ✅ File type and size validation
- ✅ MongoDB injection prevention
- ✅ Global error handling

## 🔧 Configuration

### Environment Variables

See `.env.example` for all configuration options.

**Key settings:**
- `NODE_ENV`: development | production
- `PORT`: Server port (default: 4000)
- `MONGO_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `FRONTEND_ORIGIN`: CORS origin

## 📊 Repository Layer

All database operations are abstracted into repository functions:

```javascript
// Example: User Repository
import { findUserById } from '../repositories/user.repository.js';

const user = await findUserById(userId);
```

**Benefits:**
- Centralized query logic
- Easy to test and mock
- Consistent data access patterns
- Performance optimization (lean queries)

## 🎯 Next Steps

**Immediate priorities:**
1. ✅ Repository layer - COMPLETED
2. ✅ File upload service (GridFS) - COMPLETED
3. 🔨 Job seeker profile APIs
4. 🔨 Employer profile APIs
5. 🔨 Assessment system
6. 🔨 Job posting & matching APIs
7. 🔨 Application management
8. 🔨 Connections & messaging APIs
9. 🔨 Notification system
10. 🔨 Email service integration

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Code Style

- ESLint configuration included
- Prettier for code formatting
- Use ES6+ modules
- Async/await for async operations
- Comprehensive error handling

## 🐛 Error Handling

All errors are handled by global error handler middleware:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors
}
```

## 📈 Performance Optimization

- Database indexes on frequently queried fields
- Lean queries for read operations
- Connection pooling (MongoDB)
- Query pagination
- File streaming for large files
- GridFS for efficient file storage

## 🔄 Database Indexes

```javascript
// User
{ email: 1 }
{ role: 1 }

// Job
{ requiredSkills: 1 }
{ location: 1 }
{ searchableText: "text" }

// Application
{ jobId: 1, jobSeekerId: 1 } // unique

// Connection
{ senderId: 1, receiverId: 1 } // unique

// Message
{ conversationId: 1 }

// RefreshToken
{ token: 1 }
{ expiresAt: 1 } // TTL index
```

## 🚀 Deployment

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS origin
- [ ] Set up MongoDB replica set
- [ ] Enable MongoDB authentication
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Enable backups

## 📞 Support

For issues or questions, refer to the comprehensive system design document in the project.

## 📄 License

ISC

---

**Built with ❤️ for JobNest**
