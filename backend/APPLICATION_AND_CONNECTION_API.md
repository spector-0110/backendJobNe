# Application & Connection API Documentation

Complete guide for the Job Application Management System and LinkedIn-style Connection/Networking APIs.

---

## Table of Contents
1. [Application Management APIs](#application-management-apis)
2. [Connection/Networking APIs](#connection-networking-apis)
3. [Real-time Notifications](#real-time-notifications)
4. [Testing Workflows](#testing-workflows)

---

## Application Management APIs

### Overview
Job seekers can apply for jobs, track application status, and withdraw applications. Employers can view, manage, and update application statuses.

**Assessment Requirement:** Job seekers MUST complete personality assessment before applying for jobs.

### Application Status Flow
```
applied → viewed → shortlisted → accepted/rejected
                              ↓
                          withdrawn (by job seeker)
```

---

### Application Endpoints

#### 1. Apply for Job (Job Seeker)
```http
POST /api/applications/apply
Authorization: Bearer <accessToken>
Role: jobseeker
Content-Type: application/json

{
  "jobId": "673a5f8e2c1d4a5b6c7d8e9f",
  "coverLetter": "I am excited to apply for this position because..."
}
```

**Requirements:**
- ✅ Job seeker profile must exist
- ✅ Personality assessment must be completed
- ✅ Job must exist and be active
- ✅ Cannot apply twice to same job

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "...",
    "jobSeekerId": {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "jobId": {
      "_id": "...",
      "title": "Senior Full Stack Developer",
      "employerId": {...}
    },
    "employerId": "...",
    "status": "applied",
    "coverLetter": "I am excited to apply...",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Error Cases:**
- `403 ASSESSMENT_REQUIRED` - Assessment not started
- `403 ASSESSMENT_INCOMPLETE` - Assessment not completed
- `404` - Job not found or profile not found
- `400 DUPLICATE_APPLICATION` - Already applied
- `400` - Job is no longer active

**Real-time Notification:**
- Employer receives `notification` event via Socket.IO with type `new_application`

---

#### 2. Get My Applications (Job Seeker)
```http
GET /api/applications/my?status=applied&page=1&limit=20
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Query Parameters:**
- `status` - Filter by status (applied, viewed, shortlisted, accepted, rejected, withdrawn)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "applications": [
      {
        "_id": "...",
        "jobId": {
          "title": "Senior Full Stack Developer",
          "company": "Tech Corp",
          "location": "Remote"
        },
        "status": "viewed",
        "coverLetter": "...",
        "createdAt": "2025-11-23T10:00:00.000Z"
      }
    ],
    "count": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### 3. Withdraw Application (Job Seeker)
```http
PUT /api/applications/:id/withdraw
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Rules:**
- Cannot withdraw if status is `accepted` or `rejected`
- Only application owner can withdraw

**Response:**
```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "_id": "...",
    "status": "withdrawn",
    "updatedAt": "2025-11-23T11:00:00.000Z"
  }
}
```

**Error Cases:**
- `403` - Not your application
- `400` - Cannot withdraw (already accepted/rejected)

---

#### 4. Get Applications for Employer
```http
GET /api/applications/employer?jobId=673a5f8e2c1d4a5b6c7d8e9f&status=shortlisted&page=1
Authorization: Bearer <accessToken>
Role: employer
```

**Query Parameters:**
- `jobId` - Filter by specific job (optional)
- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "applications": [
      {
        "_id": "...",
        "jobSeekerId": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "skills": ["JavaScript", "React", "Node.js"],
          "experience": "5 years"
        },
        "jobId": {
          "title": "Senior Full Stack Developer"
        },
        "status": "shortlisted",
        "coverLetter": "...",
        "createdAt": "2025-11-23T10:00:00.000Z"
      }
    ],
    "count": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Error Cases:**
- `403` - Job doesn't belong to you

---

#### 5. Update Application Status (Employer)
```http
PUT /api/applications/:id/status
Authorization: Bearer <accessToken>
Role: employer
Content-Type: application/json

{
  "status": "shortlisted"
}
```

**Valid Statuses:**
- `viewed` - Employer has viewed the application
- `shortlisted` - Candidate shortlisted for interview
- `rejected` - Application rejected
- `accepted` - Candidate hired

**Rules:**
- Only employer who owns the job can update
- Cannot update withdrawn applications

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "...",
    "status": "shortlisted",
    "updatedAt": "2025-11-23T11:00:00.000Z"
  }
}
```

**Real-time Notification:**
- Job seeker receives `notification` event via Socket.IO with type `application_status`

**Status Messages Sent:**
- `viewed` → "Your application has been viewed"
- `shortlisted` → "Congratulations! You've been shortlisted"
- `accepted` → "Congratulations! Your application has been accepted"
- `rejected` → "Your application status has been updated"

---

#### 6. Get Application by ID
```http
GET /api/applications/:id
Authorization: Bearer <accessToken>
```

Accessible by both job seeker (owner) and employer (job owner).

**Auto-marking:** When employer views an application with status `applied`, it's automatically marked as `viewed`.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "_id": "...",
    "jobSeekerId": {...},
    "jobId": {...},
    "status": "viewed",
    "coverLetter": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### 7. Get Application Statistics (Job Seeker)
```http
GET /api/applications/stats/me
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "stats": {
      "total": 25,
      "applied": 5,
      "viewed": 10,
      "shortlisted": 6,
      "accepted": 2,
      "rejected": 1,
      "withdrawn": 1
    }
  }
}
```

---

#### 8. Get Application Statistics (Employer)
```http
GET /api/applications/stats/employer?jobId=673a5f8e2c1d4a5b6c7d8e9f
Authorization: Bearer <accessToken>
Role: employer
```

**Query Parameters:**
- `jobId` - Filter by specific job (optional)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "stats": {
      "total": 45,
      "applied": 15,
      "viewed": 20,
      "shortlisted": 8,
      "accepted": 1,
      "rejected": 1,
      "withdrawn": 0
    }
  }
}
```

---

#### 9. Delete Application (Job Seeker)
```http
DELETE /api/applications/:id
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Rules:**
- Can only delete your own applications
- Can only delete `withdrawn` or `rejected` applications

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully",
  "data": {
    "message": "Application deleted successfully"
  }
}
```

---

## Connection/Networking APIs

### Overview
LinkedIn-style networking system where users can:
- Send connection requests
- Accept/reject requests
- Remove connections
- Block/unblock users
- View connection statistics

**Real-time:** Receiver gets instant Socket.IO notification when someone sends a connection request.

### Connection Status Flow
```
pending → accepted → (can be removed)
       ↓
    rejected (can resend later)
    
blocked (prevents all interactions)
```

---

### Connection Endpoints

#### 1. Send Connection Request
```http
POST /api/connections/request
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "receiverId": "673a5f8e2c1d4a5b6c7d8e9f",
  "message": "I'd like to connect with you. We share similar interests in..."
}
```

**Rules:**
- Cannot connect to yourself
- Cannot send duplicate requests
- Can resend after rejection
- Receiver must exist

**Response:**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "_id": "...",
    "senderId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "jobseeker"
    },
    "receiverId": {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "employer"
    },
    "status": "pending",
    "message": "I'd like to connect with you...",
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

**Real-time Notification:**
- Receiver gets `notification` event with type `connection_request`:
  ```json
  {
    "type": "connection_request",
    "notification": {
      "type": "connection_request",
      "title": "New Connection Request",
      "message": "John Doe sent you a connection request"
    },
    "connection": {...}
  }
  ```

**Error Cases:**
- `400` - Cannot connect to yourself
- `400` - Already connected
- `400` - Request already sent
- `403` - User is blocked
- `404` - User not found

---

#### 2. Accept Connection Request
```http
PUT /api/connections/:id/accept
Authorization: Bearer <accessToken>
```

**Rules:**
- Only receiver can accept
- Must be in `pending` status

**Response:**
```json
{
  "success": true,
  "message": "Connection request accepted successfully",
  "data": {
    "_id": "...",
    "status": "accepted",
    "updatedAt": "2025-11-23T10:30:00.000Z"
  }
}
```

**Real-time Notification:**
- Sender gets `notification` event with type `connection_accept`:
  ```json
  {
    "type": "connection_accept",
    "notification": {
      "type": "connection_accept",
      "title": "Connection Accepted",
      "message": "Jane Smith accepted your connection request"
    }
  }
  ```

---

#### 3. Reject Connection Request
```http
PUT /api/connections/:id/reject
Authorization: Bearer <accessToken>
```

**Rules:**
- Only receiver can reject
- Must be in `pending` status

**Response:**
```json
{
  "success": true,
  "message": "Connection request rejected",
  "data": {
    "_id": "...",
    "status": "rejected",
    "updatedAt": "2025-11-23T10:35:00.000Z"
  }
}
```

---

#### 4. Get My Connections
```http
GET /api/connections/my?status=accepted&page=1&limit=50
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `status` - Filter by status (default: accepted)
- `page` - Page number
- `limit` - Results per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "connections": [
      {
        "_id": "...",
        "user": {
          "_id": "...",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "role": "employer"
        },
        "status": "accepted",
        "message": "...",
        "createdAt": "2025-11-20T10:00:00.000Z"
      }
    ],
    "count": 42,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

#### 5. Get Pending Connection Requests (Received)
```http
GET /api/connections/requests/pending?page=1&limit=20
Authorization: Bearer <accessToken>
```

Shows connection requests you've received that are pending.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "requests": [
      {
        "_id": "...",
        "senderId": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "receiverId": "...",
        "status": "pending",
        "message": "I'd like to connect...",
        "createdAt": "2025-11-23T09:00:00.000Z"
      }
    ],
    "count": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### 6. Get Sent Connection Requests
```http
GET /api/connections/requests/sent?page=1&limit=20
Authorization: Bearer <accessToken>
```

Shows connection requests you've sent that are pending.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "requests": [
      {
        "_id": "...",
        "senderId": "...",
        "receiverId": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "status": "pending",
        "message": "...",
        "createdAt": "2025-11-23T08:00:00.000Z"
      }
    ],
    "count": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### 7. Remove Connection
```http
DELETE /api/connections/:id
Authorization: Bearer <accessToken>
```

**Rules:**
- Must be part of the connection (sender or receiver)
- Can only remove `accepted` connections

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "Connection removed successfully"
  }
}
```

---

#### 8. Block User
```http
POST /api/connections/block
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "targetUserId": "673a5f8e2c1d4a5b6c7d8e9f"
}
```

**Effect:**
- Blocks all future connection requests
- Updates existing connection to `blocked` status
- User cannot send you messages or connection requests

**Response:**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "_id": "...",
    "status": "blocked",
    "updatedAt": "2025-11-23T11:00:00.000Z"
  }
}
```

---

#### 9. Unblock User
```http
PUT /api/connections/:id/unblock
Authorization: Bearer <accessToken>
```

**Rules:**
- Only the user who blocked can unblock
- Connection must be in `blocked` status

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "message": "User unblocked successfully"
  }
}
```

---

#### 10. Get Blocked Users
```http
GET /api/connections/blocked?page=1&limit=20
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "blockedUsers": [
      {
        "_id": "...",
        "receiverId": {
          "name": "Blocked User",
          "email": "blocked@example.com"
        },
        "status": "blocked",
        "createdAt": "2025-11-22T10:00:00.000Z"
      }
    ],
    "count": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### 11. Get Connection Statistics
```http
GET /api/connections/stats
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "stats": {
      "total": 42,
      "accepted": 42,
      "pending": 5,
      "blocked": 2,
      "rejected": 1
    }
  }
}
```

---

## Real-time Notifications

### Socket.IO Events

Both Application and Connection systems emit real-time notifications to users.

#### Event: `notification`

**Connection Request:**
```javascript
socket.on('notification', (data) => {
  // data = {
  //   type: 'connection_request',
  //   notification: {
  //     userId: '...',
  //     type: 'connection_request',
  //     title: 'New Connection Request',
  //     message: 'John Doe sent you a connection request',
  //     relatedId: 'connectionId',
  //     relatedModel: 'Connection'
  //   },
  //   connection: { ... full connection object ... }
  // }
});
```

**Connection Accepted:**
```javascript
socket.on('notification', (data) => {
  // data = {
  //   type: 'connection_accept',
  //   notification: {
  //     title: 'Connection Accepted',
  //     message: 'Jane Smith accepted your connection request'
  //   }
  // }
});
```

**New Job Application:**
```javascript
socket.on('notification', (data) => {
  // data = {
  //   type: 'new_application',
  //   notification: {
  //     title: 'New Job Application',
  //     message: 'John Doe has applied for Senior Full Stack Developer'
  //   },
  //   application: { ... full application object ... }
  // }
});
```

**Application Status Update:**
```javascript
socket.on('notification', (data) => {
  // data = {
  //   type: 'application_status',
  //   notification: {
  //     title: 'Application Update',
  //     message: 'Congratulations! You\'ve been shortlisted for ...'
  //   },
  //   application: { ... updated application ... }
  // }
});
```

---

## Testing Workflows

### Workflow 1: Complete Job Application Flow

**Step 1: Complete Assessment (if not done)**
```bash
# See ASSESSMENT_AND_JOBS_API.md for assessment flow
```

**Step 2: Apply for Job**
```bash
curl -X POST http://localhost:4000/api/applications/apply \
  -H "Authorization: Bearer JOBSEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "673a5f8e2c1d4a5b6c7d8e9f",
    "coverLetter": "I am passionate about this role because..."
  }'
```

**Step 3: Check Application Status**
```bash
curl -X GET http://localhost:4000/api/applications/my \
  -H "Authorization: Bearer JOBSEEKER_TOKEN"
```

**Step 4: Employer Views Applications**
```bash
curl -X GET "http://localhost:4000/api/applications/employer?jobId=673a5f8e2c1d4a5b6c7d8e9f" \
  -H "Authorization: Bearer EMPLOYER_TOKEN"
```

**Step 5: Employer Updates Status**
```bash
curl -X PUT http://localhost:4000/api/applications/APPLICATION_ID/status \
  -H "Authorization: Bearer EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted"
  }'
```

---

### Workflow 2: LinkedIn-style Networking

**Step 1: Send Connection Request**
```bash
curl -X POST http://localhost:4000/api/connections/request \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "USER_B_ID",
    "message": "I would love to connect and discuss opportunities"
  }'
```

**Step 2: User B Receives Notification (Socket.IO)**
```javascript
// User B's client receives:
{
  type: 'connection_request',
  notification: {
    title: 'New Connection Request',
    message: 'User A sent you a connection request'
  }
}
```

**Step 3: User B Views Pending Requests**
```bash
curl -X GET http://localhost:4000/api/connections/requests/pending \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Step 4: User B Accepts Request**
```bash
curl -X PUT http://localhost:4000/api/connections/CONNECTION_ID/accept \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Step 5: User A Receives Acceptance Notification**
```javascript
// User A's client receives:
{
  type: 'connection_accept',
  notification: {
    title: 'Connection Accepted',
    message: 'User B accepted your connection request'
  }
}
```

**Step 6: View All Connections**
```bash
curl -X GET http://localhost:4000/api/connections/my \
  -H "Authorization: Bearer USER_A_TOKEN"
```

---

### Workflow 3: Block User

**Step 1: Block User**
```bash
curl -X POST http://localhost:4000/api/connections/block \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "USER_TO_BLOCK_ID"
  }'
```

**Step 2: View Blocked Users**
```bash
curl -X GET http://localhost:4000/api/connections/blocked \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3: Unblock User**
```bash
curl -X PUT http://localhost:4000/api/connections/CONNECTION_ID/unblock \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

### Application Errors
- `ASSESSMENT_REQUIRED` - Must complete assessment first
- `ASSESSMENT_INCOMPLETE` - Assessment started but not completed
- `DUPLICATE_APPLICATION` - Already applied to this job
- `403` - Not authorized to perform action
- `404` - Application/Job not found
- `400` - Invalid status transition

### Connection Errors
- `400` - Cannot connect to yourself
- `400` - Already connected
- `400` - Request already sent
- `403` - User is blocked
- `404` - User/Connection not found
- `400` - Invalid status for operation

---

## API Summary

### Applications (9 endpoints)
- ✅ POST `/api/applications/apply` - Apply for job (with assessment check)
- ✅ GET `/api/applications/my` - Get my applications
- ✅ PUT `/api/applications/:id/withdraw` - Withdraw application
- ✅ GET `/api/applications/employer` - Get applications (employer)
- ✅ PUT `/api/applications/:id/status` - Update status (employer)
- ✅ GET `/api/applications/:id` - Get application by ID
- ✅ GET `/api/applications/stats/me` - Get stats (job seeker)
- ✅ GET `/api/applications/stats/employer` - Get stats (employer)
- ✅ DELETE `/api/applications/:id` - Delete application

### Connections (11 endpoints)
- ✅ POST `/api/connections/request` - Send connection request
- ✅ GET `/api/connections/my` - Get my connections
- ✅ GET `/api/connections/requests/pending` - Get pending requests
- ✅ GET `/api/connections/requests/sent` - Get sent requests
- ✅ GET `/api/connections/blocked` - Get blocked users
- ✅ GET `/api/connections/stats` - Get connection statistics
- ✅ PUT `/api/connections/:id/accept` - Accept request
- ✅ PUT `/api/connections/:id/reject` - Reject request
- ✅ PUT `/api/connections/:id/unblock` - Unblock user
- ✅ POST `/api/connections/block` - Block user
- ✅ DELETE `/api/connections/:id` - Remove connection

---

**Total Endpoints Implemented: 57** 🎉
- Auth: 4
- Files: 4
- Job Seeker: 12
- Employer: 11
- Assessment: 6
- Jobs: 8
- Applications: 9
- Connections: 11

**Happy Networking & Job Hunting! 🚀**
