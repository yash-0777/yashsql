import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addComment, favoriteRecipe, fetchRecipe, rateRecipe } from '../services/recipes.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('Ingredients');
  const [comment, setComment] = useState('');
  const [myRating, setMyRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchRecipe(id);
        setRecipe(data);
        setError(null);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onAddComment = async () => {
    if (!comment.trim()) return;
    const data = await addComment(id, comment.trim());
    setRecipe(data);
    setComment('');
  };

  const onRate = async (value) => {
    setMyRating(value);
    const data = await rateRecipe(id, value);
    setRecipe(data);
  };

  const onFavorite = async () => {
    await favoriteRecipe(id);
    alert('Added to favorites');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!recipe) return null;

  return (
    <div style={{ animation: 'fadein 300ms ease' }}>
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        .tab { padding: 8px 12px; border: 1px solid #ddd; cursor: pointer; }
        .tab.active { background: #333; color: white; }
      `}</style>
      {recipe.photoUrl && (
        <img src={recipe.photoUrl} alt={recipe.title} style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8 }} />
      )}
      <h2>{recipe.title}</h2>
      <p>{recipe.description}</p>
      <p>
        <strong>Category:</strong> {recipe.category} · <strong>Avg Rating:</strong> {recipe.avgRating}
      </p>
      {token && (
        <button onClick={onFavorite} style={{ marginBottom: 12 }}>Add to Favorites</button>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['Ingredients', 'Instructions', 'Comments'].map((t) => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </div>
        ))}
      </div>

      {tab === 'Ingredients' && (
        <ul>
          {recipe.ingredients?.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      )}

      {tab === 'Instructions' && (
        <ol>
          {recipe.instructions?.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 6 }}>{it}</li>
          ))}
        </ol>
      )}

      {tab === 'Comments' && (
        <div>
          {token && (
            <div style={{ marginBottom: 12 }}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} style={{ width: '100%' }} placeholder="Add a comment" />
              <button onClick={onAddComment}>Submit Comment</button>
            </div>
          )}
          {recipe.comments?.length ? (
            recipe.comments.map((c) => (
              <div key={c._id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                <strong>{c.user?.name || 'User'}</strong>
                <div>{c.text}</div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <strong>Your Rating:</strong>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} disabled={!token} onClick={() => onRate(n)} style={{ marginLeft: 6, color: n <= myRating ? 'orange' : '#555' }}>★</button>
        ))}
      </div>
    </div>
  );
}

