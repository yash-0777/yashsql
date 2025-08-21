# EventHub - Local Event Management Platform

Full-stack app:
- Frontend: React (Vite) with React Router and simple Auth Context
- Backend: Node.js + Express.js with JWT auth, Multer image upload
- Storage: Local JSON files in `server/data` (users, events, registrations)

## Structure
- `server/` Express API
- `client/` React app

## Requirements
- Node.js 18+ and npm

## Run (Windows CMD/PowerShell or macOS/Linux)
1) Backend (Terminal 1)
```
cd server
npm install
npm run dev
```
Backend on http://localhost:5000

2) Frontend (Terminal 2)
```
cd client
npm install
npm run dev
```
App on http://localhost:5173 (proxy to backend is configured)

## APIs
- POST `/api/auth/signup`, POST `/api/auth/login`
- POST `/api/events` (multipart form-data, field `banner` for image)
- GET `/api/events`, GET `/api/events/:id`
- PUT `/api/events/:id` (owner only; accepts multipart to change banner)
- DELETE `/api/events/:id` (owner only)
- POST `/api/events/:id/register` (auth required)
- GET `/api/me/created-events` (auth required)

## Notes
- Uploaded images saved in `server/uploads` and served from `/uploads/...`
- JWT secret uses a development default. Set `JWT_SECRET` in production.