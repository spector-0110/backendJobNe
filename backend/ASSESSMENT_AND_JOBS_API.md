# Assessment & Job Posting API Documentation

Complete guide for the Personality Assessment System and Job Posting APIs.

---

## Table of Contents
1. [Assessment System](#assessment-system)
2. [Job Posting APIs](#job-posting-apis)
3. [Assessment Requirement for Job Applications](#assessment-requirement)
4. [Testing Workflows](#testing-workflows)

---

## Assessment System

### Overview
Job seekers **must complete** a personality assessment before they can apply for jobs. The assessment consists of 10 questions designed to evaluate:
- Work style preferences
- Problem-solving approach
- Leadership qualities
- Teamwork capabilities
- Communication style
- Stress management
- Cultural fit

### Personality Traits Measured
1. **Leadership** - Initiative and decision-making abilities
2. **Teamwork** - Collaboration and consensus building
3. **Adaptability** - Flexibility and handling change
4. **Problem Solving** - Analytical and strategic thinking
5. **Communication** - Conveying ideas and building relationships

---

### Assessment Endpoints

#### 1. Get Assessment Questions
```http
GET /api/assessment/questions
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "questions": [
      {
        "id": "q1",
        "questionText": "How do you prefer to work on projects?",
        "options": [
          "Independently with minimal supervision",
          "In a collaborative team environment",
          "A mix of both independent and team work",
          "I prefer clear direction and guidance"
        ],
        "category": "work_style"
      },
      // ... 9 more questions
    ],
    "count": 10
  }
}
```

#### 2. Start Assessment
```http
POST /api/assessment/start
Authorization: Bearer <accessToken>
Role: jobseeker
```

Creates an assessment record for the user.

**Response:**
```json
{
  "success": true,
  "message": "Assessment started successfully. Please submit your answers.",
  "data": {
    "assessment": {
      "_id": "...",
      "userId": "...",
      "questions": [...],
      "answers": [],
      "createdAt": "2025-11-23T10:00:00.000Z"
    }
  }
}
```

**Error Cases:**
- `403` - Not a job seeker
- `400` - Assessment already completed

#### 3. Submit Assessment Answers
```http
POST /api/assessment/submit
Authorization: Bearer <accessToken>
Role: jobseeker
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "q1",
      "selectedOption": "In a collaborative team environment"
    },
    {
      "questionId": "q2",
      "selectedOption": "Analyze it thoroughly before taking action"
    },
    // ... all 10 answers
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": {
    "assessment": {
      "_id": "...",
      "userId": "...",
      "score": 75,
      "answers": [...],
      "createdAt": "...",
      "updatedAt": "..."
    },
    "report": {
      "overallScore": 75,
      "traits": {
        "leadership": 65,
        "teamwork": 85,
        "adaptability": 70,
        "problemSolving": 75,
        "communication": 80
      },
      "dominantTrait": "teamwork",
      "personalityType": "Collaborative Team Player - You thrive in team environments and excel at building consensus.",
      "workStylePreferences": {
        "collaboration": "In a collaborative team environment",
        "environment": "Balanced and predictable"
      },
      "culturalFit": "Learning-focused culture"
    }
  }
}
```

**Validation Rules:**
- All 10 questions must be answered
- Each answer must include `questionId` and `selectedOption`
- Selected option must match one of the question's options

**Error Cases:**
- `404` - Profile or assessment not found
- `400` - Already submitted, incomplete answers, invalid questions

#### 4. Get Assessment Result
```http
GET /api/assessment/result
Authorization: Bearer <accessToken>
Role: jobseeker
```

Retrieves the completed assessment with personality report.

**Response:** Same as submit response

**Error Cases:**
- `404` - Assessment not found
- `400` - Assessment not completed

#### 5. Check Assessment Status
```http
GET /api/assessment/status
Authorization: Bearer <accessToken>
Role: jobseeker
```

**Response (Not Started):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "completed": false,
    "started": false,
    "message": "Assessment not started"
  }
}
```

**Response (Started but Not Submitted):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "completed": false,
    "started": true,
    "message": "Assessment started but not submitted"
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "completed": true,
    "started": true,
    "score": 75,
    "message": "Assessment completed"
  }
}
```

#### 6. Retake Assessment
```http
POST /api/assessment/retake
Authorization: Bearer <accessToken>
Role: jobseeker
```

Deletes previous assessment and creates a new one.

**Response:**
```json
{
  "success": true,
  "message": "Assessment reset. You can now retake it.",
  "data": {
    "assessment": {
      "_id": "...",
      "userId": "...",
      "questions": [...],
      "answers": []
    }
  }
}
```

---

## Job Posting APIs

### Overview
Employers can create, manage, and track job postings. Job seekers can search and view matched jobs based on their profile and skills.

---

### Job Endpoints

#### 1. Create Job Posting
```http
POST /api/jobs
Authorization: Bearer <accessToken>
Role: employer
Content-Type: application/json

{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer to join our growing team. You will be responsible for developing scalable web applications...",
  "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB", "Docker"],
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "location": "San Francisco, CA (Remote)",
  "experienceLevel": "senior",
  "jobType": "fulltime"
}
```

**Required Fields:**
- `title` (5-200 characters)
- `description` (50-5000 characters)
- `requiredSkills` (array, 1-50 items)

**Optional Fields:**
- `salary` - Object with min, max, currency
- `location` - String
- `experienceLevel` - entry | junior | mid | senior | lead | executive
- `jobType` - remote | onsite | hybrid | contract | fulltime | parttime

**Response:**
```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "job": {
      "_id": "...",
      "employerId": "...",
      "title": "Senior Full Stack Developer",
      "description": "...",
      "requiredSkills": ["JavaScript", "React", "Node.js", "MongoDB", "Docker"],
      "salary": { "min": 80000, "max": 120000, "currency": "USD" },
      "location": "San Francisco, CA (Remote)",
      "experienceLevel": "senior",
      "jobType": "fulltime",
      "isActive": true,
      "searchableText": "Senior Full Stack Developer ...",
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    }
  }
}
```

**Error Cases:**
- `404` - Employer profile not found
- `400` - Validation errors

#### 2. Get Job by ID
```http
GET /api/jobs/:id
Authorization: Bearer <accessToken>
```

Accessible by all authenticated users.

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "job": {
      "_id": "...",
      "employerId": {
        "_id": "...",
        "name": "Tech Corp",
        "email": "hr@techcorp.com"
      },
      "title": "Senior Full Stack Developer",
      "description": "...",
      "requiredSkills": [...],
      "salary": {...},
      "location": "...",
      "experienceLevel": "senior",
      "jobType": "fulltime",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

#### 3. Update Job
```http
PUT /api/jobs/:id
Authorization: Bearer <accessToken>
Role: employer (must own the job)
Content-Type: application/json

{
  "description": "Updated job description...",
  "salary": {
    "min": 90000,
    "max": 130000,
    "currency": "USD"
  },
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "job": { /* updated job object */ }
  }
}
```

**Error Cases:**
- `404` - Job not found
- `403` - Unauthorized (not job owner)

#### 4. Delete/Deactivate Job
```http
DELETE /api/jobs/:id
Authorization: Bearer <accessToken>
Role: employer (must own the job)
```

Soft deletes by setting `isActive` to false.

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": {}
}
```

#### 5. Get My Posted Jobs
```http
GET /api/jobs/my/postings?page=1&limit=20
Authorization: Bearer <accessToken>
Role: employer
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      { /* job object */ },
      { /* job object */ }
    ],
    "count": 15,
    "page": 1,
    "limit": 20
  }
}
```

#### 6. Search Jobs
```http
GET /api/jobs/search?skills=JavaScript,React&location=Remote&jobType=fulltime&page=1&limit=20
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `skills` - Comma-separated list (e.g., "JavaScript,React,Node.js")
- `location` - Location keyword (partial match)
- `jobType` - Job type filter
- `experienceLevel` - Experience level filter
- `minSalary` - Minimum salary filter
- `searchText` - Full-text search on title and description
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      {
        "_id": "...",
        "employerId": {...},
        "title": "Senior Full Stack Developer",
        "requiredSkills": ["JavaScript", "React", "Node.js"],
        ...
      }
    ],
    "count": 15,
    "totalCount": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### 7. Get Matched Jobs (Job Seeker)
```http
GET /api/jobs/matched/me?page=1&limit=50
Authorization: Bearer <accessToken>
Role: jobseeker
```

Returns jobs matched to the job seeker's profile with match percentage.

**Requirements:**
- Profile must be complete
- Skills, locations, and job types are used for matching

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "jobs": [
      {
        "_id": "...",
        "title": "Senior Full Stack Developer",
        "requiredSkills": ["JavaScript", "React", "Node.js"],
        "location": "Remote",
        "salary": {...},
        "matchPercentage": 85,
        ...
      },
      {
        "_id": "...",
        "title": "Frontend Developer",
        "matchPercentage": 72,
        ...
      }
    ],
    "count": 12,
    "page": 1,
    "limit": 50
  }
}
```

**Match Calculation:**
- **Skills Match (60%):** Overlap between candidate skills and required skills
- **Location Match (15%):** Matches preferred locations
- **Salary Match (15%):** Job salary max >= candidate min expectation
- **Job Type Match (10%):** Matches preferred job types

**Error Cases:**
- `404` - Profile not found
- `400` - Profile incomplete

#### 8. Get Job Statistics
```http
GET /api/jobs/my/stats
Authorization: Bearer <accessToken>
Role: employer
```

**Response:**
```json
{
  "success": true,
  "message": "ok",
  "data": {
    "stats": [
      { "_id": true, "count": 12 },   // Active jobs
      { "_id": false, "count": 3 }    // Inactive jobs
    ]
  }
}
```

---

## Assessment Requirement

### Middleware: `requireAssessment`

When job seekers attempt to apply for jobs (future application API), the system checks:

1. **Has assessment been started?**
   - If NO → Return 403 with message to start assessment

2. **Has assessment been submitted?**
   - If NO → Return 403 with message to complete assessment

3. **Assessment complete?**
   - If YES → Allow job application

### Error Response (No Assessment)
```json
{
  "success": false,
  "message": "You must complete the personality assessment before applying for jobs. Please visit /api/assessment/start to begin.",
  "code": "ASSESSMENT_REQUIRED"
}
```

### Error Response (Incomplete Assessment)
```json
{
  "success": false,
  "message": "You have started but not completed the personality assessment. Please submit your answers at /api/assessment/submit",
  "code": "ASSESSMENT_INCOMPLETE"
}
```

---

## Testing Workflows

### Workflow 1: Complete Assessment Flow

**Step 1: Check Status**
```bash
curl -X GET http://localhost:4000/api/assessment/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 2: Get Questions**
```bash
curl -X GET http://localhost:4000/api/assessment/questions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 3: Start Assessment**
```bash
curl -X POST http://localhost:4000/api/assessment/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Step 4: Submit Answers**
```bash
curl -X POST http://localhost:4000/api/assessment/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q1", "selectedOption": "In a collaborative team environment"},
      {"questionId": "q2", "selectedOption": "Analyze it thoroughly before taking action"},
      {"questionId": "q3", "selectedOption": "Share ideas and facilitate collaboration"},
      {"questionId": "q4", "selectedOption": "Creative and innovative"},
      {"questionId": "q5", "selectedOption": "Prefer constructive suggestions with examples"},
      {"questionId": "q6", "selectedOption": "Stay calm and prioritize tasks effectively"},
      {"questionId": "q7", "selectedOption": "Self-taught through research and practice"},
      {"questionId": "q8", "selectedOption": "Balance both strategic vision and execution"},
      {"questionId": "q9", "selectedOption": "Mediate and find common ground"},
      {"questionId": "q10", "selectedOption": "Continuous learning and growth"}
    ]
  }'
```

**Step 5: Get Result**
```bash
curl -X GET http://localhost:4000/api/assessment/result \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Workflow 2: Employer Job Posting

**Step 1: Create Job**
```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Authorization: Bearer EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Engineer",
    "description": "Looking for experienced backend developer with strong Node.js and MongoDB skills...",
    "requiredSkills": ["Node.js", "MongoDB", "Express", "Docker"],
    "salary": {"min": 90000, "max": 130000, "currency": "USD"},
    "location": "Remote",
    "experienceLevel": "senior",
    "jobType": "fulltime"
  }'
```

**Step 2: View Posted Jobs**
```bash
curl -X GET http://localhost:4000/api/jobs/my/postings \
  -H "Authorization: Bearer EMPLOYER_TOKEN"
```

**Step 3: Update Job**
```bash
curl -X PUT http://localhost:4000/api/jobs/JOB_ID \
  -H "Authorization: Bearer EMPLOYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salary": {"min": 95000, "max": 140000, "currency": "USD"}
  }'
```

---

### Workflow 3: Job Seeker Job Search

**Step 1: Search All Jobs**
```bash
curl -X GET "http://localhost:4000/api/jobs/search?skills=JavaScript,React&location=Remote&page=1" \
  -H "Authorization: Bearer JOBSEEKER_TOKEN"
```

**Step 2: Get Matched Jobs**
```bash
curl -X GET http://localhost:4000/api/jobs/matched/me \
  -H "Authorization: Bearer JOBSEEKER_TOKEN"
```

**Step 3: View Job Details**
```bash
curl -X GET http://localhost:4000/api/jobs/JOB_ID \
  -H "Authorization: Bearer JOBSEEKER_TOKEN"
```

---

## Personality Assessment Scoring

### Score Range: 0-100

**Trait Breakdown:**
- Each trait scored individually (0-100)
- Overall score is average of all traits

**Trait Categories:**
1. **Leadership (0-100)** - Decision making, initiative
2. **Teamwork (0-100)** - Collaboration, consensus building
3. **Adaptability (0-100)** - Flexibility, change management
4. **Problem Solving (0-100)** - Analysis, innovation
5. **Communication (0-100)** - Expression, relationship building

### Dominant Trait Determination
The trait with the highest score becomes the dominant trait, defining the candidate's personality type.

### Cultural Fit Matching
Based on motivation answer (Q10):
- **Recognition/Advancement** → Achievement-oriented culture
- **Meaningful Impact** → Purpose-driven culture
- **Learning/Growth** → Learning-focused culture
- **Work-Life Balance** → Balanced/supportive culture

---

## Best Practices

### For Job Seekers:
1. Complete profile before taking assessment
2. Answer assessment questions honestly
3. Check matched jobs regularly
4. Use filters to refine job search

### For Employers:
1. Create detailed, comprehensive job descriptions
2. List all required skills accurately
3. Specify salary ranges for better matches
4. Keep job postings updated
5. Mark inactive jobs as inactive

---

**Happy Testing! 🚀**
