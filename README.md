# RecipeShare

Full-stack app: React + Express (JSON datastore). Features: recipes CRUD with image upload, comments, ratings, JWT auth, favorites.

Quickstart

1) Server

```
cd server
cp .env.example .env
npm install
npm run dev
```

2) Client

```
cd client
npm install
npm run dev
```

Open http://localhost:5173

API

- POST /api/auth/register {name,email,password}
- POST /api/auth/login {email,password}
- POST /api/recipes multipart: {title,description,ingredients[],instructions[],categories[], image}
- GET /api/recipes
- GET /api/recipes/:id
- PUT /api/recipes/:id multipart: same as create, image optional
- DELETE /api/recipes/:id
- POST /api/recipes/:id/comments {text}
- POST /api/recipes/:id/ratings {value:1-5}
- POST /api/recipes/:id/favorite
- GET /api/recipes/me/favorites

Notes

- Uses local JSON at server/data/db.json and stores uploads in server/uploads.
- Set VITE_API_BASE in client to point at backend if not localhost.

# yashsql
sql project
