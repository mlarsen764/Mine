import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthForm({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMessage('Signup successful! Please check your email to confirm your address.');
        setEmail('');
        setPassword('');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        onAuth(data.user);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto', padding: 16 }}>
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ display: 'block', margin: '8px 0', padding: 8, width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ display: 'block', margin: '8px 0', padding: 8, width: '100%' }}
      />
      <button type="submit" style={{ padding: '10px 20px', marginTop: 8 }}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </button>

      <p
        onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage('');
          setErrorMessage('');
        }}
        style={{ cursor: 'pointer', marginTop: 12, textDecoration: 'underline' }}
      >
        {isSignUp ? 'Already have an account? Log in' : 'No account? Sign up'}
      </p>
    </form>
  );
}
