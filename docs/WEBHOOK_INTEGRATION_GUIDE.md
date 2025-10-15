# Skillora Webhook Integration Guide

## Overview

Skillora provides webhooks to notify your application when important events occur, such as when interviews or mock interviews are completed. This guide covers everything you need to know to integrate with Skillora's webhook system.

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

- `interview_completed` - Triggered when a candidate completes an interview
- `mock_interview_completed` - Triggered when a user completes a mock interview

## Webhook Events

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
