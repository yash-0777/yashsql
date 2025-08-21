import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client.js';

export default function Favorites() {
  const [recipes, setRecipes] = useState([]);
  useEffect(() => { api.get('/recipes/me/favorites').then(r => setRecipes(r.data)); }, []);
  return (
    <div className="container">
      <h2>My Favorites</h2>
      <div className="grid">
        {recipes.map(r => (
          <div className="card" key={r.id}>
            <Link to={`/recipes/${r.id}`}>
              <img src={r.imageUrl} alt={r.title} />
            </Link>
            <div className="card-body">
              <h3 style={{ margin: 0 }}>{r.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{r.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

