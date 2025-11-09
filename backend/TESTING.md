# Phase 4 - API Testing Guide

This document provides a comprehensive guide for testing all Phase 4 endpoints.

## Prerequisites

1. Ensure database is running and migrated
2. Start the backend server: `npm run dev`
3. Have a valid JWT access token (register/login first)
4. Use tools like Postman, Insomnia, or curl

## Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <your_jwt_access_token>
```

---

## 1. Match Endpoints

### 1.1 List Matches
**GET** `/matches`

Query Parameters:
- `gameId` (optional) - Filter by game UUID
- `status` (optional) - Filter by match status
- `region` (optional) - Filter by region
- `platform` (optional) - Filter by platform
- `minWager` (optional) - Minimum wager amount
- `maxWager` (optional) - Maximum wager amount
- `teamSize` (optional) - Team size (SOLO, DUO, TRIO, SQUAD, TEAM)
- `limit` (optional) - Results per page (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```bash
curl -X GET 'http://localhost:3001/matches?status=OPEN&limit=10'
```

**Expected Response:**
```json
{
  "matches": [...],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 1.2 Get Match Details
**GET** `/matches/:id`

**Example Request:**
```bash
curl -X GET 'http://localhost:3001/matches/<match_id>' \
  -H 'Authorization: Bearer <token>'
```

### 1.3 Create Match
**POST** `/matches`

**Request Body:**
```json
{
  "gameId": "uuid",
  "wager": 100,
  "teamSize": "DUO",
  "region": "NA_EAST",
  "platform": "PC",
  "teamAId": "uuid (optional)",
  "teamBId": "uuid (optional)"
}
```

**Expected Response:** Match object with status `LOBBY`

### 1.4 Join Match
**PUT** `/matches/:id/join`

**Request Body:**
```json
{
  "team": "A" // or "B"
}
```

**Expected Response:**
```json
{
  "message": "Successfully joined match",
  "team": "A"
}
```

### 1.5 Mark Ready
**PUT** `/matches/:id/ready`

**Request Body:**
```json
{
  "ready": true // or false
}
```

**Expected Response:**
- If not all ready: `{ "message": "Marked as ready" }`
- If all ready and teams full: `{ "message": "Match started!", "status": "IN_PROGRESS" }`

### 1.6 Report Result
**PUT** `/matches/:id/report-result`

**Request Body:**
```json
{
  "winningTeam": "A",
  "teamAScore": 10,
  "teamBScore": 5
}
```

**Expected Response:**
```json
{
  "message": "Match result reported successfully",
  "winningTeam": "A",
  "winnings": 900
}
```

### 1.7 Create Dispute
**POST** `/matches/:id/dispute`

**Request Body:**
```json
{
  "reason": "Opponent was cheating, I have video evidence",
  "youtubeLink": "https://youtube.com/watch?v=..." (optional)
}
```

**Expected Response:**
```json
{
  "message": "Dispute created successfully",
  "dispute": {...}
}
```

### 1.8 Submit Evidence
**POST** `/matches/:id/evidence`

**Request Body:**
```json
{
  "youtubeLink": "https://youtube.com/watch?v=...",
  "message": "Here is my proof showing the final score"
}
```

---

## 2. Team Endpoints

### 2.1 Create Team
**POST** `/teams`

**Request Body:**
```json
{
  "name": "Team Awesome",
  "tag": "TAG"
}
```

**Validation:**
- Name: 3-50 characters, alphanumeric + spaces/hyphens/underscores
- Tag: 2-6 characters, uppercase letters and numbers only

### 2.2 Get Team Details
**GET** `/teams/:id`

**Expected Response:**
```json
{
  "id": "uuid",
  "name": "Team Awesome",
  "tag": "TAG",
  "captain": {...},
  "members": [...],
  "elos": [...],
  "wins": 10,
  "losses": 5
}
```

### 2.3 Update Team
**PUT** `/teams/:id` (Captain only)

**Request Body:**
```json
{
  "name": "New Team Name" (optional),
  "tag": "NEW" (optional)
}
```

### 2.4 Invite User
**POST** `/teams/:id/invite` (Captain only)

**Request Body:**
```json
{
  "userId": "uuid"
}
```

### 2.5 Accept Team Invite
**PUT** `/teams/:id/accept-invite`

**Expected Response:**
```json
{
  "message": "Successfully joined team",
  "team": {...}
}
```

### 2.6 Remove Team Member
**DELETE** `/teams/:id/members/:userId` (Captain or self)

### 2.7 Disband Team
**DELETE** `/teams/:id` (Captain only)

### 2.8 Get Team Invites
**GET** `/teams/:id/invites` (Captain only)

### 2.9 Get My Team Invites
**GET** `/users/me/team-invites`

---

## 3. User Endpoints

### 3.1 Get My Profile
**GET** `/users/me`

**Expected Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "credits": 1000,
  "role": "USER",
  "status": "ONLINE",
  "profile": {...},
  "elos": [...],
  "stats": {
    "wins": 15,
    "losses": 8,
    "winRate": 65.22
  }
}
```

### 3.2 Update My Profile
**PUT** `/users/me`

**Request Body:**
```json
{
  "status": "AWAY",
  "discordId": "discord#1234",
  "fortniteId": "epicusername",
  "cs2Id": "steamid",
  "brawlhallaId": "brawlid"
}
```

### 3.3 Get My Stats
**GET** `/users/me/stats`

**Expected Response:**
```json
{
  "matchStats": {
    "totalMatches": 23,
    "wins": 15,
    "losses": 8,
    "winRate": 65.22
  },
  "financialStats": {
    "totalWinnings": 5000,
    "totalLosses": 2000,
    "netProfit": 3000
  },
  "elos": [...],
  "goodSportRating": 4.5
}
```

### 3.4 Search Users
**GET** `/users/search?query=john&limit=20&offset=0`

### 3.5 Get User by Username
**GET** `/users/:username`

---

## 4. Friend/Social Endpoints

### 4.1 Send Friend Request
**POST** `/friends/request`

**Request Body:**
```json
{
  "friendId": "uuid"
}
```

### 4.2 Accept Friend Request
**PUT** `/friends/accept/:userId`

### 4.3 Reject Friend Request
**PUT** `/friends/reject/:userId`

### 4.4 Remove Friend
**DELETE** `/friends/:friendId`

### 4.5 Get Friends List
**GET** `/friends?status=all&limit=50&offset=0`

Query Parameters:
- `status`: "online", "offline", or "all" (default: "all")
- `limit`: Results per page (default: 50, max: 100)
- `offset`: Pagination offset

### 4.6 Get Friend Requests
**GET** `/friends/requests` (Received requests)

### 4.7 Get Sent Friend Requests
**GET** `/friends/requests/sent`

---

## Testing Flows

### Flow 1: Complete Match Lifecycle

1. **Create a match** (User A)
   - POST `/matches` with game details and wager
   - Verify match status is `LOBBY`

2. **Join match** (User B)
   - PUT `/matches/:id/join` with team `B`
   - Verify match status changes to `OPEN`

3. **Mark ready** (Both users)
   - PUT `/matches/:id/ready` with `ready: true`
   - Verify wagers are deducted when all ready
   - Verify match status changes to `IN_PROGRESS`

4. **Report result** (Winner)
   - PUT `/matches/:id/report-result` with winning team
   - Verify winnings distributed
   - Verify ELO updated
   - Verify match status is `COMPLETED`

### Flow 2: Team Creation and Management

1. **Create team** (Captain)
   - POST `/teams` with name and tag

2. **Invite member** (Captain)
   - POST `/teams/:id/invite` with userId

3. **Accept invite** (Member)
   - GET `/users/me/team-invites` to see invite
   - PUT `/teams/:id/accept-invite` to join

4. **Remove member** (Captain)
   - DELETE `/teams/:id/members/:userId`

5. **Disband team** (Captain)
   - DELETE `/teams/:id`

### Flow 3: Friend System

1. **Search for user**
   - GET `/users/search?query=username`

2. **Send friend request**
   - POST `/friends/request` with friendId

3. **Accept request** (Recipient)
   - GET `/friends/requests` to see pending
   - PUT `/friends/accept/:userId`

4. **View friends**
   - GET `/friends`

### Flow 4: Dispute Process

1. **Create dispute** (Losing team member)
   - POST `/matches/:id/dispute` with reason and evidence
   - Verify match status changes to `DISPUTED`

2. **Submit counter-evidence** (Winning team member)
   - POST `/matches/:id/evidence` with their proof
   - Verify match status changes to `AWAITING_ADMIN_REVIEW`

3. **Admin resolves** (Requires admin endpoints - future phase)
   - Admin reviews evidence
   - Updates match to `COMPLETED` or `REFUNDED`

---

## Common Error Codes

- `400` - Bad Request (validation errors, insufficient credits, etc.)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (permission denied, e.g., non-captain trying to update team)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## State Machine Validation

### Match Status Transitions

Valid transitions:
- `LOBBY` → `OPEN`
- `OPEN` → `IN_PROGRESS`
- `OPEN` → `LOBBY`
- `IN_PROGRESS` → `COMPLETED`
- `IN_PROGRESS` → `DISPUTED`
- `DISPUTED` → `AWAITING_OPPONENT_EVIDENCE`
- `DISPUTED` → `AWAITING_ADMIN_REVIEW`
- `AWAITING_OPPONENT_EVIDENCE` → `AWAITING_ADMIN_REVIEW`
- `AWAITING_ADMIN_REVIEW` → `COMPLETED`
- `AWAITING_ADMIN_REVIEW` → `REFUNDED`
- Any non-final → `REFUNDED` (admin only)

Operations allowed by status:
- **Join**: `LOBBY`, `OPEN`
- **Ready**: `OPEN`
- **Report Result**: `IN_PROGRESS`
- **Dispute**: `IN_PROGRESS`, `COMPLETED`
- **Submit Evidence**: `DISPUTED`, `AWAITING_OPPONENT_EVIDENCE`, `AWAITING_ADMIN_REVIEW`

---

## Notes for Future Integration Testing

When setting up Jest/Vitest with supertest, test these scenarios:

1. **Authentication Tests**
   - Verify protected routes reject requests without tokens
   - Verify expired tokens are rejected

2. **Validation Tests**
   - Test invalid input for each endpoint
   - Test boundary conditions (min/max values)

3. **Business Logic Tests**
   - Test insufficient credits scenario
   - Test team size limits
   - Test duplicate team names/tags
   - Test friend request edge cases

4. **Transaction Tests**
   - Verify wagers are deducted atomically
   - Verify winnings are distributed correctly
   - Verify refunds work properly

5. **State Machine Tests**
   - Test invalid state transitions are rejected
   - Test state-specific operations

6. **Notification Tests**
   - Verify notifications are created
   - Test real-time event emission

7. **ELO Tests**
   - Verify ELO calculations are correct
   - Test new player K-factor
   - Test team ELO updates
