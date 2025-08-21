import React from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import Favorites from './pages/Favorites.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">RecipeShare</Link>
          <Link to="/create" className="nav-link">Create</Link>
          {token && <Link to="/favorites" className="nav-link">My Favorites</Link>}
        </div>
        <div className="nav-right">
          {!token ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button className="btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </div>
          )}
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/create" element={<PrivateRoute><CreateRecipe /></PrivateRoute>} />
          <Route path="/recipes/:id/edit" element={<PrivateRoute><EditRecipe /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

