# Skillora Partner Integration API - Jobs & Recruitment

A comprehensive guide for integrating Skillora's hiring and recruitment API into your applications. This API allows partners to manage jobs, candidates, interviews, and access detailed interview results programmatically.

This document covers the **hiring workflow**: Jobs, Candidates, and Job Interviews. For mock/practice interviews, see [Mock Interviews](./mock-interviews.md).

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Jobs](#jobs)
   - [Candidates](#candidates)
   - [Interviews](#interviews)
   - [Segment Sessions & Transcripts](#segment-sessions--transcripts)
4. [JavaScript SDK Examples](#javascript-sdk-examples)
5. [Response Formats](#response-formats)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Support](#support)

## Quick Start

### Base URL

- **Production**: `https://api.skillora.ai/v1/`
- **Development**: `http://localhost:8000/v1/`

### API Endpoints Overview

| Method | Endpoint                                                                           | Description                          |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------ |
| GET    | `/partners/jobs/`                                                                  | List organization jobs               |
| GET    | `/partners/jobs/{id}/`                                                             | Get job details                      |
| GET    | `/partners/jobs/{id}/candidates/`                                                  | List candidates for a job            |
| GET    | `/partners/jobs/{id}/interviews/`                                                  | List interviews for a job            |
| POST   | `/partners/candidates/`                                                            | Create a candidate                   |
| GET    | `/partners/candidates/`                                                            | List all candidates                  |
| GET    | `/partners/candidates/{id}/`                                                       | Get candidate details                |
| PATCH  | `/partners/candidates/{id}/`                                                       | Update a candidate                   |
| DELETE | `/partners/candidates/{id}/`                                                       | Delete a candidate                   |
| GET    | `/partners/interviews/`                                                            | List all interviews                  |
| GET    | `/partners/interviews/{id}/`                                                       | Get interview details                |
| GET    | `/partners/interviews/{id}/segment-sessions/`                                      | List segment sessions                |
| GET    | `/partners/interviews/{id}/segment-sessions/{session_id}/transcripts/`             | Get segment transcripts              |
| GET    | `/partners/interviews/{id}/segment-sessions/{session_id}/competency-scores/`       | Get segment competency scores        |

## Authentication

Skillora supports two authentication methods:

### 1. API Key Authentication (Recommended for Server-to-Server)

```javascript
const headers = {
  Authorization: 'Bearer sk_your_api_key_here',
  'Content-Type': 'application/json',
};
```

### 2. JWT Token Authentication (For User Sessions)

```javascript
const headers = {
  Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
  'Content-Type': 'application/json',
};
```

## API Endpoints

### Jobs

#### List Jobs

**Endpoint**: `GET /partners/jobs/`

Lists all published (non-draft) jobs for the organization.

**Query Parameters**

| Parameter        | Type    | Description                                                                      |
| ---------------- | ------- | -------------------------------------------------------------------------------- |
| `page`           | integer | Page number (default: 1)                                                         |
| `page_size`      | integer | Items per page (default: 30, max: 100)                                           |
| `job_type`       | string  | Filter: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `VOLUNTEER`, `INTERNSHIP` |
| `workplace_type` | string  | Filter: `ON_SITE`, `HYBRID`, `REMOTE`                                            |

---

#### Get Job Details

**Endpoint**: `GET /partners/jobs/{id}/`

Retrieves detailed information about a specific job.

**Path Parameters**

| Parameter | Type | Description       |
| --------- | ---- | ----------------- |
| `id`      | uuid | The job's UUID    |

---

#### List Candidates for a Job

**Endpoint**: `GET /partners/jobs/{id}/candidates/`

Lists all candidates associated with a specific job.

**Path Parameters**

| Parameter | Type | Description       |
| --------- | ---- | ----------------- |
| `id`      | uuid | The job's UUID    |

**Query Parameters**

| Parameter   | Type    | Description                                                                                                      |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `page`      | integer | Page number (default: 1)                                                                                         |
| `page_size` | integer | Items per page (default: 30, max: 100)                                                                           |
| `status`    | string  | Filter: `APPLIED`, `SHORTLISTED`, `INVITED`, `INTERVIEWING`, `COMPLETED_INTERVIEW`, `OFFER_ACCEPTED`, `REJECTED` |
| `search`    | string  | Search by first name, last name, or email                                                                        |

---

#### List Interviews for a Job

**Endpoint**: `GET /partners/jobs/{id}/interviews/`

Lists all interviews associated with a specific job.

**Path Parameters**

| Parameter | Type | Description       |
| --------- | ---- | ----------------- |
| `id`      | uuid | The job's UUID    |

**Query Parameters**

| Parameter   | Type    | Description                                                                  |
| ----------- | ------- | ---------------------------------------------------------------------------- |
| `page`      | integer | Page number (default: 1)                                                     |
| `page_size` | integer | Items per page (default: 30, max: 100)                                       |
| `status`    | string  | Filter: `UNATTEMPTED`, `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `FAILED` |

---

### Candidates

#### Create Candidate

**Endpoint**: `POST /partners/candidates/`

Creates a new candidate for a job. Optionally generates an interview link.

**Request Body Parameters**

| Parameter          | Type    | Required | Description                                                     |
| ------------------ | ------- | -------- | --------------------------------------------------------------- |
| `job_id`           | uuid    | Yes      | The job to associate the candidate with                         |
| `first_name`       | string  | Yes      | Candidate's first name                                          |
| `last_name`        | string  | Yes      | Candidate's last name                                           |
| `email`            | string  | Yes      | Candidate's email address                                       |
| `phone_number`     | string  | No       | Phone number                                                    |
| `linkedin_url`     | string  | No       | LinkedIn profile URL                                            |
| `resume`           | string  | No       | Resume URL                                                      |
| `status`           | string  | No       | Initial status (default: `SHORTLISTED`)                         |
| `create_interview` | boolean | No       | If `true`, creates an interview link for the candidate          |

**Important**: When `create_interview` is `true`, the job must have an active interview configuration. The candidate status is automatically set to `INVITED` when an interview is created.

---

#### List Candidates

**Endpoint**: `GET /partners/candidates/`

Lists all candidates across all the organization's jobs.

**Query Parameters**

| Parameter   | Type    | Description                                                                                                      |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `page`      | integer | Page number (default: 1)                                                                                         |
| `page_size` | integer | Items per page (default: 30, max: 100)                                                                           |
| `job_id`    | uuid    | Filter by specific job                                                                                           |
| `status`    | string  | Filter: `APPLIED`, `SHORTLISTED`, `INVITED`, `INTERVIEWING`, `COMPLETED_INTERVIEW`, `OFFER_ACCEPTED`, `REJECTED` |
| `search`    | string  | Search by first name, last name, or email                                                                        |

---

#### Get Candidate Details

**Endpoint**: `GET /partners/candidates/{id}/`

Retrieves detailed information about a specific candidate, including interview ID and hiring recommendation.

**Path Parameters**

| Parameter | Type | Description            |
| --------- | ---- | ---------------------- |
| `id`      | uuid | The candidate's UUID   |

---

#### Update Candidate

**Endpoint**: `PATCH /partners/candidates/{id}/`

Updates a candidate's information. Only the provided fields are updated.

**Path Parameters**

| Parameter | Type | Description            |
| --------- | ---- | ---------------------- |
| `id`      | uuid | The candidate's UUID   |

**Request Body Parameters** (all optional)

| Parameter      | Type   | Description                                                                                                      |
| -------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `status`       | string | New status: `APPLIED`, `SHORTLISTED`, `INVITED`, `INTERVIEWING`, `COMPLETED_INTERVIEW`, `OFFER_ACCEPTED`, `REJECTED` |
| `first_name`   | string | Updated first name                                                                                               |
| `last_name`    | string | Updated last name                                                                                                |
| `email`        | string | Updated email address                                                                                            |
| `phone_number` | string | Updated phone number                                                                                             |
| `linkedin_url` | string | Updated LinkedIn URL                                                                                             |

---

#### Delete Candidate

**Endpoint**: `DELETE /partners/candidates/{id}/`

Permanently deletes a candidate and their associated data.

**Path Parameters**

| Parameter | Type | Description            |
| --------- | ---- | ---------------------- |
| `id`      | uuid | The candidate's UUID   |

---

### Interviews

#### List Interviews

**Endpoint**: `GET /partners/interviews/`

Lists all interviews across the organization.

**Query Parameters**

| Parameter   | Type    | Description                                                                           |
| ----------- | ------- | ------------------------------------------------------------------------------------- |
| `page`      | integer | Page number (default: 1)                                                              |
| `page_size` | integer | Items per page (default: 30, max: 100)                                                |
| `job_id`    | uuid    | Filter by specific job                                                                |
| `status`    | string  | Filter: `UNATTEMPTED`, `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `FAILED` |
| `search`    | string  | Search by candidate name or email                                                     |

---

#### Get Interview Details

**Endpoint**: `GET /partners/interviews/{id}/`

Retrieves full interview details including segment sessions, competency scores, hiring recommendation, and video URLs.

**Path Parameters**

| Parameter | Type | Description             |
| --------- | ---- | ----------------------- |
| `id`      | uuid | The interview's UUID    |

---

### Segment Sessions & Transcripts

Interviews are structured into **segments** (e.g., conversation, coding, system design). Each segment has its own session with transcripts and competency scores.

#### List Segment Sessions

**Endpoint**: `GET /partners/interviews/{id}/segment-sessions/`

Returns all segment sessions for an interview, ordered by segment order.

**Path Parameters**

| Parameter | Type | Description             |
| --------- | ---- | ----------------------- |
| `id`      | uuid | The interview's UUID    |

---

#### Get Segment Transcripts

**Endpoint**: `GET /partners/interviews/{id}/segment-sessions/{session_id}/transcripts/`

Returns the paginated conversation transcript for a specific segment session.

**Path Parameters**

| Parameter    | Type | Description                    |
| ------------ | ---- | ------------------------------ |
| `id`         | uuid | The interview's UUID           |
| `session_id` | uuid | The segment session's UUID     |

**Query Parameters**

| Parameter            | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| `page`               | integer | Page number (default: 1)                                   |
| `page_size`          | integer | Items per page (default: 30, max: 100)                     |
| `item_type`          | string  | Filter: `message`, `function_call`, `function_call_output` |
| `role`               | string  | Filter: `user`, `assistant`, `system`                      |
| `exclude_item_types` | string  | Comma-separated item types to exclude                      |

---

#### Get Segment Competency Scores

**Endpoint**: `GET /partners/interviews/{id}/segment-sessions/{session_id}/competency-scores/`

Returns competency evaluation scores for a specific segment session.

**Path Parameters**

| Parameter    | Type | Description                    |
| ------------ | ---- | ------------------------------ |
| `id`         | uuid | The interview's UUID           |
| `session_id` | uuid | The segment session's UUID     |

---

## JavaScript SDK Examples

### Complete Integration Example

```javascript
class SkillораHiringAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://api.skillora.ai/v1';
    this.apiKey = config.apiKey;
    this.jwtToken = config.jwtToken;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }
    return headers;
  }

  async request(path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
      ...options,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new SkilloraAPIError(
        data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }
    if (response.status === 204) return null;
    return response.json();
  }

  // === JOBS ===

  async listJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.jobType) params.append('job_type', filters.jobType);
    if (filters.workplaceType)
      params.append('workplace_type', filters.workplaceType);

    return this.request(`/partners/jobs/?${params.toString()}`);
  }

  async getJob(jobId) {
    return this.request(`/partners/jobs/${jobId}/`);
  }

  async getJobCandidates(jobId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    return this.request(
      `/partners/jobs/${jobId}/candidates/?${params.toString()}`
    );
  }

  async getJobInterviews(jobId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.status) params.append('status', filters.status);

    return this.request(
      `/partners/jobs/${jobId}/interviews/?${params.toString()}`
    );
  }

  // === CANDIDATES ===

  async createCandidate(data) {
    return this.request('/partners/candidates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listCandidates(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.jobId) params.append('job_id', filters.jobId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    return this.request(`/partners/candidates/?${params.toString()}`);
  }

  async getCandidate(candidateId) {
    return this.request(`/partners/candidates/${candidateId}/`);
  }

  async updateCandidate(candidateId, data) {
    return this.request(`/partners/candidates/${candidateId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(candidateId) {
    return this.request(`/partners/candidates/${candidateId}/`, {
      method: 'DELETE',
    });
  }

  // === INTERVIEWS ===

  async listInterviews(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.jobId) params.append('job_id', filters.jobId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    return this.request(`/partners/interviews/?${params.toString()}`);
  }

  async getInterview(interviewId) {
    return this.request(`/partners/interviews/${interviewId}/`);
  }

  // === SEGMENT SESSIONS ===

  async getSegmentSessions(interviewId) {
    return this.request(
      `/partners/interviews/${interviewId}/segment-sessions/`
    );
  }

  async getSegmentTranscripts(interviewId, sessionId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.itemType) params.append('item_type', filters.itemType);
    if (filters.role) params.append('role', filters.role);
    if (filters.excludeItemTypes)
      params.append('exclude_item_types', filters.excludeItemTypes);

    return this.request(
      `/partners/interviews/${interviewId}/segment-sessions/${sessionId}/transcripts/?${params.toString()}`
    );
  }

  async getSegmentCompetencyScores(interviewId, sessionId) {
    return this.request(
      `/partners/interviews/${interviewId}/segment-sessions/${sessionId}/competency-scores/`
    );
  }
}
```

### Usage Examples

#### 1. List Published Jobs

```javascript
const skillora = new SkillораHiringAPI({
  baseURL: 'https://api.skillora.ai/v1',
  apiKey: 'sk_your_api_key_here',
});

const jobs = await skillora.listJobs({
  jobType: 'FULL_TIME',
  workplaceType: 'REMOTE',
});

console.log('Total jobs:', jobs.count);
jobs.results.forEach((job) => {
  console.log(`${job.title} - ${job.location}`);
});
```

#### 2. Create a Candidate with Interview Link

```javascript
const result = await skillora.createCandidate({
  job_id: 'dece7e04-b488-4b66-88cd-e3add451110b',
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@example.com',
  phone_number: '+1234567890',
  linkedin_url: 'https://linkedin.com/in/janesmith',
  resume: 'https://example.com/resume.pdf',
  create_interview: true,
});

console.log('Candidate created:', result.candidate.id);
console.log('Interview URL:', result.interview.interview_url);
```

#### 3. Track Interview Progress

```javascript
// List completed interviews for a job
const completedInterviews = await skillora.getJobInterviews(
  'dece7e04-b488-4b66-88cd-e3add451110b',
  { status: 'COMPLETED' }
);

// Get full details for a specific interview
const interview = await skillora.getInterview(
  '7f6f1725-122d-4ad4-bc53-f23a88245bd7'
);

console.log('Score:', interview.score);
console.log('Recommendation:', interview.hiring_recommendation);
console.log('Segments:', interview.segment_sessions.length);
```

#### 4. Retrieve Interview Transcripts and Scores

```javascript
const interviewId = '7f6f1725-122d-4ad4-bc53-f23a88245bd7';

// Get segment sessions
const sessions = await skillora.getSegmentSessions(interviewId);

for (const session of sessions) {
  console.log(`\nSegment: ${session.segment_type} (${session.status})`);

  // Get competency scores
  const scores = await skillora.getSegmentCompetencyScores(
    interviewId,
    session.id
  );
  scores.forEach((s) => {
    console.log(`  ${s.competency_name}: ${s.score}/${s.max_score}`);
  });

  // Get conversation transcript (messages only, exclude function calls)
  const transcripts = await skillora.getSegmentTranscripts(
    interviewId,
    session.id,
    { excludeItemTypes: 'function_call,function_call_output' }
  );

  transcripts.results.forEach((t) => {
    console.log(`  [${t.role}]: ${t.content.join(' ')}`);
  });
}
```

#### 5. Search and Filter Candidates

```javascript
// Search candidates by name across all jobs
const candidates = await skillora.listCandidates({
  search: 'Jane',
  status: 'COMPLETED_INTERVIEW',
});

// Get candidates for a specific job who have been invited
const invited = await skillora.getJobCandidates(
  'dece7e04-b488-4b66-88cd-e3add451110b',
  { status: 'INVITED' }
);
```

#### 6. Update Candidate Status

```javascript
// Move candidate to next stage
await skillora.updateCandidate('candidate-uuid', {
  status: 'OFFER_ACCEPTED',
});
```

## Response Formats

### List Jobs Response

```json
{
  "count": 12,
  "next": "https://api.skillora.ai/v1/partners/jobs/?page=2",
  "previous": null,
  "results": [
    {
      "id": "dece7e04-b488-4b66-88cd-e3add451110b",
      "title": "Senior Software Engineer",
      "description": "We are looking for...",
      "skills": ["React", "Node.js", "AWS"],
      "location": "San Francisco, CA",
      "workplace_type": "HYBRID",
      "job_type": "FULL_TIME",
      "required_yoe": 5,
      "organization": {
        "id": "org-uuid",
        "name": "Acme Corp"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T08:00:00Z"
    }
  ]
}
```

### Create Candidate Response

```json
{
  "message": "Candidate and interview created successfully",
  "candidate": {
    "id": "candidate-uuid",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone_number": "+1234567890",
    "linkedin_url": "https://linkedin.com/in/janesmith",
    "status": "INVITED",
    "resume": "https://example.com/resume.pdf",
    "job": "job-uuid",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "job": {
    "id": "job-uuid",
    "title": "Senior Software Engineer"
  },
  "organization": {
    "id": "org-uuid",
    "name": "Acme Corp"
  },
  "interview": {
    "id": "interview-uuid",
    "job_title": "Senior Software Engineer",
    "organization_name": "Acme Corp",
    "duration": 30,
    "status": "UNATTEMPTED",
    "mode": "live",
    "expires_at": "2024-02-15T10:30:00Z",
    "interview_url": "https://app.skillora.ai/interview/l/interview-uuid"
  }
}
```

### List Candidates Response

```json
{
  "count": 45,
  "next": "https://api.skillora.ai/v1/partners/candidates/?page=2",
  "previous": null,
  "results": [
    {
      "id": "candidate-uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone_number": "+1234567890",
      "status": "COMPLETED_INTERVIEW",
      "resume": "https://example.com/resume.pdf",
      "interview_id": "interview-uuid",
      "interview_mode": "live",
      "hiring_recommendation": "strong_hire"
    }
  ]
}
```

### Interview Detail Response

```json
{
  "id": "interview-uuid",
  "candidate": "candidate-uuid",
  "candidate_name": "Jane Smith",
  "candidate_email": "jane.smith@example.com",
  "job": "job-uuid",
  "job_title": "Senior Software Engineer",
  "organization_name": "Acme Corp",
  "mode": "live",
  "status": "COMPLETED",
  "max_duration": 30,
  "current_segment_order": 2,
  "total_segments": 2,
  "score": 82,
  "hiring_recommendation": "hire",
  "started_at": "2024-01-15T10:35:00Z",
  "ended_at": "2024-01-15T11:05:00Z",
  "expires_at": "2024-02-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "duration": 30,
  "segment_sessions": [
    {
      "id": "session-uuid",
      "segment_order": 1,
      "segment_type": "conversation",
      "max_duration": 20,
      "problem_statement": null,
      "status": "COMPLETED",
      "started_at": "2024-01-15T10:35:00Z",
      "ended_at": "2024-01-15T10:55:00Z",
      "elapsed_duration": 19.5,
      "competency_scores": [
        {
          "id": "score-uuid",
          "competency_id": "comp-uuid",
          "competency_name": "Technical Knowledge",
          "score": 85,
          "max_score": 100,
          "percentage_score": 85.0,
          "feedback": "Strong understanding of distributed systems...",
          "created_at": "2024-01-15T10:55:00Z"
        }
      ],
      "video_urls": [
        {
          "session_id": "lk-session-id",
          "room_name": "room-uuid",
          "started_at": "2024-01-15T10:35:00Z",
          "ended_at": "2024-01-15T10:55:00Z",
          "duration": 1200,
          "video_url": "https://s3.amazonaws.com/..."
        }
      ]
    }
  ]
}
```

### Segment Transcripts Response

```json
{
  "count": 24,
  "next": "https://api.skillora.ai/v1/partners/interviews/.../transcripts/?page=2",
  "previous": null,
  "results": [
    {
      "id": "transcript-uuid",
      "interview_segment_session": "session-uuid",
      "item_id": "item-123",
      "item_type": "message",
      "role": "assistant",
      "content": ["Tell me about your experience with distributed systems."],
      "message_content_type": "plain_text",
      "programming_language": null,
      "was_interrupted": false,
      "transcript_confidence": 0.95,
      "sequence_number": 1,
      "item_created_at": 1705312500.0,
      "start_time": 1705312500.0,
      "end_time": 1705312508.0,
      "created_at": "2024-01-15T10:35:00Z"
    },
    {
      "id": "transcript-uuid-2",
      "interview_segment_session": "session-uuid",
      "item_id": "item-124",
      "item_type": "message",
      "role": "user",
      "content": [
        "In my previous role at Amazon, I designed a microservices architecture..."
      ],
      "message_content_type": "plain_text",
      "programming_language": null,
      "was_interrupted": false,
      "transcript_confidence": 0.92,
      "sequence_number": 2,
      "item_created_at": 1705312510.0,
      "start_time": 1705312510.0,
      "end_time": 1705312540.0,
      "created_at": "2024-01-15T10:35:10Z"
    }
  ]
}
```

### Competency Scores Response

```json
[
  {
    "id": "score-uuid",
    "competency_id": "comp-uuid",
    "competency_name": "Technical Knowledge",
    "score": 85,
    "max_score": 100,
    "percentage_score": 85.0,
    "feedback": "Demonstrated strong understanding of system design principles...",
    "created_at": "2024-01-15T10:55:00Z",
    "updated_at": "2024-01-15T10:55:00Z"
  },
  {
    "id": "score-uuid-2",
    "competency_id": "comp-uuid-2",
    "competency_name": "Communication",
    "score": 78,
    "max_score": 100,
    "percentage_score": 78.0,
    "feedback": "Clear articulation of technical concepts...",
    "created_at": "2024-01-15T10:55:00Z",
    "updated_at": "2024-01-15T10:55:00Z"
  }
]
```

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "error": "No valid fields to update. Allowed: email, first_name, last_name, linkedin_url, phone_number, status"
}
```

#### 401 Unauthorized

```json
{
  "error": "Invalid or expired API key"
}
```

#### 403 Forbidden

```json
{
  "error": "Organization does not have hiring permissions"
}
```

#### 404 Not Found

```json
{
  "error": "Interview not found"
}
```

### Error Handling Implementation

```javascript
class SkilloraAPIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'SkilloraAPIError';
    this.status = status;
    this.response = response;
  }
}

try {
  const result = await skillora.getInterview(interviewId);
  console.log('Success:', result);
} catch (error) {
  if (error instanceof SkilloraAPIError) {
    switch (error.status) {
      case 400:
        console.error('Invalid request:', error.message);
        break;
      case 401:
        console.error('Authentication failed:', error.message);
        break;
      case 403:
        console.error('Permission denied:', error.message);
        break;
      case 404:
        console.error('Not found:', error.message);
        break;
      default:
        console.error('API error:', error.message);
    }
  }
}
```

## Best Practices

### 1. Authentication Security

```javascript
// Server-side only - never expose API keys in client code
const skillora = new SkillораHiringAPI({
  apiKey: process.env.SKILLORA_API_KEY,
});
```

### 2. Efficient Data Fetching

```javascript
// Use job-scoped endpoints when you know the job
const candidates = await skillora.getJobCandidates(jobId, {
  status: 'COMPLETED_INTERVIEW',
});

// Use org-wide endpoints for cross-job views
const allInterviews = await skillora.listInterviews({
  status: 'COMPLETED',
});
```

### 3. Paginate Through Large Result Sets

```javascript
async function getAllCandidates(skillora, jobId) {
  let allCandidates = [];
  let page = 1;

  while (true) {
    const response = await skillora.getJobCandidates(jobId, {
      page,
      pageSize: 100,
    });
    allCandidates.push(...response.results);

    if (!response.next) break;
    page++;
  }

  return allCandidates;
}
```

### 4. Webhook Integration

Use webhooks to receive real-time updates when interviews are completed:

```javascript
// Express.js webhook handler
app.post('/skillora-webhook', express.json(), (req, res) => {
  const { event, data } = req.body;

  switch (event) {
    case 'interview.completed':
      // Fetch full interview details
      const interview = await skillora.getInterview(data.interview_id);
      console.log('Recommendation:', interview.hiring_recommendation);
      break;
    case 'interview.started':
      console.log('Interview started:', data.interview_id);
      break;
  }

  res.status(200).json({ received: true });
});
```

### 5. Hiring Recommendation Thresholds

Interview scores map to hiring recommendations based on the job's interview config:

| Score Range | Recommendation     |
| ----------- | ------------------ |
| 85-100      | `strong_hire`      |
| 70-84       | `hire`             |
| 55-69       | `conditional_hire` |
| 0-54        | `no_hire`          |

These thresholds are configurable per job via the interview configuration.

## Support

### Getting Help

- **Documentation**: This guide covers all public hiring API endpoints
- **Email Support**: support@skillora.ai
- **Response Time**: Within 24 hours for technical inquiries

### Common Integration Scenarios

1. **Applicant Tracking Systems (ATS)**: Sync candidates and interview results into your ATS
2. **HR Platforms**: Automate interview scheduling as part of hiring workflows
3. **Recruitment Agencies**: Manage candidates and track interview outcomes across jobs
4. **Career Portals**: Embed interview links directly in job application flows

### API Versioning

The current API version is `v1`. All endpoints include the version in the URL path. We maintain backward compatibility and will announce breaking changes well in advance.

### Usage Limits

- **Rate Limiting**: 100 requests per minute per API key/token
- **Request Size**: Maximum 10MB per request
- **Pagination**: Default 30 items per page, max 100

---

_This documentation is maintained by the Skillora team. Last updated: April 2026_
