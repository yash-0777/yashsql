import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api/client.js';
import { useAuth } from '@/context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <div style={{ color: '#ef4444' }}>{error}</div>}
      <form className="form" onSubmit={submit}>
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" type="submit">Create Account</button>
      </form>
      <div style={{ marginTop: 8 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

