import React, { useState } from 'react'
import "./auth.form.scss";
import {useNavigate, Link} from "react-router";
import { useAuth } from '../hooks/useAuth.js';


function Register() {

  const navigate = useNavigate();

  const {loading, handleRegister} = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      showToast("error", "Username is required.");
      return;
    }
    if (!trimmedEmail) {
      showToast("error", "Email is required.");
      return;
    }
    if (!password) {
      showToast("error", "Password is required.");
      return;
    }
    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters.");
      return;
    }

    try {
      await handleRegister({ username: trimmedUsername, email: trimmedEmail, password });
      showToast("success", "Registration successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Registration failed. Email might be already in use.");
    }
  }

  return (
    <main>
      <Link to="/" className="auth-brand">
        Prep<span className="brand-accent">Pilot</span>
      </Link>

      <div className = "form-container">
        <h2>Create Account</h2>
        <form className = "form" onSubmit = {handleSubmit}>

          <div className = "input-group">
            <label htmlFor = "username">Username</label>
            <input 
              value={username}
              onChange={(e) => { setUsername(e.target.value) }}
              disabled={loading}
              type = "text" id = "username" name = "username" placeholder = "Enter your Username" />
          </div>

          <div className = "input-group">
            <label htmlFor = "email">Email</label>
            <input 
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
              disabled={loading}
              type = "email" id = "email" name = "email" placeholder = "Enter your email" />
          </div>
          
          <div className = "input-group">
            <label htmlFor = "password">Password</label>
            <input 
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
              disabled={loading}
              type = "password" id = "password" name = "password" placeholder = "Enter your password" />
          </div>

          <button disabled={loading} className = "auth-submit-btn">
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className = "redirect-link">Already have an account? <Link to = {'/login'}>Login</Link></p>

      </div>
      
      {/* Toast Notifications */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">
              {t.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              )}
              {t.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              )}
              {t.type === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              )}
            </span>
            <p className="toast__message">{t.message}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Register
