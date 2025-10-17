# Skillora Partner Integration API

A comprehensive guide for integrating Skillora's Mock Interview API into your JavaScript applications. This API supports both API key and JWT token authentication methods.

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
| POST   | `/partners/mock-interviews/`               | Create a mock interview           |
| GET    | `/partners/mock-interviews/`               | List mock interviews              |
| GET    | `/partners/mock-interviews/{id}/`          | Get specific mock interview       |
| DELETE | `/partners/mock-interviews/{id}/`          | Delete a mock interview           |
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

### Create Mock Interview

**Endpoint**: `POST /partners/mock-interviews/`

Creates a new mock interview session. Different focus areas require different parameters.

#### Focus Areas

1. **JOB** - Job-specific interview
2. **SKILL** - Skill/topic-based interview
3. **RESUME** - Resume-based interview
4. **UNIVERSITY** - University admission interview
5. **BEHAVIOURAL** - Behavioral interview

#### Request Body Parameters

| Parameter    | Type   | Required | Description                                         |
| ------------ | ------ | -------- | --------------------------------------------------- |
| `email`      | string | Yes\*    | User email (required for API key auth)              |
| `focus_area` | string | Yes      | One of: JOB, SKILL, RESUME, UNIVERSITY, BEHAVIOURAL |

**Focus-specific parameters:**

**For JOB focus area:**

- `job_title` (string, required)
- `job_description` (string, required)
- `years_of_experience` (integer, required)
- `industry` (string, optional)
- `target_company` (string, optional)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)

**For SKILL focus area:**

- `topic` (string, required)
- `difficulty_level` (integer, optional: 1=Easy, 2=Medium, 3=Hard)
- `target_company` (string, optional)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)

**For UNIVERSITY focus area:**

- `university` (string, required)
- `program` (string, required)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)

**For BEHAVIOURAL focus area:**

- `behavioral_topic` (string, required)
- `job_title` (string, optional)
- `job_description` (string, optional)
- `years_of_experience` (integer, optional)
- `industry` (string, optional)
- `target_company` (string, optional)
- `additional_customization` (string, optional)
- `number_of_questions` (integer, optional, min: 1, max: 10, default: 10)

### List Mock Interviews

**Endpoint**: `GET /partners/mock-interviews/`

Lists mock interviews with pagination and filtering.

#### Query Parameters

| Parameter    | Type    | Description                                                       |
| ------------ | ------- | ----------------------------------------------------------------- |
| `page`       | integer | Page number (default: 1)                                          |
| `page_size`  | integer | Items per page (default: 20, max: 100)                            |
| `status`     | string  | Filter by status: UNATTEMPTED, IN_PROGRESS, COMPLETED, INCOMPLETE |
| `focus_area` | string  | Filter by focus area: JOB, TOPIC, RESUME, UNIVERSITY, BEHAVIORAL  |

### Get Mock Interview Details

**Endpoint**: `GET /partners/mock-interviews/{id}/`

Retrieves detailed information about a specific mock interview.

### Delete Mock Interview

**Endpoint**: `DELETE /partners/mock-interviews/{id}/`

Deletes a specific mock interview.

### Get Interview Messages

**Endpoint**: `GET /partners/mock-interviews/{id}/messages/`

Retrieves the conversation messages/transcript from a mock interview session.

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

  // Create a job-focused mock interview
  async createJobInterview(data) {
    const requestBody = {
      focus_area: 'JOB',
      job_title: data.jobTitle,
      job_description: data.jobDescription,
      years_of_experience: data.yearsOfExperience,
      industry: data.industry,
      target_company: data.targetCompany,
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

  // Create a skill-focused mock interview
  async createSkillInterview(data) {
    const requestBody = {
      focus_area: 'SKILL',
      topic: data.topic,
      difficulty_level: data.difficultyLevel,
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
      console.error('Error creating skill interview:', error);
      throw error;
    }
  }

  // Create a behavioral interview
  async createBehavioralInterview(data) {
    const requestBody = {
      focus_area: 'BEHAVIOURAL',
      behavioral_topic: data.behavioralTopic,
      job_title: data.jobTitle,
      job_description: data.jobDescription,
      years_of_experience: data.yearsOfExperience,
      industry: data.industry,
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
      console.error('Error creating behavioral interview:', error);
      throw error;
    }
  }

  // List mock interviews with filters
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

  // Get specific mock interview details
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

  // Delete a mock interview
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

#### 1. API Key Authentication Example

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

#### 2. JWT Token Authentication Example

```javascript
// Initialize with JWT token
const skillora = new SkilliraAPI({
  baseURL: 'https://api.skillora.ai/v1',
  jwtToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
});

// Create a skill-based interview
const skillInterviewData = {
  // No email required for JWT auth
  topic: 'JavaScript Advanced Concepts',
  difficultyLevel: 3, // Hard
  targetCompany: 'Meta',
  additionalCustomization:
    'Focus on closures, prototypes, and async programming',
};

try {
  const result = await skillora.createSkillInterview(skillInterviewData);
  console.log('Skill interview created:', result);
} catch (error) {
  console.error('Failed to create skill interview:', error);
}
```

#### 3. Create University Interview

```javascript
const universityInterviewData = {
  email: 'student@example.com', // Required for API key auth
  university: 'Stanford University',
  program: 'Computer Science PhD',
  additionalCustomization:
    'Focus on research experience and academic background',
};

const skillora = new SkilliraAPI({
  baseURL: 'https://api.skillora.ai/v1',
  apiKey: 'sk_your_api_key_here',
});

try {
  const response = await fetch(
    `${skillora.baseURL}/partners/mock-interviews/`,
    {
      method: 'POST',
      headers: skillora.getHeaders(),
      body: JSON.stringify({
        focus_area: 'UNIVERSITY',
        ...universityInterviewData,
      }),
    }
  );

  const result = await response.json();
  console.log('University interview created:', result);
} catch (error) {
  console.error('Error:', error);
}
```

#### 4. List and Filter Interviews

```javascript
// List all interviews with pagination
const interviews = await skillora.listInterviews({
  page: 1,
  pageSize: 20,
});

console.log('Total interviews:', interviews.pagination.total);
console.log('Interviews:', interviews.results);

// Filter by status
const completedInterviews = await skillora.listInterviews({
  status: 'COMPLETED',
  page: 1,
  pageSize: 10,
});

// Filter by focus area
const jobInterviews = await skillora.listInterviews({
  focusArea: 'JOB',
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
// Create multiple interviews efficiently
async function createBatchInterviews(skillora, interviewsData) {
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

#### Optimized Video Loading Strategy

```javascript
class VideoManager {
  constructor(skillora) {
    this.skillora = skillora;
    this.videoCache = new Map();
  }

  // Lazy load videos only when user clicks play
  async setupLazyVideoLoading(interviewId, containerId) {
    // First, get messages without video URLs (faster)
    const messages = await this.skillora.getInterviewMessages(interviewId);

    messages.results.forEach((message) => {
      if (message.video_url) {
        this.createVideoPlaceholder(message, containerId);
      }
    });
  }

  createVideoPlaceholder(message, containerId) {
    const container = document.getElementById(containerId);

    // Create video placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'video-placeholder';
    placeholder.innerHTML = `
      <div class="video-thumbnail">
        <button onclick="this.loadVideo('${message.id}')">
          ▶️ Play Video Response
        </button>
        <small>Click to load video</small>
      </div>
    `;

    placeholder.loadVideo = async (messageId) => {
      if (this.videoCache.has(messageId)) {
        this.showVideo(placeholder, this.videoCache.get(messageId));
        return;
      }

      // Fetch video URL on demand
      const messagesWithVideos = await this.skillora.getInterviewMessages(
        message.mock_assessment,
        1,
        true
      );

      const messageWithVideo = messagesWithVideos.results.find(
        (m) => m.id === messageId
      );
      if (messageWithVideo?.video_presigned_url) {
        this.videoCache.set(messageId, messageWithVideo.video_presigned_url);
        this.showVideo(placeholder, messageWithVideo.video_presigned_url);
      }
    };

    container.appendChild(placeholder);
  }

  showVideo(placeholder, videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.maxWidth = '600px';

    placeholder.innerHTML = '';
    placeholder.appendChild(video);
  }
}

// Usage
const videoManager = new VideoManager(skillora);
await videoManager.setupLazyVideoLoading(interviewId, 'interview-container');
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

1. **Learning Management Systems (LMS)**: Integrate interview creation and results into your course platforms
2. **HR Platforms**: Add interview scheduling and candidate assessment to recruitment workflows
3. **Educational Apps**: Provide interview practice as part of career preparation tools
4. **Corporate Training**: Create customized interview simulations for employee development

### API Versioning

The current API version is `v1`. All endpoints include the version in the URL path. We maintain backward compatibility and will announce breaking changes well in advance.

### Usage Limits

- **API Key Authentication**: Limited by organization credit pool
- **Rate Limiting**: 100 requests per minute per API key/token
- **Request Size**: Maximum 10MB per request
- **Response Size**: Paginated responses for large datasets

---

_This documentation is maintained by the Skillora team. Last updated: January 2024_
