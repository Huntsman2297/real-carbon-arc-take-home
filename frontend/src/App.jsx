import { useEffect, useState } from "react";
import { api } from "./api.js";

const emptyStats = { total: 0, completed: 0, pending: 0 };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    const [taskList, taskStats] = await Promise.all([
      api.listTasks(),
      api.getStats(),
    ]);
    setTasks(taskList);
    setStats(taskStats);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Enter a task title.");
      return;
    }
    try {
      await api.createTask(trimmed);
      setTitle("");
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(id) {
    setError("");
    setBusyId(id);
    try {
      await api.completeTask(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    setError("");
    setBusyId(id);
    try {
      await api.deleteTask(id);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <p className="brand">Carbon Arc</p>
        <h1>Tasks</h1>
        <p className="lede">Add, complete, and clear work as you go.</p>
      </header>

      <section className="stats" aria-label="Task statistics">
        <div>
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div>
          <span className="stat-label">Completed</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div>
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
      </section>

      <form className="add-form" onSubmit={handleAdd}>
        <label htmlFor="title" className="sr-only">
          New task
        </label>
        <input
          id="title"
          type="text"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">Add</button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="task-section" aria-label="Task list">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks yet. Add one above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "done" : ""}>
                <span className="task-title">{task.title}</span>
                <span className="task-status">
                  {task.completed ? "Done" : "Open"}
                </span>
                <div className="task-actions">
                  {!task.completed ? (
                    <button
                      type="button"
                      onClick={() => handleComplete(task.id)}
                      disabled={busyId === task.id}
                    >
                      Complete
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(task.id)}
                    disabled={busyId === task.id}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
