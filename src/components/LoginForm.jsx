import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password 
        }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();

      // Verificar si se recibió el ID de usuario en la respuesta
      const userId = data.userId;
      if (!userId) {
        throw new Error('ID de usuario no encontrado en la respuesta');
      }

      // Almacenar el ID de usuario en localStorage
      localStorage.setItem('userId', userId);

      // Redirigir al usuario al TodoList
      console.log('Redirigiendo al usuario al TodoList...');
      navigate('/todoapp-frontend/todolist');

    } catch (error) {
      console.error('Error al enviar la solicitud de inicio de sesión:', error.message);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="login-form">
        <label htmlFor="username">Email:</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Login</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </form>
  );
};

export default LoginForm;