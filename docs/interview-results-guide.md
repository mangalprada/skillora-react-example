# Skillora Partner Guide - Understanding Interview Results

A detailed guide for partners on how Skillora structures interview data, how entities relate to each other, and how to retrieve and display interview results in your application.

This guide is **technology-agnostic** -- the concepts and API calls work with any language or framework. Examples use plain HTTP for clarity.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Entity Relationship Model](#entity-relationship-model)
3. [The Interview Lifecycle](#the-interview-lifecycle)
4. [Data Retrieval Walkthrough](#data-retrieval-walkthrough)
5. [API Reference](#api-reference)
6. [Building an Interview Results Page](#building-an-interview-results-page)
7. [Field Reference](#field-reference)
8. [Common Patterns](#common-patterns)

---

## Core Concepts

Before diving into the API, here is how Skillora models the hiring workflow. Understanding these five entities is key to working with the data:

### Job

A **Job** represents an open position at your organization (e.g., "Senior Software Engineer"). Jobs hold the description, required skills, location, and type. Only published (non-draft) jobs are visible through the partner API.

### Candidate

A **Candidate** is a person associated with a specific Job. The same person applying to two different jobs would be two separate Candidate records. Each Candidate tracks their own status through the hiring pipeline (`APPLIED` -> `SHORTLISTED` -> `INVITED` -> `INTERVIEWING` -> `COMPLETED_INTERVIEW` -> `OFFER_ACCEPTED` or `REJECTED`).

### Interview

An **Interview** is a single interview instance linking one Candidate to one Job. There can only be **one interview per candidate per job**. An interview has:

- A **status** that progresses from `UNATTEMPTED` through `IN_PROGRESS` to `COMPLETED`
- A **mode** (`basic` for async self-recorded, `live` for real-time AI conversation)
- A **score** (0-100) calculated after completion
- A **hiring recommendation** (`strong_hire`, `hire`, `conditional_hire`, `no_hire`) derived from the score

When an Interview is created, it captures a snapshot of the configuration at that moment (mode, number of segments, max duration). This means results are always evaluated against the rules that were active when the interview was created, even if the configuration changes later.

### Segment Session

An Interview is divided into one or more **Segment Sessions**. Each segment is an independent round of the interview with its own type, time limit, and evaluation criteria. Segment types include:

| Segment Type    | Description                                         |
| --------------- | --------------------------------------------------- |
| `conversation`  | Free-flowing AI voice interview on a subject        |
| `coding`        | Coding challenge in a code editor                   |
| `debugging`     | Debug buggy code in a code editor                   |
| `system_design` | System design with screen sharing or whiteboard     |

For example, an interview might have:
- Segment 1: `conversation` (20 min) -- Behavioral and technical questions
- Segment 2: `coding` (25 min) -- Live coding challenge

Each segment session tracks its own status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`, `TIMED_OUT`), duration, video recording, and competency scores.

### Competency Score

Each segment evaluates the candidate on specific **Competencies** (e.g., "Problem Solving", "Communication", "Code Quality"). After the interview, each competency receives:

- A **score** out of a **max_score** (typically 100)
- A **percentage_score**
- Written **feedback** explaining the evaluation

The interview's overall `score` and `hiring_recommendation` are derived from the aggregated competency scores across all segments.

### Transcript

The **Transcript** is the full conversation log for a segment session. Each transcript entry contains:

- **role**: Who said it -- `user` (the candidate), `assistant` (the AI interviewer), or `system`
- **content**: The actual text (an array of strings)
- **item_type**: `message` for conversation, `function_call` / `function_call_output` for code execution in coding segments
- **sequence_number**: The order in the conversation
- Timing information (`start_time`, `end_time`) for audio/video synchronization

---

## Entity Relationship Model

```
Organization
  |
  +-- Job (many)
       |
       +-- Candidate (many)
       |     |
       |     +-- Interview (one per candidate-job pair)
       |           |
       |           +-- Segment Session (one per segment in the config)
       |                 |
       |                 +-- Transcript entries (many, ordered by sequence_number)
       |                 +-- Competency Scores (one per competency)
       |                 +-- Video Recording URLs
       |
       +-- Interview Config (one active per job)
             |
             +-- Interview Segments (ordered, define structure)
                   |
                   +-- Competencies (evaluation criteria)
```

Key constraints:
- One Candidate record per email per Job (unique together)
- One Interview per Candidate per Job (unique together)
- One active Interview Config per Job at a time
- Competency names are unique within a segment

---

## The Interview Lifecycle

```
1. CREATE CANDIDATE          POST /partners/candidates/
   with create_interview=true     (status: APPLIED/SHORTLISTED)
         |
         v
2. INTERVIEW CREATED         Interview status: UNATTEMPTED
   (link sent to candidate)   Candidate status: INVITED
         |
         v
3. CANDIDATE OPENS LINK      Interview status: NOT_STARTED
         |
         v
4. INTERVIEW IN PROGRESS     Interview status: IN_PROGRESS
   (segments run in order)    Each segment: NOT_STARTED -> IN_PROGRESS -> COMPLETED
         |
         v
5. INTERVIEW COMPLETED       Interview status: COMPLETED
   (AI generates analysis)    score, hiring_recommendation, competency scores populated
         |                    Candidate status: COMPLETED_INTERVIEW
         v
6. RESULTS AVAILABLE         Retrieve via GET /partners/interviews/{id}/
```

### Timing Notes

- After the candidate finishes, **analysis takes 1-3 minutes** to complete. The `score`, `hiring_recommendation`, and competency scores are populated asynchronously.
- Interviews can have an `expires_at` timestamp. After expiry, the candidate can no longer access the interview link.
- If an interview was started but never completed after 2+ hours, it can be manually marked as completed (triggering analysis on whatever data exists).

---

## Data Retrieval Walkthrough

This section walks through retrieving complete interview results step by step.

### Authentication

All requests require an `Authorization` header:

```
Authorization: Bearer sk_your_api_key_here
```

### Base URL

```
Production: https://api.skillora.ai/v1
Development: http://localhost:8000/v1
```

### Step 1: Get the Interview

```
GET /partners/interviews/{interview_id}/
```

This returns the full interview object with nested segment sessions and competency scores:

```json
{
  "id": "7f6f1725-122d-4ad4-bc53-f23a88245bd7",
  "candidate": "candidate-uuid",
  "candidate_name": "Jane Smith",
  "candidate_email": "jane@example.com",
  "job": "dece7e04-b488-4b66-88cd-e3add451110b",
  "job_title": "Senior Software Engineer",
  "organization_name": "Acme Corp",
  "mode": "live",
  "status": "COMPLETED",
  "max_duration": 45,
  "current_segment_order": 2,
  "total_segments": 2,
  "score": 82,
  "hiring_recommendation": "hire",
  "started_at": "2024-01-15T10:35:00Z",
  "ended_at": "2024-01-15T11:15:00Z",
  "expires_at": "2024-02-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "duration": 40,
  "segment_sessions": [
    {
      "id": "session-uuid-1",
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
          "id": "score-uuid-1",
          "competency_id": "comp-uuid-1",
          "competency_name": "Technical Knowledge",
          "score": 85,
          "max_score": 100,
          "percentage_score": 85.0,
          "feedback": "Strong understanding of distributed systems...",
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
          "feedback": "Clear articulation but could provide more structure...",
          "created_at": "2024-01-15T10:55:00Z",
          "updated_at": "2024-01-15T10:55:00Z"
        }
      ],
      "video_urls": [
        {
          "session_id": "lk-session-id",
          "room_name": "room-uuid",
          "started_at": "2024-01-15T10:35:00Z",
          "ended_at": "2024-01-15T10:55:00Z",
          "duration": 1200,
          "video_url": "https://s3.amazonaws.com/...presigned-url..."
        }
      ]
    },
    {
      "id": "session-uuid-2",
      "segment_order": 2,
      "segment_type": "coding",
      "max_duration": 25,
      "problem_statement": "Implement a function that finds the shortest path...",
      "status": "COMPLETED",
      "started_at": "2024-01-15T10:56:00Z",
      "ended_at": "2024-01-15T11:15:00Z",
      "elapsed_duration": 19.0,
      "competency_scores": [
        {
          "id": "score-uuid-3",
          "competency_id": "comp-uuid-3",
          "competency_name": "Problem Solving",
          "score": 80,
          "max_score": 100,
          "percentage_score": 80.0,
          "feedback": "Good algorithmic thinking, arrived at optimal solution...",
          "created_at": "2024-01-15T11:15:00Z",
          "updated_at": "2024-01-15T11:15:00Z"
        },
        {
          "id": "score-uuid-4",
          "competency_id": "comp-uuid-4",
          "competency_name": "Code Quality",
          "score": 88,
          "max_score": 100,
          "percentage_score": 88.0,
          "feedback": "Clean, well-structured code with proper naming...",
          "created_at": "2024-01-15T11:15:00Z",
          "updated_at": "2024-01-15T11:15:00Z"
        }
      ],
      "video_urls": [
        {
          "session_id": "lk-session-id-2",
          "room_name": "room-uuid-2",
          "started_at": "2024-01-15T10:56:00Z",
          "ended_at": "2024-01-15T11:15:00Z",
          "duration": 1140,
          "video_url": "https://s3.amazonaws.com/...presigned-url..."
        }
      ]
    }
  ]
}
```

**This single call gives you everything you need for an overview**: the interview status, overall score, hiring recommendation, and per-segment competency scores with feedback.

### Step 2: Get Segment Transcripts (optional, per segment)

If you want to display the full conversation for a segment:

```
GET /partners/interviews/{interview_id}/segment-sessions/{session_id}/transcripts/
```

Transcripts are paginated. Use `page` and `page_size` query parameters:

```
GET /partners/interviews/7f6f.../segment-sessions/session-uuid-1/transcripts/?page=1&page_size=50
```

Response:

```json
{
  "count": 24,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "transcript-uuid-1",
      "item_type": "message",
      "role": "assistant",
      "content": ["Hi Jane! Welcome to your interview for the Senior Software Engineer role at Acme Corp. Let's start by talking about your experience with distributed systems."],
      "message_content_type": "plain_text",
      "programming_language": null,
      "was_interrupted": false,
      "transcript_confidence": 0.95,
      "sequence_number": 1,
      "start_time": 1705312500.0,
      "end_time": 1705312512.0,
      "created_at": "2024-01-15T10:35:00Z"
    },
    {
      "id": "transcript-uuid-2",
      "item_type": "message",
      "role": "user",
      "content": ["In my previous role, I designed a microservices architecture that handled 50,000 requests per second..."],
      "message_content_type": "plain_text",
      "programming_language": null,
      "was_interrupted": false,
      "transcript_confidence": 0.92,
      "sequence_number": 2,
      "start_time": 1705312514.0,
      "end_time": 1705312545.0,
      "created_at": "2024-01-15T10:35:14Z"
    }
  ]
}
```

#### Filtering Transcripts

| Parameter            | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `item_type`          | Show only this type: `message`, `function_call`, `function_call_output` |
| `role`               | Show only this role: `user`, `assistant`, `system`               |
| `exclude_item_types` | Comma-separated types to hide (e.g., `function_call,function_call_output`) |

**Tip**: For a clean conversation view, exclude function calls:

```
GET .../transcripts/?exclude_item_types=function_call,function_call_output
```

### Step 3: Get Competency Scores (standalone endpoint)

If you only need scores for a single segment without the full interview detail:

```
GET /partners/interviews/{interview_id}/segment-sessions/{session_id}/competency-scores/
```

Response:

```json
[
  {
    "id": "score-uuid-1",
    "competency_id": "comp-uuid-1",
    "competency_name": "Technical Knowledge",
    "score": 85,
    "max_score": 100,
    "percentage_score": 85.0,
    "feedback": "Strong understanding of distributed systems...",
    "created_at": "2024-01-15T10:55:00Z",
    "updated_at": "2024-01-15T10:55:00Z"
  }
]
```

---

## API Reference

### Pagination

All list endpoints use the same pagination format:

| Parameter   | Type    | Default | Max | Description            |
| ----------- | ------- | ------- | --- | ---------------------- |
| `page`      | integer | 1       | --  | Page number            |
| `page_size` | integer | 30      | 100 | Results per page       |

Paginated responses include:

```json
{
  "count": 95,
  "next": "https://api.skillora.ai/v1/partners/...?page=2",
  "previous": null,
  "results": [...]
}
```

Check `next` -- if it is `null`, you have all the data. If it is a URL, there are more pages.

### Endpoints Summary

#### Jobs

| Method | Endpoint                          | Description                        |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/partners/jobs/`                 | List published jobs                |
| GET    | `/partners/jobs/{id}/`            | Get single job                     |
| GET    | `/partners/jobs/{id}/candidates/` | List candidates for a job          |
| GET    | `/partners/jobs/{id}/interviews/` | List interviews for a job          |

**Job list filters**: `job_type` (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `TEMPORARY`, `VOLUNTEER`, `INTERNSHIP`), `workplace_type` (`ON_SITE`, `HYBRID`, `REMOTE`)

#### Candidates

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/partners/candidates/`        | Create a candidate     |
| GET    | `/partners/candidates/`        | List all candidates    |
| GET    | `/partners/candidates/{id}/`   | Get candidate details  |
| PATCH  | `/partners/candidates/{id}/`   | Update candidate       |
| DELETE | `/partners/candidates/{id}/`   | Delete candidate       |

**Candidate list filters**: `job_id`, `status`, `search` (searches first name, last name, email)

**Candidate statuses**: `APPLIED`, `SHORTLISTED`, `INVITED`, `INTERVIEWING`, `COMPLETED_INTERVIEW`, `OFFER_ACCEPTED`, `REJECTED`

#### Interviews

| Method | Endpoint                                                                      | Description                          |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------ |
| GET    | `/partners/interviews/`                                                       | List all interviews                  |
| GET    | `/partners/interviews/{id}/`                                                  | Get full interview details           |
| GET    | `/partners/interviews/{id}/segment-sessions/`                                 | List segment sessions                |
| GET    | `/partners/interviews/{id}/segment-sessions/{session_id}/transcripts/`        | Get conversation transcript          |
| GET    | `/partners/interviews/{id}/segment-sessions/{session_id}/competency-scores/`  | Get competency scores                |

**Interview list filters**: `job_id`, `status`, `search` (searches candidate name, email)

**Interview statuses**: `UNATTEMPTED`, `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `FAILED`

---

## Building an Interview Results Page

This section describes how to assemble a complete interview results view, regardless of your technology stack.

### Recommended Approach: Two API Calls

For most use cases, you only need **two calls** to build a full results page:

**Call 1 -- Interview Detail** (always needed):

```
GET /partners/interviews/{interview_id}/
```

This returns everything in a single nested response:
- Interview metadata (status, score, recommendation, timestamps)
- Candidate info (name, email)
- Job info (title, organization)
- All segment sessions with their competency scores and video URLs

**Call 2 -- Segment Transcripts** (only if you want to display conversation):

```
GET /partners/interviews/{interview_id}/segment-sessions/{session_id}/transcripts/?page=1&page_size=50
```

Call this for whichever segment the user selects. If your interview has 3 segments, you only need to fetch transcripts for the segment the user is currently viewing.

### Page Layout Suggestion

```
+----------------------------------------------------------+
| HEADER                                                    |
| Job Title -- Candidate Name                              |
| Status Badge | Email | Started At | Ended At             |
+----------------------------------------------------------+

+----------------------------------------------------------+
| HIRING RECOMMENDATION                                     |
| [Strong Hire / Hire / Conditional Hire / No Hire]         |
| Overall Score: 82/100  [=======>      ] 82%               |
+----------------------------------------------------------+

+----------------------------------------------------------+
| COMPETENCY SCORES (from segment_sessions[*].competency_scores) |
|                                                          |
| Technical Knowledge     85/100  [========>  ] 85%        |
|   > "Strong understanding of distributed systems..."     |
|                                                          |
| Communication           78/100  [=======>   ] 78%        |
|   > "Clear articulation but could provide more..."       |
|                                                          |
| Problem Solving         80/100  [========>  ] 80%        |
|   > "Good algorithmic thinking..."                       |
+----------------------------------------------------------+

+----------------------------------------------------------+
| VIDEO RECORDING (from segment_sessions[*].video_urls)     |
| [Video Player]                                            |
+----------------------------------------------------------+

+----------------------------------------------------------+
| SEGMENT TABS (if multiple segments)                       |
| [ Session 1 (Conversation) ] [ Session 2 (Coding) ]      |
+----------------------------------------------------------+

+----------------------------------------------------------+
| TRANSCRIPT (fetched separately per selected segment)      |
|                                                          |
| AI:   "Tell me about your experience with..."            |
| User: "In my previous role, I designed..."               |
| AI:   "That's interesting. Can you elaborate on..."      |
| User: "Sure, the key challenge was..."                   |
|                                                          |
| [Load More] (pagination)                                  |
+----------------------------------------------------------+
```

### Implementation Steps

#### 1. Fetch Interview Detail

Make one GET request. Parse the response to extract:

- `status`, `score`, `hiring_recommendation` for the header
- `candidate_name`, `candidate_email`, `job_title` for context
- `segment_sessions` array for the segment tabs and scores
- `segment_sessions[n].video_urls` for video playback

#### 2. Aggregate Competency Scores

Each segment session has its own `competency_scores` array. To show an overall report, you can either:

- **Show per-segment**: Display scores grouped under their segment (useful when segments test different skills)
- **Show aggregated**: Sum scores across all segments for a total

To calculate a total:

```
total_score = sum of all competency_scores[*].score across all segments
total_max   = sum of all competency_scores[*].max_score across all segments
percentage  = (total_score / total_max) * 100
```

#### 3. Build Segment Tabs

If `segment_sessions.length > 1`, render tabs. Each tab shows:

- Segment type (`conversation`, `coding`, etc.)
- Segment status
- Duration (`elapsed_duration` is in minutes)

When the user clicks a tab, fetch transcripts for that segment's session ID.

#### 4. Fetch and Display Transcripts

Transcripts are paginated. Implement pagination or infinite scroll:

1. Fetch page 1: `GET .../transcripts/?page=1&page_size=50`
2. Check the `next` field in the response
3. If `next` is not null, there are more pages -- fetch them as the user scrolls

For display:
- `role: "assistant"` = AI interviewer messages (display on the left)
- `role: "user"` = Candidate messages (display on the right)
- `role: "system"` = System messages (display centered, subdued)
- `content` is an array of strings -- join them or render each item separately
- For `message_content_type: "code"`, render as a code block with `programming_language` as the language hint

#### 5. Display Video

`video_urls` is an array on each segment session. Each entry includes:

- `video_url`: A presigned S3 URL (valid for 1 hour, cached for 50 minutes)
- `started_at`, `ended_at`, `duration`: Timing metadata

Embed the URL in a standard video player. If your page stays open for more than an hour, re-fetch the interview detail to get fresh presigned URLs.

### Hiring Recommendation Thresholds

The `hiring_recommendation` is derived from the interview's `score` using configurable thresholds:

| Score Range        | Recommendation       | Meaning                                            |
| ------------------ | -------------------- | -------------------------------------------------- |
| >= 85 (default)    | `strong_hire`        | Excellent fit, highly recommended                  |
| >= 70 (default)    | `hire`               | Meets requirements, recommended                    |
| >= 55 (default)    | `conditional_hire`   | May fit with reservations, further evaluation needed |
| < 55 (default)     | `no_hire`            | Not suitable for the role at this time             |

These thresholds are configurable per job through the interview configuration. The values above are defaults.

---

## Field Reference

### Interview Object

| Field                    | Type      | Description                                                        |
| ------------------------ | --------- | ------------------------------------------------------------------ |
| `id`                     | uuid      | Unique interview identifier                                        |
| `candidate`              | uuid      | Candidate ID                                                       |
| `candidate_name`         | string    | Full name of the candidate                                         |
| `candidate_email`        | string    | Email of the candidate                                             |
| `job`                    | uuid      | Job ID                                                             |
| `job_title`              | string    | Title of the job                                                   |
| `organization_name`      | string    | Organization name                                                  |
| `mode`                   | string    | `basic` or `live`                                                  |
| `status`                 | string    | Current interview status                                           |
| `max_duration`           | number    | Maximum allowed duration in minutes                                |
| `current_segment_order`  | integer   | Which segment the candidate is on (1-indexed)                      |
| `total_segments`         | integer   | Total number of segments                                           |
| `score`                  | integer   | Overall score (0-100), populated after completion                  |
| `hiring_recommendation`  | string    | `strong_hire`, `hire`, `conditional_hire`, or `no_hire`            |
| `started_at`             | datetime  | When the candidate started (null if not started)                   |
| `ended_at`               | datetime  | When the interview ended (null if not ended)                       |
| `expires_at`             | datetime  | When the interview link expires (null if no expiry)                |
| `created_at`             | datetime  | When the interview was created                                     |
| `duration`               | integer   | Actual duration in minutes (null if not started/ended)             |
| `segment_sessions`       | array     | List of segment session objects (see below)                        |

### Segment Session Object

| Field                | Type      | Description                                                      |
| -------------------- | --------- | ---------------------------------------------------------------- |
| `id`                 | uuid      | Unique session identifier                                        |
| `segment_order`      | integer   | Position in the interview (1, 2, 3...)                           |
| `segment_type`       | string    | `conversation`, `coding`, `debugging`, `system_design`           |
| `max_duration`       | number    | Maximum allowed duration in minutes                              |
| `problem_statement`  | string    | Problem description (for coding/debugging segments, null otherwise) |
| `status`             | string    | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`, `TIMED_OUT` |
| `started_at`         | datetime  | When the segment started                                         |
| `ended_at`           | datetime  | When the segment ended                                           |
| `elapsed_duration`   | number    | Actual duration in minutes                                       |
| `competency_scores`  | array     | List of competency score objects (see below)                     |
| `video_urls`         | array     | List of video recording objects (see below)                      |

### Competency Score Object

| Field              | Type    | Description                                   |
| ------------------ | ------- | --------------------------------------------- |
| `id`               | uuid    | Unique score identifier                       |
| `competency_id`    | uuid    | ID of the competency being evaluated          |
| `competency_name`  | string  | Human-readable name (e.g., "Problem Solving") |
| `score`            | integer | Score achieved                                |
| `max_score`        | integer | Maximum possible score (typically 100)        |
| `percentage_score` | number  | Percentage as a float (e.g., 85.0)            |
| `feedback`         | string  | Detailed written evaluation of performance    |
| `created_at`       | datetime | When the score was generated                  |
| `updated_at`       | datetime | When the score was last updated               |

### Transcript Object

| Field                  | Type     | Description                                               |
| ---------------------- | -------- | --------------------------------------------------------- |
| `id`                   | uuid     | Unique transcript entry identifier                        |
| `item_type`            | string   | `message`, `function_call`, or `function_call_output`     |
| `role`                 | string   | `user` (candidate), `assistant` (AI), or `system`         |
| `content`              | string[] | Array of content strings (join for display)               |
| `message_content_type` | string   | `plain_text` or `code`                                    |
| `programming_language` | string   | Language hint for code content (e.g., `python`, `javascript`) |
| `was_interrupted`      | boolean  | Whether the speaker was interrupted                       |
| `transcript_confidence`| number   | Speech-to-text confidence (0.0 to 1.0)                    |
| `sequence_number`      | integer  | Order in the conversation (use for sorting)               |
| `start_time`           | number   | Start time as Unix timestamp (seconds)                    |
| `end_time`             | number   | End time as Unix timestamp (seconds)                      |
| `function_name`        | string   | Name of function called (for `function_call` items)       |
| `function_output`      | string   | Result of function call (for `function_call_output` items)|
| `created_at`           | datetime | Server timestamp when recorded                            |

### Video URL Object

| Field        | Type     | Description                                           |
| ------------ | -------- | ----------------------------------------------------- |
| `session_id` | string   | LiveKit session identifier                            |
| `room_name`  | string   | Room identifier                                       |
| `started_at` | datetime | When the recording started                            |
| `ended_at`   | datetime | When the recording ended                              |
| `duration`   | number   | Duration in seconds                                   |
| `video_url`  | string   | Presigned S3 URL (expires in 1 hour, cached 50 min)   |

---

## Common Patterns

### Polling for Interview Completion

If you need to know when an interview completes, poll the interview detail endpoint:

```
GET /partners/interviews/{id}/
```

Check `status == "COMPLETED"` and `hiring_recommendation != null`. The recommendation is populated asynchronously after the interview ends, so it may be null for a few minutes even after status becomes `COMPLETED`.

Recommended polling interval: every 30-60 seconds. Alternatively, set up a [webhook](./WEBHOOK_INTEGRATION_GUIDE.md) for real-time notifications.

### Listing Completed Interviews for a Job

```
GET /partners/jobs/{job_id}/interviews/?status=COMPLETED
```

This returns only completed interviews, each with their score and hiring recommendation -- useful for building a ranked candidate list.

### Searching Candidates Across Jobs

```
GET /partners/candidates/?search=jane&status=COMPLETED_INTERVIEW
```

This searches by name or email across all jobs in your organization.

### Handling Multiple Segments

When rendering results for multi-segment interviews, use `segment_order` to display segments in the correct order. Each segment has independent competency scores -- a candidate might score 90% in conversation but 60% in coding.

### Video URL Expiry

Presigned video URLs expire after 1 hour. If your application keeps a page open longer than that:

1. Re-fetch the interview detail or segment session to get fresh URLs
2. Replace the video source in your player

The backend caches presigned URLs for 50 minutes, so re-fetching within that window returns the same cached URL instantly.

---

## Support

- **API Documentation**: [Jobs & Recruitment API](./jobs-recruitment.md) | [Mock Interviews API](./mock-interviews.md) | [Webhooks](./WEBHOOK_INTEGRATION_GUIDE.md)
- **Email**: support@skillora.ai
- **Response Time**: Within 24 hours for technical inquiries

---

_This documentation is maintained by the Skillora team. Last updated: April 2026_
