import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FiPlus, FiCheck, FiTrash2, FiEdit2 } from "react-icons/fi";

const Dashboard = ({ token, setToken }) => {
  const API_URL = "http://localhost:5000";

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (userData) {
      setUser(userData);
    }

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;

    try {
      await axios.post(`${API_URL}/api/tasks`, newTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNewTask({
        title: "",
        description: "",
      });

      setShowModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/api/tasks/${id}`,
        {
          status: status === "pending" ? "completed" : "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const editTask = async (task) => {
    const newTitle = prompt("Edit Task Title", task.title);

    if (!newTitle || !newTitle.trim()) return;

    const newDescription = prompt(
      "Edit Task Description",
      task.description
    );

    if (newDescription === null) return;

    try {
      await axios.put(
        `${API_URL}/api/tasks/${task._id}`,
        {
          title: newTitle,
          description: newDescription,
          status: task.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || task.status === filter;

    return matchesSearch && matchesFilter;
  });

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-gray-800">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-3xl font-bold">
            T
          </div>
          <h1 className="text-2xl font-bold">TaskFlow</h1>
        </div>

        <div className="hidden md:block p-4">
          <div className="px-4 py-3 bg-gray-800 rounded-xl text-center">
            <div className="text-4xl font-bold text-green-500">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-400">
              Total Tasks
            </div>
          </div>
        </div>

        <nav className="mt-2 md:mt-4 flex md:flex-col overflow-x-auto">
          <div
            onClick={() => setFilter("all")}
            className={`px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-800 ${filter === "all" ? "bg-gray-800" : ""
              }`}
          >
            Dashboard
          </div>

          <div
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 cursor-pointer hover:bg-gray-800 ${filter === "pending" ? "bg-gray-800" : ""
              }`}
          >
            Pending
          </div>

          <div
            onClick={() => setFilter("completed")}
            className={`px-6 py-3 cursor-pointer hover:bg-gray-800 ${filter === "completed" ? "bg-gray-800" : ""
              }`}
          >
            Completed
          </div>
        </nav>

        <div className="mt-auto p-6">
          <button
            onClick={() => {
              localStorage.clear();
              setToken(null);
            }}
            className="w-full py-3 text-red-500 hover:bg-gray-800 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-400">
              Welcome back, {user?.name || "User"}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold"          >
            <FiPlus />
            New Task
          </button>
        </div>

        {/* Progress */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <div className="flex justify-between mb-3">
            <span>Progress</span>
            <span className="text-green-500 font-bold">
              {progress}%
            </span>
          </div>

          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Tasks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">
                  {task.title}
                </h3>

                <button
                  onClick={() =>
                    toggleStatus(task._id, task.status)
                  }
                  className={`px-4 py-1 rounded-full text-sm ${task.status === "completed"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-yellow-500/20 text-yellow-500"
                    }`}
                >
                  {task.status}
                </button>
              </div>

              <p className="text-gray-400 mt-3">
                {task.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <button
                  onClick={() => editTask(task)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 py-3 rounded-xl"
                >
                  <FiEdit2 />
                  Edit
                </button>

                <button
                  onClick={() =>
                    toggleStatus(task._id, task.status)
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 py-3 rounded-xl"
                >
                  <FiCheck />
                  {task.status === "pending"
                    ? " Complete"
                    : " Pending"}
                </button>

                <button
                  onClick={() => deleteTask(task._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl"
                >
                  <FiTrash2 />
                  Delete
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

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 md:p-8 rounded-2xl w-[95%] max-w-md">
            <h3 className="text-2xl font-bold mb-6">
              New Task
            </h3>

            <input
              type="text"
              placeholder="Task Title"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg mb-4"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  title: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Description"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg mb-6 h-32"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  description: e.target.value,
                })
              }
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-800 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                className="flex-1 py-3 bg-green-500 rounded-xl font-semibold"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;