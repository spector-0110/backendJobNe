# Comprehensive API Testing Guide

This guide provides detailed information about all available APIs, including request/response formats, authentication requirements, and frontend integration examples.

## Table of Contents
1. [Base URL & Authentication](#base-url--authentication)
2. [Response Format](#response-format)
3. [Authentication APIs](#authentication-apis)
4. [Job Seeker APIs](#job-seeker-apis)
5. [Employer APIs](#employer-apis)
6. [Job APIs](#job-apis)
7. [Application APIs](#application-apis)
8. [Assessment APIs](#assessment-apis)
9. [Connection APIs](#connection-apis)
10. [Message APIs](#message-apis)
11. [Notification APIs](#notification-apis)
12. [File APIs](#file-apis)
13. [Frontend Integration Examples](#frontend-integration-examples)

---

## Base URL & Authentication

### Base URL
```
http://localhost:3000/api
```

### Authentication Headers
Most endpoints require authentication. Include the following header:
```
Authorization: Bearer <access_token>
```

### Rate Limiting
- Auth endpoints: 20 requests per minute
- Other endpoints: No explicit rate limiting (but recommended to implement client-side throttling)

---

## Response Format

All API responses follow this standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { /* optional error details */ }
}
```

---

## Authentication APIs

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "jobseeker" // or "employer" or "admin"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "64f7b1c2e123456789abcdef",
    "email": "john@example.com",
    "role": "jobseeker",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Cases:**
- 400: Email already exists
- 500: Server error

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "64f7b1c2e123456789abcdef",
    "role": "jobseeker",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Cases:**
- 400: Invalid credentials
- 500: Server error

### 3. Logout User
**POST** `/auth/logout` (Protected)

**Headers:** `Authorization: Bearer <access_token>`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## Job Seeker APIs

### 1. Create Profile
**POST** `/jobseeker/profile` (Protected - jobseeker only)

**Request Body:**
```json
{
  "headline": "Full Stack Developer",
  "about": "Passionate developer with 3 years of experience...",
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "experienceYears": 3,
  "preferredLocations": ["New York", "Remote"],
  "salaryExpectation": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "jobTypes": ["fulltime", "remote"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "64f7b1c2e123456789abcdef",
      "userId": "64f7b1c2e123456789abcdef",
      "headline": "Full Stack Developer",
      "about": "Passionate developer with 3 years of experience...",
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "experienceYears": 3,
      "preferredLocations": ["New York", "Remote"],
      "salaryExpectation": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      },
      "jobTypes": ["fulltime", "remote"],
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get My Profile
**GET** `/jobseeker/profile` (Protected - jobseeker only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "profile": {
      "_id": "64f7b1c2e123456789abcdef",
      "userId": "64f7b1c2e123456789abcdef",
      "headline": "Full Stack Developer",
      "about": "Passionate developer with 3 years of experience...",
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "experienceYears": 3,
      "resumeFileId": "64f7b1c2e123456789abcdef",
      "profilePhotoId": "64f7b1c2e123456789abcdef",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 3. Get Profile by ID
**GET** `/jobseeker/profile/:id` (Protected)

**Success Response (200):** Same as Get My Profile

### 4. Update Profile
**PUT** `/jobseeker/profile` (Protected - jobseeker only)

**Request Body:** Same as Create Profile (all fields optional)

### 5. Upload Resume
**POST** `/jobseeker/profile/resume` (Protected - jobseeker only)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
resume: <PDF/DOC file>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "fileId": "64f7b1c2e123456789abcdef",
    "filename": "john_resume.pdf"
  }
}
```

### 6. Upload Cover Letter
**POST** `/jobseeker/profile/cover-letter` (Protected - jobseeker only)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
coverLetter: <PDF/DOC file>
```

### 7. Upload Profile Photo
**POST** `/jobseeker/profile/photo` (Protected - jobseeker only)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
photo: <Image file>
```

### 8. Delete Resume
**DELETE** `/jobseeker/profile/resume` (Protected - jobseeker only)

### 9. Delete Cover Letter
**DELETE** `/jobseeker/profile/cover-letter` (Protected - jobseeker only)

### 10. Delete Profile Photo
**DELETE** `/jobseeker/profile/photo` (Protected - jobseeker only)

### 11. Search Job Seekers
**GET** `/jobseeker/search` (Protected - employer/admin only)

**Query Parameters:**
```
?skills=JavaScript&experienceYears=3&locations=Remote&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobSeekers": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "headline": "Full Stack Developer",
        "skills": ["JavaScript", "React", "Node.js"],
        "experienceYears": 3,
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "totalCount": 150,
    "page": 1,
    "totalPages": 8
  }
}
```

### 12. Delete Profile
**DELETE** `/jobseeker/profile` (Protected - jobseeker only)

---

## Employer APIs

### 1. Create Profile
**POST** `/employer/profile` (Protected - employer only)

**Request Body:**
```json
{
  "companyName": "Tech Corp",
  "companyDescription": "Leading technology company...",
  "companySize": "201-500",
  "industry": "Technology",
  "headquartersLocation": "San Francisco, CA",
  "companyValues": ["Innovation", "Diversity", "Growth"],
  "usualHiringRoles": ["Software Engineer", "Product Manager"],
  "skillCategories": ["Frontend", "Backend", "DevOps"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "64f7b1c2e123456789abcdef",
      "userId": "64f7b1c2e123456789abcdef",
      "companyName": "Tech Corp",
      "companyDescription": "Leading technology company...",
      "companySize": "201-500",
      "industry": "Technology",
      "isVerified": false,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get My Profile
**GET** `/employer/profile` (Protected - employer only)

### 3. Get Profile by ID
**GET** `/employer/profile/:id` (Protected)

### 4. Update Profile
**PUT** `/employer/profile` (Protected - employer only)

### 5. Upload Logo
**POST** `/employer/profile/logo` (Protected - employer only)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
logo: <Image file>
```

### 6. Delete Logo
**DELETE** `/employer/profile/logo` (Protected - employer only)

### 7. Add Office Image
**POST** `/employer/profile/office-image` (Protected - employer only)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
officeImage: <Image file>
```

### 8. Remove Office Image
**DELETE** `/employer/profile/office-image/:fileId` (Protected - employer only)

### 9. Search Employers
**GET** `/employer/search` (Protected)

**Query Parameters:**
```
?industry=Technology&companySize=201-500&location=San Francisco&verified=true&page=1&limit=20
```

### 10. Verify Employer
**PUT** `/employer/verify/:userId` (Protected - admin only)

**Request Body:**
```json
{
  "isVerified": true
}
```

### 11. Delete Profile
**DELETE** `/employer/profile` (Protected - employer only)

---

## Job APIs

### 1. Create Job
**POST** `/jobs` (Protected - employer only)

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer...",
  "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD"
  },
  "location": "New York, NY",
  "experienceLevel": "senior",
  "jobType": "fulltime"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "job": {
      "_id": "64f7b1c2e123456789abcdef",
      "title": "Senior Full Stack Developer",
      "description": "We are looking for an experienced full stack developer...",
      "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
      "salary": {
        "min": 100000,
        "max": 150000,
        "currency": "USD"
      },
      "location": "New York, NY",
      "experienceLevel": "senior",
      "jobType": "fulltime",
      "employerId": "64f7b1c2e123456789abcdef",
      "isActive": true,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get Job by ID
**GET** `/jobs/:id` (Protected)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "job": {
      "_id": "64f7b1c2e123456789abcdef",
      "title": "Senior Full Stack Developer",
      "description": "We are looking for an experienced full stack developer...",
      "employer": {
        "companyName": "Tech Corp",
        "logoFileId": "64f7b1c2e123456789abcdef"
      },
      "applicationCount": 25,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 3. Update Job
**PUT** `/jobs/:id` (Protected - employer only, must own job)

**Request Body:** Same as Create Job (all fields optional)

### 4. Delete Job
**DELETE** `/jobs/:id` (Protected - employer only, must own job)

### 5. Get My Posted Jobs
**GET** `/jobs/my/postings` (Protected - employer only)

**Query Parameters:**
```
?page=1&limit=20&status=active
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "title": "Senior Full Stack Developer",
        "isActive": true,
        "applicationCount": 25,
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalCount": 10,
    "page": 1,
    "totalPages": 1
  }
}
```

### 6. Get Job Statistics
**GET** `/jobs/my/stats` (Protected - employer only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "totalJobs": 10,
    "activeJobs": 8,
    "totalApplications": 250,
    "averageApplicationsPerJob": 25
  }
}
```

### 7. Get Matched Jobs
**GET** `/jobs/matched/me` (Protected - jobseeker only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "title": "Senior Full Stack Developer",
        "matchScore": 85,
        "employer": {
          "companyName": "Tech Corp"
        }
      }
    ]
  }
}
```

### 8. Search Jobs
**GET** `/jobs/search` (Protected)

**Query Parameters:**
```
?skills=JavaScript&location=Remote&jobType=fulltime&experienceLevel=senior&minSalary=80000&searchText=developer&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "title": "Senior Full Stack Developer",
        "location": "Remote",
        "salary": {
          "min": 100000,
          "max": 150000,
          "currency": "USD"
        },
        "employer": {
          "companyName": "Tech Corp",
          "isVerified": true
        }
      }
    ],
    "totalCount": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

---

## Application APIs

### 1. Apply for Job
**POST** `/applications/apply` (Protected - jobseeker only, requires completed assessment)

**Request Body:**
```json
{
  "jobId": "64f7b1c2e123456789abcdef",
  "coverLetter": "I am excited to apply for this position..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "64f7b1c2e123456789abcdef",
      "jobId": "64f7b1c2e123456789abcdef",
      "jobseekerId": "64f7b1c2e123456789abcdef",
      "status": "applied",
      "coverLetter": "I am excited to apply for this position...",
      "appliedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get My Applications
**GET** `/applications/my` (Protected - jobseeker only)

**Query Parameters:**
```
?status=applied&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "applications": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "status": "applied",
        "appliedAt": "2023-09-06T10:30:00.000Z",
        "job": {
          "title": "Senior Full Stack Developer",
          "employer": {
            "companyName": "Tech Corp"
          }
        }
      }
    ],
    "totalCount": 15,
    "page": 1,
    "totalPages": 1
  }
}
```

### 3. Get Application Statistics
**GET** `/applications/stats/me` (Protected - jobseeker only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "totalApplications": 15,
    "applied": 8,
    "viewed": 3,
    "shortlisted": 2,
    "rejected": 1,
    "accepted": 1
  }
}
```

### 4. Withdraw Application
**PUT** `/applications/:id/withdraw` (Protected - jobseeker only)

### 5. Get Applications for Employer
**GET** `/applications/employer` (Protected - employer only)

**Query Parameters:**
```
?jobId=64f7b1c2e123456789abcdef&status=applied&page=1&limit=20
```

### 6. Get Employer Application Statistics
**GET** `/applications/stats/employer` (Protected - employer only)

### 7. Update Application Status
**PUT** `/applications/:id/status` (Protected - employer only)

**Request Body:**
```json
{
  "status": "shortlisted"  // viewed, shortlisted, rejected, accepted
}
```

### 8. Get Application by ID
**GET** `/applications/:id` (Protected - jobseeker/employer)

### 9. Delete Application
**DELETE** `/applications/:id` (Protected - jobseeker only, only withdrawn/rejected)

---

## Assessment APIs

### 1. Get Assessment Questions
**GET** `/assessment/questions` (Protected - jobseeker only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "questions": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "question": "What is the time complexity of binary search?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        "category": "algorithms"
      }
    ],
    "totalQuestions": 20,
    "timeLimit": 30
  }
}
```

### 2. Start Assessment
**POST** `/assessment/start` (Protected - jobseeker only)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Assessment started",
  "data": {
    "assessmentId": "64f7b1c2e123456789abcdef",
    "startTime": "2023-09-06T10:30:00.000Z",
    "endTime": "2023-09-06T11:00:00.000Z"
  }
}
```

### 3. Submit Assessment
**POST** `/assessment/submit` (Protected - jobseeker only)

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "64f7b1c2e123456789abcdef",
      "selectedOption": "O(log n)"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "percentile": 78
  }
}
```

### 4. Get Assessment Result
**GET** `/assessment/result` (Protected - jobseeker only)

### 5. Check Assessment Status
**GET** `/assessment/status` (Protected - jobseeker only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "status": "completed",  // not_started, in_progress, completed
    "score": 85,
    "completedAt": "2023-09-06T11:00:00.000Z"
  }
}
```

### 6. Retake Assessment
**POST** `/assessment/retake` (Protected - jobseeker only)

---

## Connection APIs

### 1. Send Connection Request
**POST** `/connections/request` (Protected)

**Request Body:**
```json
{
  "receiverId": "64f7b1c2e123456789abcdef",
  "message": "I'd like to connect with you..."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Connection request sent",
  "data": {
    "connection": {
      "_id": "64f7b1c2e123456789abcdef",
      "senderId": "64f7b1c2e123456789abcdef",
      "receiverId": "64f7b1c2e123456789abcdef",
      "status": "pending",
      "message": "I'd like to connect with you...",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get My Connections
**GET** `/connections/my` (Protected)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "connections": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "status": "accepted",
        "connectedUser": {
          "name": "Jane Smith",
          "role": "employer"
        },
        "connectedAt": "2023-09-06T10:30:00.000Z"
      }
    ]
  }
}
```

### 3. Get Pending Requests
**GET** `/connections/requests/pending` (Protected)

### 4. Get Sent Requests
**GET** `/connections/requests/sent` (Protected)

### 5. Get Blocked Users
**GET** `/connections/blocked` (Protected)

### 6. Get Connection Statistics
**GET** `/connections/stats` (Protected)

### 7. Accept Connection Request
**PUT** `/connections/:id/accept` (Protected)

### 8. Reject Connection Request
**PUT** `/connections/:id/reject` (Protected)

### 9. Block User
**POST** `/connections/block` (Protected)

### 10. Unblock User
**PUT** `/connections/:id/unblock` (Protected)

### 11. Remove Connection
**DELETE** `/connections/:id` (Protected)

---

## Message APIs

### 1. Send Message
**POST** `/messages/send` (Protected)

**Request Body:**
```json
{
  "receiverId": "64f7b1c2e123456789abcdef",
  "content": "Hello! How are you?"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "64f7b1c2e123456789abcdef",
      "senderId": "64f7b1c2e123456789abcdef",
      "receiverId": "64f7b1c2e123456789abcdef",
      "content": "Hello! How are you?",
      "isRead": false,
      "sentAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 2. Get Conversations
**GET** `/messages/conversations` (Protected)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "conversations": [
      {
        "user": {
          "_id": "64f7b1c2e123456789abcdef",
          "name": "Jane Smith"
        },
        "lastMessage": {
          "content": "Thanks for your message!",
          "sentAt": "2023-09-06T10:30:00.000Z",
          "isRead": true
        },
        "unreadCount": 2
      }
    ]
  }
}
```

### 3. Get Messages with User
**GET** `/messages/:userId` (Protected)

**Query Parameters:**
```
?page=1&limit=50
```

### 4. Get Unread Count
**GET** `/messages/unread/count` (Protected)

### 5. Search Messages
**GET** `/messages/search` (Protected)

**Query Parameters:**
```
?q=hello&page=1&limit=20
```

### 6. Mark Message as Read
**PUT** `/messages/:id/read` (Protected)

### 7. Mark All Messages as Read
**PUT** `/messages/read-all/:userId` (Protected)

### 8. Delete Message
**DELETE** `/messages/:id` (Protected)

---

## Notification APIs

### 1. Get Notifications
**GET** `/notifications` (Protected)

**Query Parameters:**
```
?page=1&limit=20&type=application&isRead=false
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "notifications": [
      {
        "_id": "64f7b1c2e123456789abcdef",
        "type": "application",
        "title": "New Application Received",
        "message": "You have received a new application for Senior Developer position",
        "isRead": false,
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalCount": 25,
    "page": 1,
    "totalPages": 2
  }
}
```

### 2. Get Unread Count
**GET** `/notifications/unread/count` (Protected)

### 3. Get Notification Statistics
**GET** `/notifications/stats` (Protected)

### 4. Mark Notification as Read
**PUT** `/notifications/:id/read` (Protected)

### 5. Mark All as Read
**PUT** `/notifications/read-all` (Protected)

### 6. Delete Notification
**DELETE** `/notifications/:id` (Protected)

### 7. Delete All Notifications
**DELETE** `/notifications/all` (Protected)

### 8. Delete All Read Notifications
**DELETE** `/notifications/read` (Protected)

---

## File APIs

### 1. Download File
**GET** `/files/:fileId/download` (Protected)

**Success Response (200):**
- Returns file for download with appropriate headers

### 2. View File
**GET** `/files/:fileId/view` (Protected)

**Success Response (200):**
- Returns file for inline viewing

### 3. Get File Info
**GET** `/files/:fileId/info` (Protected)

**Success Response (200):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "file": {
      "_id": "64f7b1c2e123456789abcdef",
      "filename": "resume.pdf",
      "contentType": "application/pdf",
      "length": 245760,
      "uploadDate": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### 4. Get User Files
**GET** `/files/my-files` (Protected)

### 5. Delete File
**DELETE** `/files/:fileId` (Protected)

---

## Frontend Integration Examples

### React/JavaScript Examples

#### 1. Authentication Service
```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.accessToken = localStorage.getItem('accessToken');
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('userRole', data.data.role);
    }

    return data;
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.data.accessToken;
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('userRole', data.data.role);
    }

    return data;
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}

// Usage
const authService = new AuthService();
```

#### 2. API Request Helper
```javascript
class ApiClient {
  constructor(authService) {
    this.baseURL = 'http://localhost:3000/api';
    this.authService = authService;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add auth headers if token exists
    if (this.authService.accessToken) {
      defaultOptions.headers.Authorization = `Bearer ${this.authService.accessToken}`;
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, requestOptions);

    // If unauthorized, redirect to login
    if (response.status === 401) {
      this.authService.logout();
      window.location.href = '/login';
      return null;
    }

    return response.json();
  }

  // Job-related methods
  async getJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.makeRequest(`/jobs/search?${queryParams}`);
  }

  async getJobById(jobId) {
    return this.makeRequest(`/jobs/${jobId}`);
  }

  async createJob(jobData) {
    return this.makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async applyForJob(applicationData) {
    return this.makeRequest('/applications/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  // Profile-related methods
  async getMyProfile() {
    const userRole = localStorage.getItem('userRole');
    return this.makeRequest(`/${userRole}/profile`);
  }

  async updateProfile(profileData) {
    const userRole = localStorage.getItem('userRole');
    return this.makeRequest(`/${userRole}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // File upload
  async uploadFile(endpoint, file) {
    const formData = new FormData();
    formData.append(file.fieldName, file.file);

    return this.makeRequest(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authService.accessToken}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }
}

// Usage
const authService = new AuthService();
const apiClient = new ApiClient(authService);
```

#### 3. React Components Examples

```jsx
// Login Component
import React, { useState } from 'react';

const LoginForm = ({ authService, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        onLoginSuccess(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

```jsx
// Job Search Component
import React, { useState, useEffect } from 'react';

const JobSearch = ({ apiClient }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    jobType: '',
    page: 1,
    limit: 20,
  });

  const searchJobs = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getJobs(filters);
      if (result.success) {
        setJobs(result.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchJobs();
  }, [filters]);

  const handleApply = async (jobId) => {
    try {
      const result = await apiClient.applyForJob({
        jobId,
        coverLetter: 'I am interested in this position...',
      });
      
      if (result.success) {
        alert('Application submitted successfully!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error submitting application');
    }
  };

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Skills"
          value={filters.skills}
          onChange={(e) => setFilters({ ...filters, skills: e.target.value, page: 1 })}
        />
        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
        />
        <select
          value={filters.jobType}
          onChange={(e) => setFilters({ ...filters, jobType: e.target.value, page: 1 })}
        >
          <option value="">All Job Types</option>
          <option value="fulltime">Full Time</option>
          <option value="parttime">Part Time</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {loading ? (
        <div>Loading jobs...</div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.employer?.companyName}</p>
              <p>{job.location}</p>
              <p>{job.salary ? `$${job.salary.min} - $${job.salary.max}` : 'Salary not disclosed'}</p>
              <div className="skills">
                {job.requiredSkills?.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
              <button onClick={() => handleApply(job._id)}>
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 4. File Upload Component
```jsx
// File Upload Component
import React, { useState } from 'react';

const FileUpload = ({ apiClient, endpoint, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await apiClient.uploadFile(endpoint, {
        fieldName: 'resume', // or 'photo', 'logo', etc.
        file: file,
      });

      if (result.success) {
        onUploadSuccess(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".pdf,.doc,.docx" // Adjust based on file type
      />
      {uploading && <div>Uploading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

### Common Error Handling Patterns

```javascript
// Error handling utility
const handleApiError = (error, response) => {
  if (response.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
    return;
  }

  if (response.status === 403) {
    // Forbidden - show access denied message
    alert('Access denied. You do not have permission to perform this action.');
    return;
  }

  if (response.status >= 500) {
    // Server error
    alert('Server error. Please try again later.');
    return;
  }

  // Client error - show specific message
  alert(error.message || 'An error occurred');
};
```

### WebSocket Integration (for real-time features)

```javascript
// WebSocket client for real-time notifications and messages
class WebSocketClient {
  constructor(authService) {
    this.authService = authService;
    this.socket = null;
  }

  connect() {
    if (this.authService.accessToken) {
      this.socket = io('http://localhost:3000', {
        auth: {
          token: this.authService.accessToken,
        },
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('newMessage', (message) => {
        // Handle new message
        this.onNewMessage(message);
      });

      this.socket.on('newNotification', (notification) => {
        // Handle new notification
        this.onNewNotification(notification);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewMessage(message) {
    // Implement message handling
    console.log('New message received:', message);
  }

  onNewNotification(notification) {
    // Implement notification handling
    console.log('New notification received:', notification);
  }
}
```

This comprehensive guide provides all the necessary information for testing and integrating with the job portal APIs. Each endpoint includes detailed request/response examples, error cases, and practical frontend integration patterns.