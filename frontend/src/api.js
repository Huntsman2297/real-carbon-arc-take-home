async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 204) {
    return null;
  }

  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  listTasks: () => request("/tasks"),
  createTask: (title) =>
    request("/tasks", { method: "POST", body: JSON.stringify({ title }) }),
  completeTask: (id) => request(`/tasks/${id}/complete`, { method: "PUT" }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  getStats: () => request("/tasks/stats"),
};
