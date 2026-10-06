# Skillora Webhook Integration Guide

## Overview

Skillora provides webhooks to notify your application when important events occur, such as when a job is created, updated or deleted, when a candidate's resume analysis is ready, or when interviews and mock interviews are completed. This guide covers everything you need to know to integrate with Skillora's webhook system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Webhook Events](#webhook-events)
3. [Webhook Payloads](#webhook-payloads)
4. [Security & Verification](#security--verification)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### 1. Create a Webhook Endpoint

To receive webhooks, you need to create a webhook endpoint in your Skillora organization.

**Endpoint:** `POST /api/v1/webhook-endpoints/`

**Request Body:**

```json
{
  "url": "https://your-domain.com/webhooks/skillora",
  "events": ["interview_completed", "mock_interview_completed"],
  "description": "Production webhook endpoint",
  "secret": "your-custom-secret-key" // Optional - will be auto-generated if not provided
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://your-domain.com/webhooks/skillora",
  "events": ["interview_completed", "mock_interview_completed"],
  "description": "Production webhook endpoint",
  "is_active": true,
  "secret": "generated-secret-key-here", // Only returned on creation
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "last_triggered_at": null,
  "total_deliveries": 0,
  "failed_deliveries": 0
}
```

### 2. Available Events

Currently, Skillora supports the following webhook events:

- `job_created` - Triggered when a job is created (draft or published)
- `job_updated` - Triggered when a job is edited or published
- `job_deleted` - Triggered when a job is deleted
- `resume_analysis_completed` - Triggered when a candidate's resume has been screened and the analysis report is ready
- `interview_completed` - Triggered when a candidate completes an interview
- `mock_interview_completed` - Triggered when a user completes a mock interview

The subscription key (for example `job_created`) is what you put in an endpoint's `events` list and what arrives in the `X-Webhook-Event` header. Unknown event names are rejected with a 400 when you create or update an endpoint.

## Webhook Events

### Job Created Event

**Event Type:** `job_created`

**Triggered When:** A job is created in your organization, from the dashboard or the API. Jobs created as drafts fire this event too; check `is_draft`.

**Payload Structure:**

```json
{
  "event": "job.created",
  "timestamp": "2026-10-06T10:15:00+00:00",
  "data": {
    "job_id": "625f8f83-1e09-4b0b-9dde-37c17f692311",
    "job_url": "https://app.skillora.ai/org/jobs/625f8f83-1e09-4b0b-9dde-37c17f692311",
    "organization_id": "cefe8bf1-0f7b-4736-9b7a-a73bca68c1e5",
    "title": "Senior Backend Engineer",
    "description": "<p>Build Django APIs.</p>",
    "skills": ["Python", "Django"],
    "location": "Remote",
    "workplace_type": "REMOTE",
    "job_type": "FULL_TIME",
    "required_yoe": 3,
    "is_draft": false,
    "created_at": "2026-10-06T10:15:00+00:00",
    "updated_at": "2026-10-06T10:15:00+00:00"
  }
}
```

**Field Descriptions:**

- `job_id`: Unique identifier for the job
- `job_url`: Link to the job in the Skillora dashboard
- `description`: Job description as HTML
- `workplace_type`: One of `ON_SITE`, `HYBRID`, `REMOTE`
- `job_type`: One of `FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `FRACTIONAL`, `VOLUNTEER`, `INTERNSHIP`
- `required_yoe`: Required years of experience
- `is_draft`: `true` while the job is unpublished

### Job Updated Event

**Event Type:** `job_updated`

**Triggered When:** A job's details change, including publishing a draft (`is_draft` changes from `true` to `false`). Saving a job without changing anything does not send an event.

**Payload Structure:** The same `data` fields as `job_created`, showing the job after the change, plus:

```json
{
  "event": "job.updated",
  "timestamp": "2026-10-06T11:02:00+00:00",
  "data": {
    "job_id": "625f8f83-1e09-4b0b-9dde-37c17f692311",
    "title": "Senior Backend Engineer",
    "location": "London, UK",
    "...": "all other job_created fields",
    "changed_fields": ["location"],
    "previous_values": {
      "location": "Remote"
    }
  }
}
```

**Field Descriptions:**

- `changed_fields`: Which of `title`, `description`, `skills`, `location`, `workplace_type`, `job_type`, `is_draft`, `required_yoe` changed
- `previous_values`: The value of each changed field before the update

### Job Deleted Event

**Event Type:** `job_deleted`

**Triggered When:** A job is deleted. The job's candidates and interviews are deleted with it.

**Payload Structure:** A snapshot of the job as it was when deleted (the same `data` fields as `job_created`), with `job_url` set to `null` and a `deleted_at` timestamp:

```json
{
  "event": "job.deleted",
  "timestamp": "2026-10-06T12:30:00+00:00",
  "data": {
    "job_id": "625f8f83-1e09-4b0b-9dde-37c17f692311",
    "job_url": null,
    "title": "Senior Backend Engineer",
    "...": "all other job_created fields",
    "deleted_at": "2026-10-06T12:30:00+00:00"
  }
}
```

### Resume Analysis Completed Event

**Event Type:** `resume_analysis_completed`

**Triggered When:** A candidate's resume has been scored against the job's Resume Screening criteria and the report is ready. This only happens for jobs with an active Resume Screening configuration, and covers every candidate with a resume, including those you create through `POST /partners/candidates/` with a resume URL or file. It fires again each time a candidate is re-screened (for example after the criteria change), and every run has its own `analysis_id`. Keep the latest `completed_at` per `candidate_id` if you only want the current report.

**Payload Structure:**

```json
{
  "event": "resume_analysis.completed",
  "timestamp": "2026-10-06T10:20:00+00:00",
  "data": {
    "analysis_id": "0b7c2f9e-3a8d-4f61-9b2e-6c1d4e5f7a80",
    "candidate_id": "8d2e4f6a-1b3c-4d5e-9f7a-2b4c6d8e0f12",
    "job_id": "625f8f83-1e09-4b0b-9dde-37c17f692311",
    "job_title": "Senior Backend Engineer",
    "job_url": "https://app.skillora.ai/org/jobs/625f8f83-1e09-4b0b-9dde-37c17f692311",
    "candidate": {
      "id": "8d2e4f6a-1b3c-4d5e-9f7a-2b4c6d8e0f12",
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada@example.com",
      "phone_number": "+44 20 7946 0000",
      "linkedin_url": "https://www.linkedin.com/in/example",
      "status": "SHORTLISTED"
    },
    "overall_score": 78.0,
    "recommendation": "MATCH",
    "confidence": 0.8,
    "must_haves_passed": 3,
    "must_haves_total": 3,
    "preferred_score": 76.0,
    "signal_score": 70.0,
    "disqualifier_triggered": false,
    "disqualifier_reasons": [],
    "red_flags": [
      {
        "criterion_id": "4f5a6b7c-8d9e-4f0a-b1c2-d3e4f5a6b7c8",
        "name": "Frequent job changes",
        "reason": "Three roles in the last two years."
      }
    ],
    "strength_summary": "Strong Python and Django background with production API work.",
    "gap_summary": "Limited evidence of system design at scale.",
    "criteria_evaluations": [
      {
        "criterion_id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
        "name": "3+ years Python",
        "category": "MUST_HAVE",
        "criterion_type": "NUMERIC",
        "points": 40,
        "pass_status": "PASS",
        "score": 10.0,
        "justification": "Five years of Python across two roles.",
        "evidence_quote": "Backend Engineer (Python/Django), 2021 to present"
      }
    ],
    "screening_config": {
      "id": "9e8d7c6b-5a4f-4e3d-8c2b-1a0f9e8d7c6b",
      "version": 2
    },
    "completed_at": "2026-10-06T10:20:00+00:00"
  }
}
```

**Field Descriptions:**

- `analysis_id`: Unique identifier for this screening run
- `overall_score`: Screening score (0-100)
- `recommendation`: One of `STRONG_MATCH`, `MATCH`, `STRETCH`, `NO_MATCH`
- `confidence`: Model confidence (0-1), reduced for each red flag
- `must_haves_passed` / `must_haves_total`: Must-have criteria met out of total
- `preferred_score` / `signal_score`: Percentage achieved on preferred and signal criteria
- `disqualifier_triggered`: `true` when a disqualifier matched; the score is then capped and the recommendation is `NO_MATCH`
- `red_flags`: Advisory warnings; they never change the score or recommendation
- `criteria_evaluations`: Per-criterion verdict. `category` is one of `MUST_HAVE`, `PREFERRED`, `SIGNAL`, `RED_FLAG`, `DISQUALIFIER`; `pass_status` is one of `PASS`, `PARTIAL`, `FAIL`, `UNKNOWN`; `score` is 0-10
- `screening_config`: The screening criteria version the candidate was scored against

### Interview Completed Event

**Event Type:** `interview_completed`

**Triggered When:** A candidate completes an interview assessment

**Payload Structure:**

```json
{
  "event": "interview.completed",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "interview_id": "123e4567-e89b-12d3-a456-426614174000",
    "interview_results_url": "https://skillora.ai/jobs/job-id/interview-id",
    "candidate_id": "456e7890-e89b-12d3-a456-426614174001",
    "job_id": "789e0123-e89b-12d3-a456-426614174002",
    "score": 85,
    "status": "completed",
    "hiring_recommendation": "recommended",
    "completed_at": "2024-01-15T14:25:00Z"
  }
}
```

**Field Descriptions:**

- `interview_id`: Unique identifier for the interview
- `interview_results_url`: Direct link to view interview results
- `candidate_id`: ID of the candidate who took the interview
- `job_id`: ID of the job position
- `score`: Interview score (0-100)
- `status`: Interview status
- `hiring_recommendation`: AI-generated hiring recommendation
- `completed_at`: Timestamp when interview was completed

### Mock Interview Completed Event

**Event Type:** `mock_interview_completed`

**Triggered When:** A user completes a mock interview

**Payload Structure:**

```json
{
  "event": "mock_interview_completed",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user": {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com"
    },
    "score": 78,
    "status": "completed",
    "number_of_questions": 10,
    "number_of_answered_questions": 9,
    "number_of_skipped_questions": 1,
    "created_at": "2024-01-15T14:00:00Z",
    "started_at": "2024-01-15T14:05:00Z",
    "ended_at": "2024-01-15T14:25:00Z",
    "topic": "Software Engineering",
    "behavioral_topic": "Leadership",
    "job_title": "Senior Software Engineer",
    "job_description": "Full-stack development role...",
    "years_of_experience": "5-7",
    "industry": "Technology",
    "difficulty_level": "Intermediate",
    "focus_area": "Technical Skills",
    "target_company": "Tech Corp",
    "university": "MIT",
    "program": "Computer Science",
    "interview_experience": "Some experience",
    "additional_customization": "Focus on system design",
    "resume": {
      "skills": ["Python", "JavaScript", "React"],
      "experience": "5 years"
    },
    "analysis": "Strong technical skills with good communication...",
    "learning_resources": [
      {
        "title": "System Design Interview",
        "url": "https://example.com/resource1"
      }
    ],
    "weak_areas": ["System Design", "Algorithms"],
    "strong_areas": ["Communication", "Problem Solving"],
    "key_area_assessments": {
      "technical": 8,
      "behavioral": 7,
      "communication": 9
    },
    "config": {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "name": "Software Engineering Assessment"
    }
  }
}
```

## Security & Verification

### Webhook Signatures

All webhook requests include a signature header that you can use to verify the request authenticity.

**Signature Header:** `X-Webhook-Signature-256`

**Format:** `sha256=<signature>`

### Verifying Signatures

Here's how to verify webhook signatures in different languages:

#### Python Example

```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature_header, secret):
    """
    Verify webhook signature.
    signature_header should be in format: sha256=<signature>
    """
    if not signature_header or not signature_header.startswith('sha256='):
        return False

    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    received_signature = signature_header.replace('sha256=', '')

    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected_signature, received_signature)

# Usage
payload = request.body.decode('utf-8')
signature = request.headers.get('X-Webhook-Signature-256')
secret = 'your-webhook-secret'

if verify_webhook_signature(payload, signature, secret):
    # Process webhook
    pass
else:
    # Reject webhook
    return HttpResponse('Unauthorized', status=401)
```

#### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const receivedSignature = signatureHeader.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

// Usage
const payload = req.body;
const signature = req.headers['x-webhook-signature-256'];
const secret = 'your-webhook-secret';

if (verifyWebhookSignature(JSON.stringify(payload), signature, secret)) {
  // Process webhook
} else {
  res.status(401).send('Unauthorized');
}
```

### Additional Headers

Each webhook request includes these headers:

- `Content-Type: application/json`
- `User-Agent: Skillora-Webhook/1.0`
- `X-Webhook-Signature-256: sha256=<signature>`
- `X-Webhook-Event: <event_type>`
- `X-Webhook-Delivery: <timestamp>`

## API Reference

### Webhook Endpoints Management

#### List Webhook Endpoints

**GET** `/api/v1/webhook-endpoints/`

Returns all webhook endpoints for your organization.

#### Create Webhook Endpoint

**POST** `/api/v1/webhook-endpoints/`

Creates a new webhook endpoint.

#### Update Webhook Endpoint

**PUT/PATCH** `/api/v1/webhook-endpoints/{id}/`

Updates an existing webhook endpoint.

#### Delete Webhook Endpoint

**DELETE** `/api/v1/webhook-endpoints/{id}/`

Deletes a webhook endpoint.

#### Test Webhook Endpoint

**POST** `/api/v1/webhook-endpoints/{id}/test/`

Sends a test webhook to verify your endpoint is working.

**Response:**

```json
{
  "status": "success",
  "message": "Test webhook sent successfully"
}
```

#### Regenerate Secret

**POST** `/api/v1/webhook-endpoints/{id}/regenerate_secret/`

Generates a new secret for the webhook endpoint.

**Response:**

```json
{
  "status": "success",
  "message": "Secret regenerated successfully",
  "secret": "new-secret-key-here"
}
```

### Webhook Events

#### List Webhook Events

**GET** `/api/v1/webhook-events/`

Returns all webhook events for your organization.

**Query Parameters:**

- `event_type`: Filter by event type

#### Get Event Deliveries

**GET** `/api/v1/webhook-events/{id}/deliveries/`

Returns all delivery attempts for a specific event.

### Webhook Deliveries

#### List Webhook Deliveries

**GET** `/api/v1/webhook-deliveries/`

Returns all webhook delivery attempts.

**Query Parameters:**

- `endpoint_id`: Filter by endpoint ID
- `status`: Filter by delivery status (`pending`, `success`, `failed`, `retrying`)

#### Retry Failed Delivery

**POST** `/api/v1/webhook-deliveries/{id}/retry/`

Manually retry a failed webhook delivery.

## Testing

### 1. Test Your Endpoint

Use the test endpoint to verify your webhook handler:

```bash
curl -X POST "https://api.skillora.ai/api/v1/webhook-endpoints/{endpoint-id}/test/" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Test Payload

The test webhook sends this payload:

```json
{
  "event": "test",
  "timestamp": "2025-09-30T00:00:00Z",
  "data": {
    "message": "This is a test webhook from Skillora"
  }
}
```

### 3. Local Development

For local development, use tools like ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL for your webhook endpoint
# Example: https://abc123.ngrok.io/webhooks/skillora
```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Received

**Check:**

- Endpoint URL is accessible from the internet
- Endpoint returns HTTP 200-299 status code
- Webhook endpoint is active (`is_active: true`)
- Correct event types are subscribed

#### 2. Signature Verification Fails

**Check:**

- Using the correct secret key
- Computing signature on the raw request body
- Using HMAC-SHA256 algorithm
- Signature format: `sha256=<hex_signature>`

#### 3. Delivery Failures

**Common Causes:**

- Endpoint returns non-2xx status code
- Request timeout (30 seconds)
- Network connectivity issues
- Invalid JSON response

### Retry Logic

Skillora automatically retries failed webhook deliveries:

- **Max Attempts:** 3
- **Retry Delays:** 1 minute, 5 minutes, 30 minutes (exponential backoff)
- **Retry Conditions:** HTTP errors, timeouts, network issues

### Monitoring

Monitor your webhook deliveries through the API:

```bash
# Check delivery status
curl "https://api.skillora.ai/api/v1/webhook-deliveries/?status=failed" \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Check endpoint statistics
curl "https://api.skillora.ai/api/v1/webhook-endpoints/" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### Best Practices

1. **Idempotency:** Make your webhook handlers idempotent to handle duplicate deliveries
2. **Quick Response:** Return HTTP 200 quickly, process data asynchronously
3. **Logging:** Log all webhook requests for debugging
4. **Error Handling:** Return appropriate HTTP status codes
5. **Security:** Always verify webhook signatures
6. **Testing:** Use the test endpoint to verify your implementation

### Support

If you encounter issues with webhook integration:

1. Check the webhook delivery logs in your Skillora dashboard
2. Verify your endpoint is accessible and returns proper responses
3. Contact support with specific error messages and webhook delivery IDs

## Example Implementation

### Express.js Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.raw({ type: 'application/json' }));

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

app.post('/webhooks/skillora', (req, res) => {
  const signature = req.headers['x-webhook-signature-256'];
  const secret = process.env.SKILLORA_WEBHOOK_SECRET;

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).send('Unauthorized');
  }

  const payload = JSON.parse(req.body);

  // Process webhook based on event type
  switch (payload.event) {
    case 'interview.completed':
      handleInterviewCompleted(payload.data);
      break;
    case 'mock_interview_completed':
      handleMockInterviewCompleted(payload.data);
      break;
    default:
      console.log('Unknown event type:', payload.event);
  }

  res.status(200).send('OK');
});

function handleInterviewCompleted(data) {
  console.log('Interview completed:', data.interview_id);
  // Your business logic here
}

function handleMockInterviewCompleted(data) {
  console.log('Mock interview completed:', data.id);
  // Your business logic here
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Django Webhook Handler

```python
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import hmac
import hashlib
import os

@csrf_exempt
@require_http_methods(["POST"])
def skillora_webhook(request):
    # Get signature from headers
    signature = request.META.get('HTTP_X_WEBHOOK_SIGNATURE_256')
    secret = os.environ.get('SKILLORA_WEBHOOK_SECRET')

    # Verify signature
    if not verify_signature(request.body, signature, secret):
        return HttpResponse('Unauthorized', status=401)

    # Parse payload
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return HttpResponse('Invalid JSON', status=400)

    # Process webhook
    event_type = payload.get('event')
    data = payload.get('data', {})

    if event_type == 'interview.completed':
        handle_interview_completed(data)
    elif event_type == 'mock_interview_completed':
        handle_mock_interview_completed(data)

    return HttpResponse('OK', status=200)

def verify_signature(payload, signature_header, secret):
    if not signature_header or not signature_header.startswith('sha256='):
        return False

    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()

    received_signature = signature_header.replace('sha256=', '')

    return hmac.compare_digest(expected_signature, received_signature)

def handle_interview_completed(data):
    print(f"Interview completed: {data['interview_id']}")
    # Your business logic here

def handle_mock_interview_completed(data):
    print(f"Mock interview completed: {data['id']}")
    # Your business logic here
```

---

This documentation provides everything you need to integrate with Skillora's webhook system. For additional support or questions, please contact our development team.
