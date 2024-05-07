import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TodoList from './components/TodoList';
import LoginForm from './components/LoginForm';
import './App.css'; // Importa estilos globales de la aplicación
import logo from './assets/logotodo.png'; // Importa el logo

const App = () => {
  return (
    <Router>
      <div className="app-container"> {/* Contenedor global de la aplicación */}
        <div className="app-content"> {/* Contenido global de la aplicación */}
          <img src={logo} alt="Logo" className="logo" /> {/* Muestra el logo globalmente */}
          <h1 className="app-title">ToDo List</h1> {/* Título "ToDo List" */}
          <Routes>
            <Route path="/todoapp-frontend" element={<LoginForm />} />
            <Route path="/todoapp-frontend/login" element={<LoginForm />} />
            <Route path="/todoapp-frontend/todolist" element={<TodoList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;