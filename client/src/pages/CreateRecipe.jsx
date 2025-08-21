import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client.js';

function splitLines(value) {
  return value.split('\n').map(s => s.trim()).filter(Boolean);
}

export default function CreateRecipe() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [categories, setCategories] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!image) { setError('Image is required'); return; }
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    form.append('ingredients', JSON.stringify(splitLines(ingredients)));
    form.append('instructions', JSON.stringify(splitLines(instructions)));
    form.append('categories', JSON.stringify(splitLines(categories)));
    form.append('image', image);
    try {
      const res = await api.post('/recipes', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/recipes/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create recipe');
    }
  };

  return (
    <div className="container">
      <h2>Create Recipe</h2>
      {error && <div style={{ color: '#ef4444' }}>{error}</div>}
      <form className="form" onSubmit={submit}>
        <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="textarea" placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="row">
          <div>
            <label>Ingredients (one per line)</label>
            <textarea className="textarea" value={ingredients} onChange={e => setIngredients(e.target.value)} />
          </div>
          <div>
            <label>Instructions (one step per line)</label>
            <textarea className="textarea" value={instructions} onChange={e => setInstructions(e.target.value)} />
          </div>
        </div>
        <label>Categories (one per line, e.g., Dessert, Vegan)</label>
        <textarea className="textarea" value={categories} onChange={e => setCategories(e.target.value)} />
        <input className="input" type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
        <button className="btn" type="submit">Publish</button>
      </form>
    </div>
  );
}

