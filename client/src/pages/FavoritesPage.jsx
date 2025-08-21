import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/http.js';

export default function FavoritesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users/favorites');
        setRecipes(data.favorites || []);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Favorites</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {recipes.map((r) => (
          <Link key={r._id} to={`/recipes/${r._id}`} className="card" style={{
            display: 'block', border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'all 200ms ease'
          }}>
            {r.photoUrl && <img src={r.photoUrl} alt={r.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
            <div style={{ padding: 12 }}>
              <h3 style={{ margin: 0 }}>{r.title}</h3>
              <small>{r.category} · ⭐ {r.avgRating?.toFixed?.(1) || r.avgRating}</small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

