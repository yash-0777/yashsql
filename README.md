# RecipeShare

Full-stack app with React, Node.js/Express, and MongoDB. Includes JWT auth, image uploads, comments, ratings, favorites, and category filtering.

## Getting Started

### Backend
1. cd server
2. cp .env.example .env and adjust values
3. npm install
4. npm run dev

Backend runs at http://localhost:5000

### Frontend
1. cd client
2. npm install
3. npm run dev

Frontend runs at http://localhost:5173 and proxies /api and /uploads to backend.

## API Summary
- POST /api/auth/register
- POST /api/auth/login
- POST /api/recipes (auth, multipart)
- GET /api/recipes?category=...
- GET /api/recipes/:id
- PUT /api/recipes/:id (auth, multipart)
- DELETE /api/recipes/:id (auth)
- POST /api/recipes/:id/comments (auth)
- POST /api/recipes/:id/rating (auth)
- POST /api/recipes/:id/favorite (auth)
- GET /api/users/favorites (auth)

## Notes
- Images are stored locally under server/src/uploads and served at /uploads
- JWT token stored in localStorage and sent via Authorization: Bearer <token>
# yashsql
sql project
