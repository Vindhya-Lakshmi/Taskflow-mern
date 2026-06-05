import { useState, useEffect } from 'react';
import React from "react";
import axios from 'axios';
import { FiPlus, FiCheck, FiTrash2, FiEdit2 } from 'react-icons/fi';

const Dashboard = ({ token, setToken }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async () => {
    if (!newTask.title || !newTask.description) return;
    try {
      await axios.post('http://localhost:5000/api/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', description: '' });
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, 
        { status: status === 'pending' ? 'completed' : 'pending' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                           task.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || task.status === filter;
      return matchesSearch && matchesFilter;
    });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-3xl font-bold">T</div>
          <h1 className="text-2xl font-bold">TaskFlow</h1>
        </div>

        <div className="p-4">
          <div className="px-4 py-3 bg-gray-800 rounded-xl text-center">
            <div className="text-4xl font-bold text-green-500">{tasks.length}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
        </div>

        <nav className="mt-4">
          <div onClick={() => setFilter('all')} className={`px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-800 ${filter === 'all' ? 'bg-gray-800' : ''}`}>
            Dashboard
          </div>
          <div onClick={() => setFilter('pending')} className={`px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-800 ${filter === 'pending' ? 'bg-gray-800' : ''}`}>
            Pending
          </div>
          <div onClick={() => setFilter('completed')} className={`px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-800 ${filter === 'completed' ? 'bg-gray-800' : ''}`}>
            Completed
          </div>
        </nav>

        <div className="mt-auto p-6">
          <button 
            onClick={() => { localStorage.clear(); setToken(null); }}
            className="w-full py-3 text-red-500 hover:bg-gray-800 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="text-gray-400">Welcome back, {user.name}</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold"
            >
              <FiPlus /> New Task
            </button>
          </div>

          {/* Progress */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-8">
            <div className="flex justify-between mb-3">
              <span>Progress</span>
              <span className="text-green-500 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 focus:outline-none focus:border-green-500 mb-6"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <div key={task._id} className="task-card bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <button onClick={() => toggleStatus(task._id, task.status)}
                    className={`px-4 py-1 rounded-full text-sm ${task.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {task.status}
                  </button>
                </div>
                <p className="text-gray-400 mt-3 text-sm line-clamp-3">{task.description}</p>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => toggleStatus(task._id, task.status)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-3 rounded-xl">
                    <FiCheck /> {task.status === 'pending' ? 'Complete' : 'Pending'}
                  </button>
                  <button onClick={() => deleteTask(task._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl">
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No tasks found
            </div>
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">New Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg mb-4"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <textarea
              placeholder="Description"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg mb-6 h-32"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-800 rounded-xl">Cancel</button>
              <button onClick={addTask} className="flex-1 py-3 bg-green-500 rounded-xl font-semibold">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;