import React from 'react';
import './App.css'; 
import TodoList from './components/TodoList';
import logo from './assets/logotodo.png'; // Importamos el archivo de imagen del logo

const App = () => {
  return (
    <div className="app-container">
      <div className="app-content">
        <img src={logo} alt="Logo" className="logo" /> {/* Agregamos el logo */}
        {/* <h1>Todo App</h1> */}
        <TodoList />
      </div>
    </div>
  );
};

export default App;