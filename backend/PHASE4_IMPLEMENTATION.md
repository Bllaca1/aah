# Phase 4 - Core Match and Team APIs Implementation

## Overview

This phase implements all core business logic endpoints for matches, teams, user profiles, and social features. The implementation follows a clean architecture pattern with clear separation of concerns.

## What Was Implemented

### 1. Core Services

#### Match State Machine (`services/matchStateMachine.ts`)
- Defines valid state transitions for matches
- Enforces business rules for match operations
- Provides validation for state changes
- Includes helper functions for checking operation permissions

#### ELO Calculation Service (`services/elo.ts`)
- Implements standard ELO rating system
- Supports both individual and team ELO
- Configurable K-factors (40 for new players, 32 for experienced)
- Automatic ELO updates after match completion
- Leaderboard generation for players and teams

#### Transaction Service (`services/transaction.ts`)
- Handles all credit movements
- Wager deduction with validation
- Winnings distribution with 10% platform fee
- Match refund support
- Transaction history and statistics
- Atomic operations to ensure data consistency

#### Notification Service (`services/notification.ts`)
- Real-time notifications via EventEmitter (WebSocket ready)
- Persistent notifications in database
- Bulk notification support
- Helper functions for common notification scenarios:
  - Friend requests
  - Team invites
  - Match updates
  - Dispute notifications
- Automatic cleanup for old read notifications

### 2. Controllers

#### Match Controller (`controllers/matches.ts`)
- **GET /matches** - List matches with comprehensive filters (game, status, region, platform, wager range, team size)
- **GET /matches/:id** - Get detailed match information
- **POST /matches** - Create new match
- **PUT /matches/:id/join** - Join a match (with team selection and validation)
- **PUT /matches/:id/ready** - Mark player as ready (auto-starts when all ready)
- **PUT /matches/:id/report-result** - Report match result (triggers ELO update and winnings)
- **POST /matches/:id/dispute** - Create dispute with evidence
- **POST /matches/:id/evidence** - Submit additional evidence

Features:
- Automatic wager deduction when match starts
- Winnings distribution with platform fee
- ELO updates for all players
- Notifications for all participants
- State machine validation for all operations

#### Team Controller (`controllers/teams.ts`)
- **POST /teams** - Create team (with unique name and tag validation)
- **GET /teams/:id** - Get team details with members and ELO
- **PUT /teams/:id** - Update team (captain only)
- **POST /teams/:id/invite** - Invite user to team (captain only)
- **PUT /teams/:id/accept-invite** - Accept team invitation
- **DELETE /teams/:id/members/:userId** - Remove team member
- **DELETE /teams/:id** - Disband team (captain only)
- **GET /teams/:id/invites** - Get pending invites (captain only)
- **GET /users/me/team-invites** - Get user's team invites

Features:
- Captain-only operations with permission checks
- Invite system with notifications
- Member management
- Team statistics and ELO tracking

#### User Controller (`controllers/users.ts`)
- **GET /users/me** - Get current user profile with stats
- **PUT /users/me** - Update profile (status, game IDs)
- **GET /users/me/stats** - Get detailed statistics
- **GET /users/search** - Search users by username
- **GET /users/:username** - Get user profile by username

Features:
- Win/loss statistics
- Financial statistics (winnings, losses, profit)
- ELO ratings per game
- Good sport rating
- Game account linking (Discord, Fortnite, CS2, Brawlhalla)

#### Social Controller (`controllers/social.ts`)
- **POST /friends/request** - Send friend request
- **PUT /friends/accept/:userId** - Accept friend request
- **PUT /friends/reject/:userId** - Reject friend request
- **DELETE /friends/:friendId** - Remove friend
- **GET /friends** - Get friends list (with status filter)
- **GET /friends/requests** - Get received friend requests
- **GET /friends/requests/sent** - Get sent friend requests

Features:
- Bidirectional friendships
- Request/accept flow with notifications
- Status filtering (online, offline, all)
- Duplicate request prevention

### 3. Validation Schemas

Comprehensive Zod validation for all endpoints:
- **match.ts** - Match creation, filters, join, ready, result, dispute, evidence
- **team.ts** - Team creation, updates, invites, members
- **user.ts** - Profile updates, user search
- **social.ts** - Friend requests, management

All schemas include:
- Type validation
- String length limits
- Format validation (UUIDs, URLs)
- Enum validation
- Custom error messages

### 4. Routes

All routes are properly organized and registered:
- **routes/matches.ts** - Match endpoints
- **routes/teams.ts** - Team endpoints
- **routes/users.ts** - User endpoints
- **routes/friends.ts** - Friend/social endpoints

Routes are integrated into main Express app with proper middleware.

## Architecture Highlights

### Clean Separation of Concerns
```
Routes → Controllers → Services → Database
  ↓          ↓           ↓
Validation  Business   Data Access
            Logic
```

### Key Design Patterns

1. **Service Layer Pattern**
   - Business logic separated from controllers
   - Reusable services across different endpoints
   - Easy to test and maintain

2. **State Machine Pattern**
   - Match states managed through validated transitions
   - Prevents invalid operations
   - Clear business rules

3. **Transaction Pattern**
   - Atomic database operations
   - Rollback on failure
   - Data consistency guaranteed

4. **Event-Driven Pattern**
   - Real-time notifications via EventEmitter
   - Decoupled notification system
   - WebSocket-ready architecture

### Security Features

- JWT authentication on all protected routes
- Permission checks (captain-only operations)
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- Rate limiting (inherited from Phase 3)
- Account status validation

## File Structure

```
backend/src/
├── controllers/
│   ├── matches.ts      (8 endpoints)
│   ├── teams.ts        (9 endpoints)
│   ├── users.ts        (5 endpoints)
│   └── social.ts       (7 endpoints)
├── services/
│   ├── matchStateMachine.ts
│   ├── elo.ts
│   ├── transaction.ts
│   └── notification.ts
├── validators/
│   ├── match.ts
│   ├── team.ts
│   ├── user.ts
│   └── social.ts
└── routes/
    ├── matches.ts
    ├── teams.ts
    ├── users.ts
    └── friends.ts
```

## API Summary

**Total Endpoints Implemented: 29**

- Match endpoints: 8
- Team endpoints: 9
- User endpoints: 5
- Friend endpoints: 7

## Business Logic Highlights

### Match Lifecycle
1. **LOBBY** - Match created by host
2. **OPEN** - Players can join
3. **IN_PROGRESS** - All players ready, wagers deducted
4. **COMPLETED** - Result reported, winnings distributed, ELO updated
5. **DISPUTED** - Result contested, evidence collection begins
6. **AWAITING_ADMIN_REVIEW** - Both sides submitted evidence
7. **REFUNDED** - Match cancelled, wagers returned

### Financial Flow
1. Players join match (credit check performed)
2. All players mark ready
3. Wagers deducted from all players (atomic transaction)
4. Match played
5. Winner reports result
6. Winnings distributed: Total pot - 10% platform fee
7. Each winning player gets equal share

### ELO System
- Default starting ELO: 1000
- New players (< 30 games): K-factor = 40
- Experienced players: K-factor = 32
- Team ELO calculated from member averages
- Individual and team ELO tracked separately per game

### Team Management
- Captain creates team
- Captain invites members
- Members accept/reject invites
- Captain can remove members
- Members can leave team
- Captain can disband team
- Team wins/losses tracked
- Team ELO per game

## Testing

See `TESTING.md` for comprehensive testing guide including:
- Individual endpoint testing
- Complete workflow testing
- State machine validation
- Error handling scenarios

## Next Steps (Future Phases)

1. **Admin Panel** - Dispute resolution, user management
2. **WebSocket Integration** - Real-time match updates, chat
3. **Payment Integration** - Deposit/withdrawal system
4. **Analytics** - Advanced statistics, reports
5. **Automated Testing** - Jest/Vitest integration tests
6. **Performance Optimization** - Caching, query optimization

## Dependencies

No new external dependencies required. All functionality built using existing packages:
- Express for routing
- Prisma for database
- Zod for validation
- Node.js EventEmitter for notifications

## Acceptance Criteria Status

✅ All CRUD operations work for matches
✅ Team management flows work end-to-end
✅ Friend system fully functional
✅ Transactions recorded accurately
✅ ELO updates after match completion
✅ Match status state machine implemented
✅ Comprehensive input validation
✅ Notification system with real-time support
✅ Transaction service with atomic operations

## Notes

- All endpoints follow RESTful conventions
- Consistent error handling and response formats
- Comprehensive validation on all inputs
- Database transactions ensure data integrity
- Real-time notification architecture ready for WebSocket integration
- Scalable architecture supports future enhancements
