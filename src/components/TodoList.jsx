import React, { useState, useEffect } from 'react';
import { List, Input, Button, Menu, Dropdown, Switch, Radio, DatePicker, notification } from 'antd';
import { PlusOutlined, EllipsisOutlined, BulbOutlined } from '@ant-design/icons';
import './TodoList.css';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    checkTasksDue();
  }, [tasks]); // Verificar tareas cuando las tareas cambian

  const handleAddTask = () => {
    if (inputValue.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
      // Mostrar notificación para agregar una nueva tarea
      notification.success({
        message: 'Nueva tarea agregada',
        description: 'Has agregado una nueva tarea correctamente.',
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Mostrar notificación para completar una tarea
        if (!task.completed) {
          notification.success({
            message: '¡Felicitaciones!',
            description: 'Has completado una tarea con éxito.',
          });
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    }));
  };

  const handleArchiveCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const handleSetDeadline = (taskId, deadline) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Mostrar notificación para establecer la fecha límite
        notification.info({
          message: 'Fecha límite establecida',
          description: 'Has establecido una fecha límite para esta tarea.',
        });
        return { ...task, deadline };
      }
      return task;
    }));
  };

  const handleAddSubtask = (taskId, subtask) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, subtasks: [...(task.subtasks || []), subtask] } : task));
  };

  const handleSetPriority = (taskId, priority) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, priority } : task));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    document.body.classList.toggle('light-mode', !darkMode);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  const taskMenu = (taskId) => (
    <Menu onClick={handleMenuClick}>
      <Menu.Item>Set Priority</Menu.Item>
      <Menu.Item>Add Subtask</Menu.Item>
      <Menu.Item key="deadline">Set Deadline:
        <DatePicker onChange={(date) => handleSetDeadline(taskId, date)} />
      </Menu.Item>
      <Menu.Item onClick={() => handleArchiveCompletedTasks(taskId)}>Archive</Menu.Item>
      <Menu.Item onClick={() => handleDeleteTask(taskId)} className="menu-item-delete">Delete</Menu.Item>
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
    const soonTasks = tasks.filter(task => {
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const difference = deadlineDate.getTime() - today.getTime();
        const threeDays = 1000 * 60 * 60 * 24 * 3;
        return difference > 0 && difference <= threeDays;
      }
      return false;
    });

    if (soonTasks.length > 0) {
      notification.warning({
        message: 'Tareas próximas a vencer',
        description: 'Algunas de tus tareas están próximas a vencer en los próximos 3 días. ¡No te olvides de completarlas a tiempo!',
      });
    }
  };

  return (
    <div>
      <div style={{ position: 'fixed', top: '20px', right: '20px' }}>
        <span style={{ marginRight: '8px' }}>Dark Mode</span>
        <Switch checked={darkMode} onChange={handleToggleDarkMode} />
        <BulbOutlined style={{ fontSize: '20px', marginLeft: '5px' }} />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter task" style={{ marginRight: '8px', width: '70%' }} onKeyPress={handleKeyPress} />
        <Button type="primary" onClick={handleAddTask}>
          Add Task
        </Button>
      </div>
      <Radio.Group value={filter} onChange={e => setFilter(e.target.value)} style={{ marginBottom: '16px' }}>
        <Radio.Button value="all">All</Radio.Button>
        <Radio.Button value="completed">Completed</Radio.Button>
        <Radio.Button value="pending">Pending</Radio.Button>
      </Radio.Group>
      <List
        dataSource={filteredTasks}
        renderItem={task => (
          <List.Item actions={[
            <Dropdown overlay={taskMenu(task.id)} trigger={['click']} placement="bottomRight" key="ellipsis">
              <Button icon={<EllipsisOutlined />} />
            </Dropdown>
          ]} style={{ cursor: 'pointer' }}>
            <Radio onChange={() => handleToggleComplete(task.id)} checked={task.completed} />
            <span onClick={() => handleToggleComplete(task.id)} style={{ textDecoration: task.completed ? 'line-through' : 'none', marginLeft: '8px' }}>{task.text}</span>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TodoList;