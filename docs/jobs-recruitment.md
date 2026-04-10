# Skillora Partner Integration API - Jobs & Recruitment

A comprehensive guide for integrating Skillora's Job Interview and Resume-based Interview API into your JavaScript applications. This API supports both API key and JWT token authentication methods.

This document covers **JOB** and **RESUME** focus areas. For skill-based, university, and behavioral interviews, see [Mock Interviews](./mock-interviews.md).

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
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

| Method | Endpoint                                   | Description                       |
| ------ | ------------------------------------------ | --------------------------------- |
| POST   | `/partners/mock-interviews/`               | Create a job/resume interview     |
| GET    | `/partners/mock-interviews/`               | List interviews                   |
| GET    | `/partners/mock-interviews/{id}/`          | Get specific interview            |
| DELETE | `/partners/mock-interviews/{id}/`          | Delete an interview               |
| GET    | `/partners/mock-interviews/{id}/messages/` | Get interview messages/transcript |

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

### Create Job/Resume Interview

**Endpoint**: `POST /partners/mock-interviews/`

Creates a new job-focused or resume-based interview session.

#### Focus Areas (This Document)

1. **JOB** - Job-specific interview
2. **RESUME** - Resume-based interview

For **SKILL**, **UNIVERSITY**, and **BEHAVIOURAL** focus areas, see [Mock Interviews](./mock-interviews.md).

#### Request Body Parameters

| Parameter    | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `email`      | string | Yes\*    | User email (required for API key auth)              |
| `focus_area` | string | Yes      | One of: JOB, RESUME                                |

**Focus-specific parameters:**

**For JOB focus area:**

- `job_title` (string, required)
- `job_description` (string, required)
- `years_of_experience` (integer, required)
- `industry` (string, optional)
- `target_company` (string, optional)
- `resume` (string, optional, plain text containing resume content)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)
- `interviewer_gender` (one of male or female, optional, default: female)
- `language` (string, optional, specifies interview language; default: `'en-us'`. Supported values are:
  - `'en-us'` (English (US))
  - `'en-uk'` (English (UK))
  - `'en-in'` (English (Indian))
  - `'en-au'` (English (Australian))
  - `'hi'` (Hindi)
  - `'ta'` (Tamil)
  - `'bn'` (Bengali)
  - `'te'` (Telugu)
  - `'gu'` (Gujarati)
  - `'kn'` (Kannada)
  - `'ml'` (Malayalam)
  - `'mr'` (Marathi)
  - `'pa'` (Punjabi)  
    )

**For RESUME focus area:**

- `resume` (string, required, plain text containing resume content)
- `target_company` (string, optional)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)
- `interviewer_gender` (one of male or female, optional, default: female)
- `language` (string, optional, specifies interview language; default: `'en-us'`. Supported values are:
  - `'en-us'` (English (US))
  - `'en-uk'` (English (UK))
  - `'en-in'` (English (Indian))
  - `'en-au'` (English (Australian))
  - `'hi'` (Hindi)
  - `'ta'` (Tamil)
  - `'bn'` (Bengali)
  - `'te'` (Telugu)
  - `'gu'` (Gujarati)
  - `'kn'` (Kannada)
  - `'ml'` (Malayalam)
  - `'mr'` (Marathi)
  - `'pa'` (Punjabi)  
    )

### List Interviews

**Endpoint**: `GET /partners/mock-interviews/`

Lists interviews with pagination and filtering.

#### Query Parameters

| Parameter    | Type    | Description                                                       |
| ------------ | ------- | ----------------------------------------------------------------- |
| `page`       | integer | Page number (default: 1)                                          |
| `page_size`  | integer | Items per page (default: 20, max: 100)                            |
| `status`     | string  | Filter by status: UNATTEMPTED, IN_PROGRESS, COMPLETED, INCOMPLETE |
| `focus_area` | string  | Filter by focus area: JOB, RESUME                                 |

### Get Interview Details

**Endpoint**: `GET /partners/mock-interviews/{id}/`

Retrieves detailed information about a specific interview.

### Delete Interview

**Endpoint**: `DELETE /partners/mock-interviews/{id}/`

Deletes a specific interview.

### Get Interview Messages

**Endpoint**: `GET /partners/mock-interviews/{id}/messages/`

Retrieves the conversation messages/transcript from an interview session.

#### Query Parameters for Video URLs

| Parameter            | Type    | Description                                                       |
| -------------------- | ------- | ----------------------------------------------------------------- |
| `include_video_urls` | boolean | Set to `true` to include presigned video URLs ready for embedding |
| `page`               | integer | Page number (default: 1)                                          |
| `page_size`          | integer | Items per page (default: 20, max: 100)                            |

**Important**:

- By default, only `video_url` (S3 key) is returned to optimize performance
- Add `?include_video_urls=true` to get `video_presigned_url` field with ready-to-use URLs
- Presigned URLs expire in 1 hour and are cached for 50 minutes

## JavaScript SDK Examples

### Complete Integration Example

```javascript
class SkilliraAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://api.skillora.ai/v1';
    this.apiKey = config.apiKey;
    this.jwtToken = config.jwtToken;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }

    return headers;
  }

  // Create a job-focused interview
  async createJobInterview(data) {
    const requestBody = {
      focus_area: 'JOB',
      job_title: data.jobTitle,
      job_description: data.jobDescription,
      years_of_experience: data.yearsOfExperience,
      industry: data.industry,
      target_company: data.targetCompany,
      resume: data.resume,
      additional_customization: data.additionalCustomization,
    };

    // Add email for API key authentication
    if (this.apiKey && data.email) {
      requestBody.email = data.email;
    }

    try {
      const response = await fetch(
        `${this.baseURL}/partners/mock-interviews/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating job interview:', error);
      throw error;
    }
  }

  // Create a resume-based interview
  async createResumeInterview(data) {
    const requestBody = {
      focus_area: 'RESUME',
      resume: data.resume,
      target_company: data.targetCompany,
      additional_customization: data.additionalCustomization,
    };

    if (this.apiKey && data.email) {
      requestBody.email = data.email;
    }

    try {
      const response = await fetch(
        `${this.baseURL}/partners/mock-interviews/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating resume interview:', error);
      throw error;
    }
  }

  // List interviews with filters
  async listInterviews(filters = {}) {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('page_size', filters.pageSize);
    if (filters.status) params.append('status', filters.status);
    if (filters.focusArea) params.append('focus_area', filters.focusArea);

    const url = `${
      this.baseURL
    }/partners/mock-interviews/?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing interviews:', error);
      throw error;
    }
  }

  // Get specific interview details
  async getInterview(interviewId) {
    try {
      const response = await fetch(
        `${this.baseURL}/partners/mock-interviews/${interviewId}/`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting interview:', error);
      throw error;
    }
  }

  // Delete an interview
  async deleteInterview(interviewId) {
    try {
      const response = await fetch(
        `${this.baseURL}/partners/mock-interviews/${interviewId}/`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw error;
    }
  }

  // Get interview messages/transcript
  async getInterviewMessages(interviewId, page = 1, includeVideoUrls = false) {
    const params = new URLSearchParams();
    params.append('page', page);

    if (includeVideoUrls) {
      params.append('include_video_urls', 'true');
    }

    try {
      const response = await fetch(
        `${
          this.baseURL
        }/partners/mock-interviews/${interviewId}/messages/?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting interview messages:', error);
      throw error;
    }
  }
}
```

### Usage Examples

#### 1. Create a Job Interview (API Key Auth)

```javascript
// Initialize with API key
const skillora = new SkilliraAPI({
  baseURL: 'https://api.skillora.ai/v1',
  apiKey: 'sk_your_api_key_here',
});

// Create a job interview
const jobInterviewData = {
  email: 'candidate@example.com', // Required for API key auth
  jobTitle: 'Senior Software Engineer',
  jobDescription:
    'We are looking for a senior software engineer with experience in React, Node.js, and AWS...',
  yearsOfExperience: 5,
  industry: 'Technology',
  targetCompany: 'Google',
  additionalCustomization: 'Focus on system design and scalability questions',
};

try {
  const result = await skillora.createJobInterview(jobInterviewData);
  console.log('Interview created:', result);

  // Access the interview URL
  const interviewUrl = result.interview_url;
  console.log('Interview URL:', interviewUrl);

  // Access organization credits (API key auth only)
  console.log('Remaining credits:', result.organization.remaining_credits);
} catch (error) {
  console.error('Failed to create interview:', error);
}
```

#### 2. Create a Resume-Based Interview

```javascript
// Initialize with JWT token
const skillora = new SkilliraAPI({
  baseURL: 'https://api.skillora.ai/v1',
  jwtToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
});

// Create a resume-based interview
const resumeInterviewData = {
  resume: 'John Doe\nSenior Software Engineer\n5 years experience in...',
  targetCompany: 'Amazon',
  additionalCustomization: 'Focus on leadership principles',
};

try {
  const result = await skillora.createResumeInterview(resumeInterviewData);
  console.log('Resume interview created:', result);
} catch (error) {
  console.error('Failed to create resume interview:', error);
}
```

#### 3. Create a Job Interview with Resume

```javascript
const jobWithResumeData = {
  email: 'candidate@example.com',
  jobTitle: 'Product Manager',
  jobDescription: 'Leading product strategy for our SaaS platform...',
  yearsOfExperience: 7,
  industry: 'SaaS',
  targetCompany: 'Stripe',
  resume: 'Jane Smith\nProduct Manager\n7 years experience in SaaS...',
  additionalCustomization: 'Focus on product strategy and metrics',
};

try {
  const result = await skillora.createJobInterview(jobWithResumeData);
  console.log('Job interview with resume created:', result);
} catch (error) {
  console.error('Failed to create interview:', error);
}
```

#### 4. List and Filter Job Interviews

```javascript
// List all job interviews
const jobInterviews = await skillora.listInterviews({
  focusArea: 'JOB',
  page: 1,
  pageSize: 20,
});

console.log('Total job interviews:', jobInterviews.pagination.total);
console.log('Interviews:', jobInterviews.results);

// Filter completed job interviews
const completedJobInterviews = await skillora.listInterviews({
  focusArea: 'JOB',
  status: 'COMPLETED',
  page: 1,
  pageSize: 10,
});

// List resume-based interviews
const resumeInterviews = await skillora.listInterviews({
  focusArea: 'RESUME',
});
```

#### 5. Get Interview Details and Messages

```javascript
const interviewId = 'uuid-of-interview';

// Get interview details
const interviewDetails = await skillora.getInterview(interviewId);
console.log('Interview details:', interviewDetails);

// Get interview messages/transcript (without video URLs - faster)
const messages = await skillora.getInterviewMessages(interviewId);
console.log('Interview messages:', messages.results);

// Get interview messages WITH video URLs for embedding
const messagesWithVideos = await skillora.getInterviewMessages(
  interviewId,
  1,
  true
);
console.log('Messages with video URLs:', messagesWithVideos.results);

// Paginate through messages if there are many
let page = 1;
let allMessages = [];
while (true) {
  const messagesPage = await skillora.getInterviewMessages(
    interviewId,
    page,
    true
  );
  allMessages.push(...messagesPage.results);

  if (!messagesPage.pagination.has_next) {
    break;
  }
  page++;
}
console.log('All messages with videos:', allMessages);
```

## Response Formats

### Create Interview Response

```json
{
  "interview_details": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user": "user-uuid",
    "score": 0,
    "status": "UNATTEMPTED",
    "created_at": "2024-01-15T10:30:00Z",
    "started_at": null,
    "ended_at": null,
    "focus_area": "JOB",
    "job_title": "Senior Software Engineer",
    "job_description": "...",
    "years_of_experience": 5,
    "industry": "Technology",
    "target_company": "Google",
    "additional_customization": "...",
    "topic": null,
    "behavioral_topic": null,
    "university": null,
    "program": null,
    "difficulty_level": null,
    "resume": null,
    "analysis": null,
    "learning_resources": {},
    "weak_areas": {},
    "strong_areas": {},
    "key_area_assessments": {}
  },
  "interview_url": "https://app.skillora.ai/embed/ai-interview/123e4567-e89b-12d3-a456-426614174000/?resume=false&status=UNATTEMPTED&header=Senior Software Engineer&organization_id=org-uuid",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "organization": {
    "id": "org-uuid",
    "name": "Your Organization",
    "remaining_credits": 95
  }
}
```

### List Interviews Response

```json
{
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user": {
        "id": "user-uuid",
        "email": "candidate@example.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "score": 85,
      "status": "COMPLETED",
      "created_at": "2024-01-15T10:30:00Z",
      "started_at": "2024-01-15T10:35:00Z",
      "focus_area": "JOB",
      "job_title": "Senior Software Engineer",
      "target_company": "Google",
      "difficulty_level": null,
      "topic": null,
      "behavioral_topic": null,
      "weak_areas": {},
      "strong_areas": {},
      "key_area_assessments": {},
      "learning_resources": {}
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "per_page": 20,
    "total": 95,
    "has_next": true,
    "has_previous": false
  },
  "organization": {
    "id": "org-uuid",
    "name": "Your Organization",
    "remaining_credits": 95
  }
}
```

### Interview Messages Response

#### Default Response (without video URLs)

```json
{
  "results": [
    {
      "id": "msg-uuid",
      "audio_url": "https://skillora.ai/media/audio/interview_audio.mp3",
      "video_url": "candidate_123/uuid_video.mp4",
      "video_presigned_url": null,
      "created_at": "2024-01-15T10:35:00Z",
      "content": "Tell me about yourself and your experience.",
      "html_content": "<p>Tell me about yourself and your experience.</p>",
      "role": "assistant",
      "analysis": "Good opening question to assess communication skills",
      "score": 0,
      "ideal_answer": "An ideal answer would include..."
    }
  ]
}
```

#### Response with Video URLs (`?include_video_urls=true`)

```json
{
  "results": [
    {
      "id": "msg-uuid",
      "audio_url": "https://skillora.ai/media/audio/interview_audio.mp3",
      "video_url": "candidate_123/uuid_video.mp4",
      "video_presigned_url": "https://answer-videos.s3.amazonaws.com/candidate_123/uuid_video.mp4?AWSAccessKeyId=...&Signature=...&Expires=...",
      "created_at": "2024-01-15T10:35:00Z",
      "content": "Tell me about yourself and your experience.",
      "html_content": "<p>Tell me about yourself and your experience.</p>",
      "role": "user",
      "analysis": "Strong response covering relevant experience",
      "score": 85,
      "ideal_answer": null
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 3,
    "per_page": 20,
    "total": 45,
    "has_next": true,
    "has_previous": false
  }
}
```

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "error": "Invalid focus_area. Must be one of: JOB, SKILL, RESUME, UNIVERSITY, BEHAVIOURAL"
}
```

#### 401 Unauthorized

```json
{
  "error": "Invalid API key"
}
```

#### 403 Forbidden

```json
{
  "error": "Organization has no mock interview credits available"
}
```

#### 404 Not Found

```json
{
  "error": "Mock assessment not found"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to create mock assessment"
}
```

### Error Handling Implementation

```javascript
class SkilliraAPIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'SkilliraAPIError';
    this.status = status;
    this.response = response;
  }
}

// Enhanced API method with proper error handling
async makeRequest(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new SkilliraAPIError(
        data.error || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SkilliraAPIError) {
      throw error;
    }
    throw new SkilliraAPIError('Network error', 0, null);
  }
}

// Usage with error handling
try {
  const result = await skillora.createJobInterview(jobData);
  console.log('Success:', result);
} catch (error) {
  if (error instanceof SkilliraAPIError) {
    switch (error.status) {
      case 400:
        console.error('Invalid request data:', error.message);
        break;
      case 401:
        console.error('Authentication failed:', error.message);
        break;
      case 403:
        console.error('No credits available:', error.message);
        break;
      case 404:
        console.error('Resource not found:', error.message);
        break;
      case 500:
        console.error('Server error:', error.message);
        break;
      default:
        console.error('API error:', error.message);
    }
  } else {
    console.error('Network error:', error.message);
  }
}
```

## Best Practices

### 1. Authentication Security

```javascript
// Store API keys securely (server-side only)
const config = {
  apiKey: process.env.SKILLORA_API_KEY, // Never expose in client-side code
  baseURL: process.env.SKILLORA_API_URL,
};

// For client-side applications, use JWT tokens
const skillora = new SkilliraAPI({
  jwtToken: userSession.accessToken,
});
```

### 2. Rate Limiting and Retries

```javascript
class SkilliraAPIWithRetry extends SkilliraAPI {
  async makeRequestWithRetry(url, options, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(url, options);
      } catch (error) {
        if (attempt === maxRetries || error.status !== 429) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
```

### 3. Caching Interview Data

```javascript
class SkilliraAPIWithCache extends SkilliraAPI {
  constructor(config) {
    super(config);
    this.cache = new Map();
  }

  async getInterviewCached(interviewId) {
    const cacheKey = `interview_${interviewId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const interview = await this.getInterview(interviewId);
    this.cache.set(cacheKey, interview);

    // Clear cache after 5 minutes
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, 5 * 60 * 1000);

    return interview;
  }
}
```

### 4. Batch Operations

```javascript
// Create multiple job interviews efficiently
async function createBatchJobInterviews(skillora, interviewsData) {
  const results = await Promise.allSettled(
    interviewsData.map((data) => skillora.createJobInterview(data))
  );

  const successful = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  const failed = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason);

  return { successful, failed };
}
```

### 5. Video Integration for Third-Party Websites

#### Basic Video Display

```javascript
// Get messages with video URLs for embedding
const messagesWithVideos = await skillora.getInterviewMessages(
  interviewId,
  1,
  true
);

// Render videos in your website
messagesWithVideos.results.forEach((message) => {
  if (message.video_presigned_url) {
    const videoElement = document.createElement('video');
    videoElement.src = message.video_presigned_url;
    videoElement.controls = true;
    videoElement.preload = 'metadata'; // Only load metadata, not full video

    // Add to your DOM
    document.getElementById('video-container').appendChild(videoElement);
  }
});
```

#### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const InterviewVideoPlayer = ({ interviewId, skillora }) => {
  const [messages, setMessages] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState({});

  useEffect(() => {
    // Load messages without videos first (faster)
    skillora.getInterviewMessages(interviewId).then(setMessages);
  }, [interviewId]);

  const loadVideoUrl = async (messageId) => {
    setLoadingVideos((prev) => ({ ...prev, [messageId]: true }));

    try {
      // Fetch video URLs on demand
      const messagesWithVideos = await skillora.getInterviewMessages(
        interviewId,
        1,
        true
      );

      const messageWithVideo = messagesWithVideos.results.find(
        (m) => m.id === messageId
      );

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                video_presigned_url: messageWithVideo.video_presigned_url,
              }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoadingVideos((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  return (
    <div className="interview-messages">
      {messages.results?.map((message) => (
        <div key={message.id} className="message">
          <p>{message.content}</p>

          {message.video_url && (
            <div className="video-section">
              {message.video_presigned_url ? (
                <video
                  src={message.video_presigned_url}
                  controls
                  preload="metadata"
                  style={{ width: '100%', maxWidth: '600px' }}
                />
              ) : (
                <button
                  onClick={() => loadVideoUrl(message.id)}
                  disabled={loadingVideos[message.id]}
                >
                  {loadingVideos[message.id] ? 'Loading...' : '▶️ Load Video'}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 6. Webhook Integration (Recommended)

While not part of the direct API, consider implementing webhooks to receive real-time updates:

```javascript
// Express.js webhook handler example
app.post('/skillora-webhook', express.json(), (req, res) => {
  const { event, data } = req.body;

  switch (event) {
    case 'interview.completed':
      handleInterviewCompleted(data);
      break;
    case 'interview.started':
      handleInterviewStarted(data);
      break;
    default:
      console.log('Unknown event:', event);
  }

  res.status(200).json({ received: true });
});

function handleInterviewCompleted(data) {
  console.log('Interview completed:', data.interview_id);
  // Update your local database, send notifications, etc.
}
```

## Support

### Getting Help

- **Documentation**: This guide covers all public API endpoints
- **Email Support**: support@skillora.ai
- **Response Time**: Within 24 hours for technical inquiries

### Common Integration Scenarios

1. **HR Platforms**: Add interview scheduling and candidate assessment to recruitment workflows
2. **Applicant Tracking Systems (ATS)**: Integrate job-specific interviews into hiring pipelines
3. **Career Services**: Provide job interview practice for career preparation
4. **Recruitment Agencies**: Offer pre-screening interviews for candidates

### API Versioning

The current API version is `v1`. All endpoints include the version in the URL path. We maintain backward compatibility and will announce breaking changes well in advance.

### Usage Limits

- **API Key Authentication**: Limited by organization credit pool
- **Rate Limiting**: 100 requests per minute per API key/token
- **Request Size**: Maximum 10MB per request
- **Response Size**: Paginated responses for large datasets

---

_This documentation is maintained by the Skillora team. Last updated: January 2024_
