import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, fetchRecipe, updateRecipe } from '../services/recipes.js';

export default function EditRecipePage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    category: 'Other',
    photo: null,
  });
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode !== 'edit') return;
    const load = async () => {
      try {
        const data = await fetchRecipe(id);
        setForm((f) => ({
          ...f,
          title: data.title || '',
          description: data.description || '',
          ingredients: (data.ingredients || []).join('\n'),
          instructions: (data.instructions || []).join('\n'),
          category: data.category || 'Other',
        }));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, mode]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        const created = await createRecipe(form);
        navigate(`/recipes/${created._id}`);
      } else {
        const updated = await updateRecipe(id, form);
        navigate(`/recipes/${updated._id}`);
      }
    } catch (e) {
      setError(e.message || 'Failed to save');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>{mode === 'create' ? 'Create' : 'Edit'} Recipe</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={3} />
        </div>
        <div>
          <label>Category</label>
          <select name="category" value={form.category} onChange={onChange}>
            {['Dessert', 'Dinner', 'Vegan', 'Breakfast', 'Lunch', 'Snack', 'Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Ingredients (one per line)</label>
          <textarea name="ingredients" value={form.ingredients} onChange={onChange} rows={6} required />
        </div>
        <div>
          <label>Instructions (one per line)</label>
          <textarea name="instructions" value={form.instructions} onChange={onChange} rows={6} required />
        </div>
        <div>
          <label>Photo</label>
          <input name="photo" type="file" accept="image/*" onChange={onChange} />
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

