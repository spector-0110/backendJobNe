# JobNest API Testing Guide

Complete guide for testing all implemented APIs.

## Base URL
```
http://localhost:4000/api
```

## Authentication Header
For protected routes, include:
```
Authorization: Bearer <accessToken>
```

---

## 1. Authentication APIs

### Register Job Seeker
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "jobseeker"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "email": "john@example.com",
    "role": "jobseeker",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Register Employer
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Tech Corp",
  "email": "hr@techcorp.com",
  "password": "SecurePass123!",
  "role": "employer"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>
```

---

## 2. Job Seeker Profile APIs

**Note:** All job seeker profile routes require `jobseeker` role.

### Create Profile
```http
POST /jobseeker/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "headline": "Senior Full Stack Developer",
  "about": "Experienced developer with 5+ years in MERN stack...",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Docker"],
  "experienceYears": 5,
  "preferredLocations": ["Remote", "New York", "San Francisco"],
  "salaryExpectation": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "jobTypes": ["remote", "fulltime"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "...",
      "userId": "...",
      "headline": "Senior Full Stack Developer",
      "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Docker"],
      "experienceYears": 5,
      "isProfileComplete": false,
      "createdAt": "2025-11-21T10:30:00.000Z",
      "updatedAt": "2025-11-21T10:30:00.000Z"
    }
  }
}
```

### Get Own Profile
```http
GET /jobseeker/profile
Authorization: Bearer <accessToken>
```

### Get Profile by ID (Public)
```http
GET /jobseeker/profile/:id
Authorization: Bearer <accessToken>
```

### Update Profile
```http
PUT /jobseeker/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "headline": "Lead Full Stack Developer",
  "experienceYears": 6,
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Docker", "Kubernetes"]
}
```

### Upload Resume
```http
POST /jobseeker/profile/resume
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

resume: [PDF/DOC/DOCX file, max 5MB]
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "profile": {
      "_id": "...",
      "resumeFileId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "isProfileComplete": true,
      ...
    }
  }
}
```

### Upload Cover Letter
```http
POST /jobseeker/profile/cover-letter
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

coverLetter: [PDF/TXT file, max 5MB]
```

### Upload Profile Photo
```http
POST /jobseeker/profile/photo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

photo: [JPEG/PNG file, max 2MB]
```

### Delete Resume
```http
DELETE /jobseeker/profile/resume
Authorization: Bearer <accessToken>
```

### Delete Cover Letter
```http
DELETE /jobseeker/profile/cover-letter
Authorization: Bearer <accessToken>
```

### Delete Profile Photo
```http
DELETE /jobseeker/profile/photo
Authorization: Bearer <accessToken>
```

### Search Job Seekers (Employer/Admin Only)
```http
GET /jobseeker/search?skills=JavaScript,React&experienceYears=3&page=1&limit=20
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `skills` - Comma-separated list (e.g., "JavaScript,React,Node.js")
- `experienceYears` - Minimum years of experience
- `locations` - Comma-separated locations
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobSeekers": [
      {
        "_id": "...",
        "userId": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
        "headline": "Senior Full Stack Developer",
        "skills": ["JavaScript", "React", "Node.js"],
        "experienceYears": 5,
        ...
      }
    ],
    "count": 15,
    "page": 1,
    "limit": 20
  }
}
```

### Delete Profile
```http
DELETE /jobseeker/profile
Authorization: Bearer <accessToken>
```

---

## 3. Employer Profile APIs

**Note:** Most employer profile routes require `employer` role.

### Create Profile
```http
POST /employer/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "companyName": "Tech Innovations Inc.",
  "companyDescription": "Leading technology company specializing in AI and ML solutions...",
  "companySize": "51-200",
  "industry": "Information Technology",
  "headquartersLocation": "San Francisco, CA",
  "companyValues": ["Innovation", "Collaboration", "Excellence", "Integrity"],
  "usualHiringRoles": ["Software Engineer", "Data Scientist", "Product Manager"],
  "skillCategories": ["JavaScript", "Python", "Machine Learning", "Cloud Computing"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "profile": {
      "_id": "...",
      "userId": "...",
      "companyName": "Tech Innovations Inc.",
      "companySize": "51-200",
      "industry": "Information Technology",
      "isVerified": false,
      "createdAt": "2025-11-21T10:30:00.000Z",
      ...
    }
  }
}
```

### Get Own Profile
```http
GET /employer/profile
Authorization: Bearer <accessToken>
```

### Get Profile by ID (Public)
```http
GET /employer/profile/:id
Authorization: Bearer <accessToken>
```

### Update Profile
```http
PUT /employer/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "companyDescription": "Updated company description...",
  "companySize": "201-500",
  "companyValues": ["Innovation", "Collaboration", "Sustainability", "Excellence"]
}
```

### Upload Company Logo
```http
POST /employer/profile/logo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

logo: [JPEG/PNG file, max 2MB]
```

**Response:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "profile": {
      "_id": "...",
      "logoFileId": "64a1b2c3d4e5f6g7h8i9j0k1",
      ...
    }
  }
}
```

### Add Office Image
```http
POST /employer/profile/office-image
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

officeImage: [JPEG/PNG file, max 2MB]
```

**Note:** Maximum 10 office images allowed per profile.

### Remove Office Image
```http
DELETE /employer/profile/office-image/:fileId
Authorization: Bearer <accessToken>
```

### Delete Logo
```http
DELETE /employer/profile/logo
Authorization: Bearer <accessToken>
```

### Search Employers (Public for authenticated users)
```http
GET /employer/search?industry=Technology&companySize=51-200&verified=true&page=1&limit=20
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `industry` - Company industry
- `companySize` - Company size range (1-10, 11-50, 51-200, 201-500, 501-1000, 1000+)
- `location` - Company location (partial match)
- `verified` - Verified status (true/false)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "employers": [
      {
        "_id": "...",
        "userId": { "_id": "...", "name": "Tech Corp", "email": "hr@techcorp.com" },
        "companyName": "Tech Innovations Inc.",
        "industry": "Technology",
        "companySize": "51-200",
        "isVerified": true,
        ...
      }
    ],
    "count": 8,
    "page": 1,
    "limit": 20
  }
}
```

### Verify Employer (Admin Only)
```http
PUT /employer/verify/:userId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "isVerified": true
}
```

### Delete Profile
```http
DELETE /employer/profile
Authorization: Bearer <accessToken>
```

---

## 4. File Management APIs

### Download File
```http
GET /files/:fileId/download
Authorization: Bearer <accessToken>
```

Downloads the file as an attachment.

### View File (Inline)
```http
GET /files/:fileId/view
Authorization: Bearer <accessToken>
```

Views the file inline in browser (useful for PDFs, images).

### Get File Metadata
```http
GET /files/:fileId/info
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "filename": "1732185600000-resume.pdf",
    "contentType": "application/pdf",
    "size": 245678,
    "uploadDate": "2025-11-21T10:30:00.000Z",
    "metadata": {
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "originalName": "resume.pdf",
      "uploadedAt": "2025-11-21T10:30:00.000Z"
    }
  }
}
```

### Get User's Files
```http
GET /files/my-files
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "files": [
      {
        "id": "...",
        "filename": "resume.pdf",
        "contentType": "application/pdf",
        "size": 245678,
        "uploadDate": "2025-11-21T10:30:00.000Z",
        "metadata": { ... }
      }
    ],
    "count": 3
  }
}
```

### Delete File
```http
DELETE /files/:fileId
Authorization: Bearer <accessToken>
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "\"email\" must be a valid email",
    "\"password\" length must be at least 8 characters long"
  ]
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Profile not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing with cURL

### Register & Create Profile Flow

1. **Register as Job Seeker:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "jobseeker"
  }'
```

2. **Create Profile (save accessToken from previous response):**
```bash
curl -X POST http://localhost:4000/api/jobseeker/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "headline": "Full Stack Developer",
    "skills": ["JavaScript", "React", "Node.js"],
    "experienceYears": 3,
    "preferredLocations": ["Remote"],
    "salaryExpectation": {"min": 60000, "max": 90000, "currency": "USD"},
    "jobTypes": ["remote", "fulltime"]
  }'
```

3. **Upload Resume:**
```bash
curl -X POST http://localhost:4000/api/jobseeker/profile/resume \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "resume=@/path/to/your/resume.pdf"
```

4. **Get Profile:**
```bash
curl -X GET http://localhost:4000/api/jobseeker/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Testing with Postman

### Setup Environment Variables
1. Create a new environment in Postman
2. Add variables:
   - `baseUrl`: `http://localhost:4000/api`
   - `accessToken`: (will be set from login response)

### Collection Structure
```
JobNest API
├── Auth
│   ├── Register Job Seeker
│   ├── Register Employer
│   ├── Login
│   └── Logout
├── Job Seeker Profile
│   ├── Create Profile
│   ├── Get Own Profile
│   ├── Update Profile
│   ├── Upload Resume
│   ├── Upload Cover Letter
│   ├── Upload Photo
│   └── Search Job Seekers
├── Employer Profile
│   ├── Create Profile
│   ├── Get Own Profile
│   ├── Update Profile
│   ├── Upload Logo
│   ├── Add Office Image
│   └── Search Employers
└── Files
    ├── Download File
    ├── View File
    ├── Get File Info
    └── Get My Files
```

### Auto-Set Token Script
Add to Tests tab of Login request:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("accessToken", response.data.accessToken);
}
```

---

## Common Testing Scenarios

### Scenario 1: Complete Job Seeker Onboarding
1. Register → Login → Create Profile → Upload Resume → Upload Photo
2. Verify `isProfileComplete` becomes `true` after resume upload

### Scenario 2: Employer Profile Setup
1. Register → Login → Create Profile → Upload Logo → Add Office Images
2. Search for employers and verify profile appears

### Scenario 3: File Management
1. Upload resume → Get file info → Download file → Delete file
2. Verify file is properly deleted and profile reference is updated

### Scenario 4: Role-Based Access
1. Login as job seeker → Try to access employer endpoints (should get 403)
2. Login as employer → Try to access job seeker endpoints (should get 403)

### Scenario 5: Search Functionality
1. Create multiple profiles with different skills/industries
2. Search with various filters
3. Verify pagination works correctly

---

## Rate Limiting

Auth endpoints are rate-limited:
- **Limit:** 20 requests per minute
- **Response when exceeded:**
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## File Upload Constraints

### Image Files (Logo, Profile Photo, Office Images)
- **Formats:** JPEG, PNG
- **Max Size:** 2MB
- **Validation:** Automatic MIME type checking

### Document Files (Resume, Cover Letter)
- **Formats:** PDF, DOC, DOCX, TXT
- **Max Size:** 5MB
- **Validation:** Automatic MIME type checking

### Error on Invalid File
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG and PNG images are allowed."
}
```

---

## Next Steps

After testing profile APIs, proceed to test:
- Assessment APIs (when implemented)
- Job Posting APIs (when implemented)
- Application APIs (when implemented)
- Connection & Messaging APIs (when implemented)
- Notification APIs (when implemented)

---

**Happy Testing! 🚀**
