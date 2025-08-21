import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '@/api/client.js';
import { useAuth } from '@/context/AuthContext.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [comment, setComment] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [favorited, setFavorited] = useState(false);

  const isAuthor = useMemo(() => user && recipe && recipe.authorId === user.id, [user, recipe]);

  useEffect(() => {
    api.get(`/recipes/${id}`).then(r => setRecipe(r.data));
  }, [id]);

  const submitComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    const res = await api.post(`/recipes/${id}/comments`, { text: comment });
    setRecipe(prev => ({ ...prev, comments: [...prev.comments, res.data] }));
    setComment('');
  };

  const rate = async (value) => {
    const res = await api.post(`/recipes/${id}/ratings`, { value });
    setMyRating(value);
    setRecipe(prev => ({ ...prev, averageRating: res.data.averageRating }));
  };

  const toggleFavorite = async () => {
    const res = await api.post(`/recipes/${id}/favorite`);
    setFavorited(res.data.favorited);
    setRecipe(prev => ({ ...prev, favoritesCount: res.data.favoritesCount }));
  };

  const del = async () => {
    if (!confirm('Delete this recipe?')) return;
    await api.delete(`/recipes/${id}`);
    navigate('/');
  };

  if (!recipe) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card" style={{ overflow: 'hidden' }}>
        <img src={recipe.imageUrl} alt={recipe.title} style={{ maxHeight: 400, objectFit: 'cover' }} />
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{recipe.title}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="rating">★ {recipe.averageRating}</span>
              <span className="pill">❤ {recipe.favoritesCount || 0}</span>
              {token && (
                <button className="btn" onClick={toggleFavorite}>{favorited ? 'Unfavorite' : 'Favorite'}</button>
              )}
              {isAuthor && (
                <>
                  <Link className="btn" to={`/recipes/${recipe.id}/edit`}>Edit</Link>
                  <button className="btn" onClick={del} style={{ background: '#ef4444', color: 'white' }}>Delete</button>
                </>
              )}
            </div>
          </div>
          <p style={{ color: 'var(--muted)' }}>{recipe.description}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(recipe.categories || []).map(c => <span className="pill" key={c}>{c}</span>)}
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>Ingredients</button>
            <button className={`tab ${activeTab === 'instructions' ? 'active' : ''}`} onClick={() => setActiveTab('instructions')}>Instructions</button>
            <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Comments</button>
          </div>

          {activeTab === 'ingredients' && (
            <ul>
              {recipe.ingredients.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          )}
          {activeTab === 'instructions' && (
            <ol>
              {recipe.instructions.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}
            </ol>
          )}
          {activeTab === 'comments' && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                {(recipe.comments || []).map(c => (
                  <div key={c.id} style={{ borderBottom: '1px solid #30363d', paddingBottom: 8 }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.userName} — {new Date(c.createdAt).toLocaleString()}</div>
                    <div>{c.text}</div>
                  </div>
                ))}
              </div>
              {token && (
                <form className="form" onSubmit={submitComment}>
                  <textarea className="textarea" placeholder="Add a comment" value={comment} onChange={e => setComment(e.target.value)} />
                  <button className="btn" type="submit">Post Comment</button>
                </form>
              )}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <label>Rate this recipe:</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} className="tab" onClick={() => rate(v)} style={{ borderColor: myRating >= v ? '#fbbf24' : undefined }}>
                  {v} ★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

