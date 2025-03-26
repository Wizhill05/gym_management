# Gym Management System

A comprehensive web application for managing gym operations, including member registration, membership management, and attendance tracking.

## Features

- **Dashboard**: View key metrics and statistics about gym operations
- **Member Management**: Register new members and view member information
- **Membership Management**: Create and manage memberships with different types and payment statuses
- **Attendance Tracking**: Record and monitor member check-ins

## Database Schema

```
erDiagram
    MEMBER ||--|| MEMBERSHIP : has
    TRAINER ||--o{ MEMBER : trains
    MEMBER {
        int member_id PK
        int trainer_id FK
        string first_name
        string last_name
        string contact_number
        string email
        date date_of_birth
        string gender
    }

    MEMBERSHIP {
        int membership_id PK
        int member_id FK
        string membership_type
        date start_date
        date end_date
        decimal monthly_fee
        string payment_status
    }

    TRAINER {
        int trainer_id PK
        string first_name
        string last_name
        string specialization
        string contact_number
        decimal hourly_rate
    }

    ATTENDANCE {
        int attendance_id PK
        int member_id FK
        date attendance_date
        time check_in_time
    }
```

## Technology Stack

- **Frontend**: React, Chart.js
- **Backend**: Express.js
- **Database**: SQLite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd server && npm install
   ```
3. Start the development server:
   ```
   npm run dev:all
   ```
4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Members

- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Trainers

- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `POST /api/trainers` - Create new trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

### Memberships

- `GET /api/memberships` - Get all memberships
- `GET /api/memberships/:id` - Get membership by ID
- `GET /api/members/:id/membership` - Get membership by member ID
- `POST /api/memberships` - Create new membership
- `PUT /api/memberships/:id` - Update membership
- `DELETE /api/memberships/:id` - Delete membership

### Attendance

- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/today` - Get today's attendance records
- `GET /api/members/:id/attendance` - Get attendance records for a specific member
- `POST /api/attendance` - Record attendance (check-in)

### Statistics

- `GET /api/stats/memberships` - Get membership statistics
- `GET /api/stats/membership-types` - Get membership types distribution
- `GET /api/stats/attendance` - Get attendance statistics
- `GET /api/stats/expiring-memberships` - Get members with expiring memberships
