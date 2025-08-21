import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import EditRecipePage from './pages/EditRecipePage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

const Nav = () => {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
      <Link to="/">Home</Link>
      {user && <Link to="/recipes/new">Create</Link>}
      {user && <Link to="/favorites">My Favorites</Link>}
      <div style={{ marginLeft: 'auto' }}>
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <span style={{ margin: '0 8px' }} />
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span>Hi, {user.name}</span>
            <button onClick={logout} style={{ marginLeft: 8 }}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const Protected = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/new" element={<Protected><EditRecipePage mode="create" /></Protected>} />
          <Route path="/recipes/:id/edit" element={<Protected><EditRecipePage mode="edit" /></Protected>} />
          <Route path="/favorites" element={<Protected><FavoritesPage /></Protected>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

