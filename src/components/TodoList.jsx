import React, { useState, useEffect } from 'react';
import { Button, List, Input, Checkbox, Radio, Dropdown, DatePicker, notification, Menu, Switch } from 'antd';
import { EllipsisOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './TodoList.css';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const priorityColors = {
    red: 'rgba(255, 192, 203, 0.5)',
    yellow: 'rgba(255, 255, 153, 0.5)',
    green: 'rgba(152, 251, 152, 0.5',
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3001/api/tasks?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            // Asignar los colores definidos localmente a las tareas cargadas
            const tasksWithColors = data.map(task => {
              let color;
              switch (task.priority) {
                case 'alto':
                  color = priorityColors.red;
                  break;
                case 'medio':
                  color = priorityColors.yellow;
                  break;
                case 'bajo':
                  color = priorityColors.green;
                  break;
                default:
                  color = 'gray';
              }
              return { ...task, priorityColor: color };
            });
            setTasks(tasksWithColors);
          } else {
            throw new Error('Error al obtener las tareas');
          }
        } catch (error) {
          console.error('Error al obtener las tareas:', error);
          notification.error({
            message: 'Error al obtener las tareas',
            description: 'Ha ocurrido un error al obtener las tareas del servidor.',
          });
        }
      }
    };
  
    fetchTasks();
  }, []);


  useEffect(() => {
    // Comprueba si hay tareas próximas a vencer cada vez que se renderiza la lista de tareas
    checkTasksDue();
  }, [tasks]);

  const handleAddTask = () => {
    const userId = localStorage.getItem('userId');
    if (inputValue.trim() !== '' && userId) {
      fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputValue,
          completed: false,
          priority: '',
          color: 'gray',
          userId: parseInt(userId)
        })
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Error al agregar la tarea');
      })
      .then(newTask => {
        setTasks([...tasks, { ...newTask, id: Date.now() }]);
        setInputValue('');
        notification.success({
          message: 'Nueva tarea agregada',
          description: 'Has agregado una nueva tarea correctamente.',
        });
      })
      .catch(error => {
        console.error('Error al agregar la tarea:', error);
        notification.error({
          message: 'Error al agregar la tarea',
          description: 'Ha ocurrido un error al intentar agregar una nueva tarea.',
        });
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleComplete = (taskId) => {
    const userId = localStorage.getItem('userId');
    fetch(`http://localhost:3001/api/tasks/${taskId}/complete?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Actualizar el estado de la tarea en el frontend
        setTasks(tasks.map(task => {
          if (task.id === taskId) {
            // Cambiar el estado de completado de 1 a 0 o viceversa
            const updatedTask = { ...task, completed: !task.completed ? 1 : 0 };
            return updatedTask;
          }
          return task;
        }));
        notification.success({
          message: 'Estado de la tarea actualizado',
          description: 'Has actualizado el estado de la tarea correctamente.',
        });
      } else {
        throw new Error('Error al completar la tarea');
      }
    })
    .catch(error => {
      console.error('Error al completar la tarea:', error);
      notification.error({
        message: 'Error al completar la tarea',
        description: 'Ha ocurrido un error al intentar completar la tarea en el servidor.',
      });
    });
  };

  const handleArchiveCompletedTasks = () => {
    const userId = localStorage.getItem('userId');
  
    // Filtrar todas las tareas completadas
    const completedTasks = tasks.filter(task => task.completed);
  
    // Realizar la solicitud de archivar para cada tarea completada
    Promise.all(completedTasks.map(task => {
      return fetch(`http://localhost:3001/api/tasks/${task.id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId
        })
      });
    }))
    .then(responses => {
      // Verificar si todas las solicitudes fueron exitosas
      const allSuccessful = responses.every(response => response.ok);
      if (allSuccessful) {
        // Actualizar el estado de las tareas y las tareas archivadas
        const updatedTasks = tasks.filter(task => !task.completed);
        const archivedTasks = tasks.filter(task => task.completed);
        setTasks(updatedTasks);
        setArchivedTasks(prevArchivedTasks => [...prevArchivedTasks, ...archivedTasks]);
  
        notification.success({
          message: 'Tareas archivadas',
          description: 'Todas las tareas completadas han sido archivadas correctamente.',
        });
      } else {
        throw new Error('Error al archivar las tareas completadas');
      }
    })
    .catch(error => {
      console.error('Error al archivar las tareas completadas:', error);
      notification.error({
        message: 'Error al archivar las tareas completadas',
        description: 'Ha ocurrido un error al intentar archivar las tareas completadas en el servidor.',
      });
    });
  };

  const handleSetDeadline = (taskId, deadline) => {
    const userId = localStorage.getItem('userId');
    
    // Actualiza la fecha límite en la base de datos
    fetch(`http://localhost:3001/api/tasks/${taskId}/deadline?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deadline }) // Envía la nueva fecha límite al servidor
    })
    .then(response => {
      if (response.ok) {
        // Actualiza la fecha límite en el estado local
        setTasks(tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, deadline }; // Actualiza la fecha límite de la tarea correspondiente
          }
          return task;
        }));
        notification.success({
          message: 'Fecha límite establecida',
          description: 'Has establecido una fecha límite para esta tarea.',
        });
      } else {
        throw new Error('Error al establecer la fecha límite');
      }
    })
    .catch(error => {
      console.error('Error al establecer la fecha límite:', error);
      notification.error({
        message: 'Error al establecer la fecha límite',
        description: 'Ha ocurrido un error al intentar establecer la fecha límite en el servidor.',
      });
    });
  };

  const handleSetPriority = (taskId, priority) => {
    let color;
    switch (priority) {
      case 'alto':
        color = priorityColors.red;
        break;
      case 'medio':
        color = priorityColors.yellow;
        break;
      case 'bajo':
        color = priorityColors.green;
        break;
      default:
        color = 'gray';
    }
    console.log("Setting priority:", priority, "with color:", color); // Verificar la prioridad y el color
  
    // Actualizar el estado local con la nueva prioridad y el color
    setTasks(
      tasks.map(task => 
        task.id === taskId ? { ...task, priority, priorityColor: color } : task
      )
    );
  
    // Obtener el userId del localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('Error: userId no encontrado en el localStorage');
      return;
    }
  
    // Enviar la nueva prioridad y el color al servidor
    fetch(`http://localhost:3001/api/tasks/${taskId}/priority`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ priority: priority, priorityColor: color }) // Envía tanto la prioridad como el color al servidor
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al establecer la prioridad');
      }
      notification.success({
        message: 'Prioridad actualizada',
        description: 'Se ha actualizado la prioridad de la tarea correctamente.',
      });
    })
    .catch(error => {
      console.error('Error al establecer la prioridad:', error);
      notification.error({
        message: 'Error al establecer la prioridad',
        description: 'Ha ocurrido un error al intentar establecer la prioridad en el servidor.',
      });
    });
  };

  const handleDeleteTask = (taskId) => {
    const userId = localStorage.getItem('userId');
    fetch(`http://localhost:3001/api/tasks/${taskId}?userId=${userId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        // Eliminar la tarea del estado local
        setTasks(tasks.filter(task => task.id !== taskId));
        notification.success({
          message: 'Tarea eliminada',
          description: 'La tarea ha sido eliminada correctamente.',
        });
      } else {
        throw new Error('Error al eliminar la tarea');
      }
    })
    .catch(error => {
      console.error('Error al eliminar la tarea:', error);
      notification.error({
        message: 'Error al eliminar la tarea',
        description: 'Ha ocurrido un error al intentar eliminar la tarea del servidor.',
      });
    });
  };

  const handleDeleteArchivedTask = (taskId) => {
    setArchivedTasks(archivedTasks.filter(task => task.id !== taskId));
  };

  const handleToggleDarkMode = (checked) => {
    const isDarkMode = checked;
    setDarkMode(isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
  };

  const handleMenuClick = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/todoapp-frontend/login'); // Redirige al usuario a la página de inicio de sesión
  };

  const taskMenu = (taskId) => (
    <Menu onClick={handleMenuClick} style={{ backgroundColor: darkMode ? '#333' : 'white', color: darkMode ? 'white' : 'inherit', minWidth: '150px' }}>
      <Menu.Item key="priority">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: darkMode ? 'white' : 'inherit' }}>Priority:</span>
          <div>
            <Button type="text" onClick={() => { console.log("Clicked: Alto"); handleSetPriority(taskId, 'alto'); }} style={{ color: '#ff4d4f' }}>High</Button>
            <Button type="text" onClick={() => { console.log("Clicked: Medio"); handleSetPriority(taskId, 'medio'); }} style={{ color: '#ffd666' }}>Medium</Button>
            <Button type="text" onClick={() => { console.log("Clicked: Bajo"); handleSetPriority(taskId, 'bajo'); }} style={{ color: '#73d13d' }}>low</Button>
          </div>
        </div>
      </Menu.Item>
      <Menu.Item key="deadline" style={{ borderBottom: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: darkMode ? 'white' : 'inherit' }}>Deadline:</span>
          <DatePicker onChange={(date) => handleSetDeadline(taskId, date)} onClick={handleMenuClick} />
        </div>
      </Menu.Item>
      <Menu.Item onClick={() => handleArchiveCompletedTasks(taskId)} style={{ color: darkMode ? 'white' : 'inherit' }}>Archive</Menu.Item>
      <Menu.Item onClick={() => handleDeleteTask(taskId)} className="menu-item-delete" style={{ color: darkMode ? 'white' : 'inherit' }}>Delete</Menu.Item>
    </Menu>
  );

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.completed;
    } else if (filter === 'pending') {
      return !task.completed;
    }
    return true;
  });

  const checkTasksDue = () => {
    const today = new Date();
    const twoDays = 1000 * 60 * 60 * 24 * 2; // Dos días en milisegundos
  
    const soonTasks = tasks.filter(task => {
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const difference = deadlineDate.getTime() - today.getTime();
        return difference > 0 && difference <= twoDays;
      }
      return false;
    });
  
    if (soonTasks.length > 0) {
      const taskNames = soonTasks.map(task => task.text).join(', '); // Obtener los nombres de las tareas
      const message = `Tareas próximas a vencer: ${taskNames}. ¡No te olvides de completarlas a tiempo!`;
      notification.warning({
        message: 'Tareas próximas a vencer',
        description: message,
      });
    }
  };

  useEffect(() => {
    // Obtener el userId del localStorage
    const userId = localStorage.getItem('userId');

    // Si el userId existe, se obtienen las tareas del usuario
    if (userId) {
      // Se obtienen las tareas del localStorage
      const storedTasks = JSON.parse(localStorage.getItem('tasks'));

      // Si hay tareas almacenadas, se establecen en el estado
      if (storedTasks) {
        setTasks(storedTasks);
      }

      // Se obtiene el modo oscuro del localStorage
      const storedDarkMode = localStorage.getItem('darkMode');

      // Si el modo oscuro está almacenado, se establece en el estado
      if (storedDarkMode) {
        setDarkMode(storedDarkMode === 'true');
        document.body.classList.toggle('dark-mode', storedDarkMode === 'true');
        document.body.classList.toggle('light-mode', storedDarkMode !== 'true');
      }
    }
  }, []);

  useEffect(() => {
    // Almacena las tareas en el localStorage cada vez que cambia el estado
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Almacena el modo oscuro en el localStorage cada vez que cambia el estado
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div>
      <div style={{ position: 'fixed', top: '20px', right: '20px', marginTop: '10px' }}>
        <span style={{ marginRight: '8px' }}>Dark Mode</span>
        <Switch checked={darkMode} onChange={handleToggleDarkMode} />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Input 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          placeholder="Enter task" 
          style={{ 
            marginRight: '8px', 
            width: '70%', 
            marginBottom: '10px'
          }} 
          onKeyPress={handleKeyPress} 
        />
        <Button type="primary" onClick={handleAddTask}>
          Add Task
        </Button>
        <Button onClick={handleArchiveCompletedTasks}>Archive Completed Tasks</Button>
        <Button onClick={() => setShowArchived(!showArchived)}>Show Archived</Button>
      </div>
      <Radio.Group
  value={filter}
  onChange={e => setFilter(e.target.value)}
  className={darkMode ? "dark-mode-filter" : ""}
  style={{ marginBottom: '16px' }}
>
  <Radio.Button value="all" className={`radio-button ${filter === "all" ? "radio-button-checked" : ""}`}>All</Radio.Button>
  <Radio.Button value="completed" className={`radio-button ${filter === "completed" ? "radio-button-checked" : ""}`}>Completed</Radio.Button>
  <Radio.Button value="pending" className={`radio-button ${filter === "pending" ? "radio-button-checked" : ""}`}>Pending</Radio.Button>
</Radio.Group>
      <List
        dataSource={filteredTasks}
        renderItem={task => (
          <List.Item className={`task-item ${task.priorityColor ? task.priorityColor : 'gray'}`} style={{ display: 'flex', justifyContent: 'space-between', color: darkMode ? task.color : 'inherit', backgroundColor: task.priorityColor ? task.priorityColor : 'gray' }}>
            <div style={{ marginLeft: '8px' }}>
              <Checkbox onChange={() => handleToggleComplete(task.id)} checked={task.completed} />
            </div>
            <span onClick={() => handleToggleComplete(task.id)} style={{ textDecoration: task.completed ? 'line-through' : 'none', marginRight: '8px' }}>{task.text}</span>
            <div style={{ marginRight: '8px' }}>
              <Dropdown overlay={taskMenu(task.id)} trigger={['click']} placement="bottomLeft" key="ellipsis">
                <Button icon={<EllipsisOutlined />} />
              </Dropdown>
            </div>
          </List.Item>
        )}
      />
      {showArchived && (
        <List
          header={<div>Archived Tasks</div>}
          dataSource={archivedTasks}
          renderItem={task => (
            <List.Item key={task.id}>
              <span>{task.text}</span>
              <Button type="link" onClick={() => handleDeleteArchivedTask(task.id)}>Delete</Button>
            </List.Item>
          )}
        />
      )}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
          
        </Button>
      </div>
    </div>
  );
};

export default TodoList;