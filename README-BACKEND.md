# KickoffUSA Backend Setup

## Prerequisites

1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/
   - Install and remember your password

2. **Install Node.js**
   - Download from https://nodejs.org/
   - This will also install npm

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Database
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE kickoffusa;
```

### 3. Update Database Configuration
Edit `config.js` and update the database password:
```javascript
password: 'your_actual_postgres_password'
```

### 4. Start the Backend Server
```bash
npm start
```

### 5. Start the Frontend (in another terminal)
```bash
python3 -m http.server 8000
```

## How It Works

- **Frontend**: http://localhost:8000 (your website)
- **Backend API**: http://localhost:3000 (handles database)
- **Database**: PostgreSQL (stores team data)

## API Endpoints

- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create a new team
- `GET /api/teams/:id` - Get team by ID

## Testing

1. Open http://localhost:8000
2. Go to Tournament Center
3. Fill out the team creation form
4. Check your PostgreSQL database to see the data

## Database Schema

```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  captain_name VARCHAR(255) NOT NULL,
  captain_email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  skill_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
