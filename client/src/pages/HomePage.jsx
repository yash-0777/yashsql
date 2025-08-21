import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipes } from '../services/recipes.js';

const categories = ['All', 'Dessert', 'Dinner', 'Vegan', 'Breakfast', 'Lunch', 'Snack', 'Other'];

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRecipes(category !== 'All' ? { category } : {});
        setRecipes(data);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category]);

  return (
    <div style={{ animation: 'fadein 300ms ease' }}>
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.15) }
      `}</style>
      <h1>RecipeShare</h1>
      <div style={{ margin: '12px 0' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              background: c === category ? '#333' : '#f2f2f2',
              color: c === category ? '#fff' : '#333',
              borderRadius: 16,
              border: '1px solid #ddd',
              transition: 'all 150ms ease'
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {loading && <p>Loading recipes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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

