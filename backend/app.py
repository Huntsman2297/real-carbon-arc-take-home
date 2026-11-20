"""In-memory Flask task API."""

from flask import Flask, jsonify, request

app = Flask(__name__)

# In-memory store: id -> task dict
_tasks: dict[int, dict] = {}
_next_id = 1


def reset_store() -> None:
    """Clear store (used by tests)."""
    global _next_id
    _tasks.clear()
    _next_id = 1


def _error(message: str, status: int):
    return jsonify({"error": message}), status


@app.get("/tasks")
def list_tasks():
    return jsonify(list(_tasks.values()))


@app.post("/tasks")
def create_task():
    if not request.is_json:
        return _error("Request body must be JSON", 400)

    data = request.get_json(silent=True)
    if data is None:
        return _error("Invalid JSON body", 400)
    if not isinstance(data, dict):
        return _error("Request body must be a JSON object", 400)

    title = data.get("title")
    if title is None:
        return _error("Missing required field: title", 400)
    if not isinstance(title, str):
        return _error("title must be a string", 400)

    title = title.strip()
    if not title:
        return _error("title must not be empty", 400)

    global _next_id
    task = {"id": _next_id, "title": title, "completed": False}
    _tasks[_next_id] = task
    _next_id += 1
    return jsonify(task), 201


@app.put("/tasks/<int:task_id>/complete")
def complete_task(task_id: int):
    task = _tasks.get(task_id)
    if task is None:
        return _error(f"Task {task_id} not found", 404)
    task["completed"] = True
    return jsonify(task)


@app.delete("/tasks/<int:task_id>")
def delete_task(task_id: int):
    if task_id not in _tasks:
        return _error(f"Task {task_id} not found", 404)
    del _tasks[task_id]
    return "", 204


@app.get("/tasks/stats")
def task_stats():
    total = len(_tasks)
    completed = sum(1 for t in _tasks.values() if t["completed"])
    return jsonify(
        {
            "total": total,
            "completed": completed,
            "pending": total - completed,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
