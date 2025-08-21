import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client.js';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/recipes').then(r => setRecipes(r.data));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    recipes.forEach(r => (r.categories || []).forEach(c => set.add(c)));
    return Array.from(set).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const q = query.toLowerCase();
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      const matchesCategory = !category || (r.categories || []).includes(category);
      return matchesQuery && matchesCategory;
    });
  }, [recipes, query, category]);

  return (
    <div className="container">
      <div className="form" style={{ marginBottom: 16 }}>
        <div className="row">
          <input className="input" placeholder="Search recipes..." value={query} onChange={e => setQuery(e.target.value)} />
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid">
        {filtered.map(r => (
          <div className="card" key={r.id}>
            <Link to={`/recipes/${r.id}`}>
              <img src={r.imageUrl} alt={r.title} />
            </Link>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{r.title}</h3>
                <span className="rating">★ {r.averageRating?.toFixed?.(1) ?? r.averageRating}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{r.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(r.categories || []).map(c => <span className="pill" key={c}>{c}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

