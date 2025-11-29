# Employee Attendance System

**Author:** Arif  
**Tech stack:** React (Vite) + Redux Toolkit, Node.js + Express, MongoDB, Mongoose

## Project overview
A lightweight Employee Attendance System with two roles: **Employee** and **Manager**.  
Employees can check in/out, view history and monthly summaries. Managers can view team attendance, filter records and export CSV reports.

## Features
- Employee: register/login, check-in, check-out, history, monthly summary, calendar view.
- Manager: login, team summary, filterable attendance list, CSV export, reports.
- JWT-based authentication and role-based access control.

## Folder structure
EMPLOYEE_MANAGEMENT/
backend/ # Node/Express backend
controllers/
models/
routes/
seeder/seed.js
server.js
.env.example
frontend/ # React + Vite frontend
src/
pages/
components/
api/
store/
package.json
README.md


## Quick setup

### Backend
1. Copy `.env.example` → `.env` and fill `MONGO_URI`, `JWT_SECRET`.
2. Install:
```bash
cd EMPLOYEE_MANAGEMENT/backend
npm install


Seed sample data (optional):

node seeder/seed.js


Run:

npm run dev
# server runs on port 5000 by default

Frontend

Install:

cd EMPLOYEE_MANAGEMENT/frontend
npm install


Run:

npm run dev
# opens at http://localhost:5173

API summary

POST /api/auth/register — register user

POST /api/auth/login — login user

GET /api/auth/me — get current user

POST /api/attendance/checkin — check-in

POST /api/attendance/checkout — check-out

GET /api/attendance/my-history — employee history

GET /api/attendance/my-summary — monthly summary

GET /api/attendance/today — today's status

Manager:

GET /api/attendance/all — filtered list

GET /api/attendance/summary — team summary

GET /api/attendance/export — CSV export (date range)

GET /api/attendance/today-status — today's attendance

Seed data

Run node seeder/seed.js (backend) to create 8 employees and 1 manager (password: password123 for all). Manager credentials:

email: manager@example.com
password: password123

What to include in PDF / demo

Screenshots:

Landing page

Employee dashboard (before and after check-in)

Calendar view

Employee history table

Manager dashboard and reports

Demo flow:

Login as manager → show team report & export

Login as employee → check in/out, show calendar and summary

Notes and assumptions

Dates stored as YYYY-MM-DD.

Late check-in cutoff: 09:30 local time.

Half-day if total hours < 4.

Contact

Arif — add email/phone here.


---

# 4) After you add these files

### Backend
- Run seed:
```bash
cd EMPLOYEE_MANAGEMENT/backend
node seeder/seed.js


Start backend:

npm run dev

Frontend

Start frontend:

cd EMPLOYEE_MANAGEMENT/frontend
npm run dev


Open http://localhost:5173 and test:

Login as manager@example.com / password123

Login as employee1@example.com / password123

Employee calendar at /employee/calendar

Manager dashboard /manager/dashboard