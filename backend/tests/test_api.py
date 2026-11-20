"""Sample API tests for the task service."""

import pytest

from app import app, reset_store


@pytest.fixture(autouse=True)
def client():
    reset_store()
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_create_and_list_tasks(client):
    empty = client.get("/tasks")
    assert empty.status_code == 200
    assert empty.get_json() == []

    created = client.post("/tasks", json={"title": "Buy milk"})
    assert created.status_code == 201
    task = created.get_json()
    assert task == {"id": 1, "title": "Buy milk", "completed": False}

    listed = client.get("/tasks")
    assert listed.status_code == 200
    assert listed.get_json() == [task]


def test_complete_delete_and_stats(client):
    client.post("/tasks", json={"title": "One"})
    client.post("/tasks", json={"title": "Two"})

    stats = client.get("/tasks/stats").get_json()
    assert stats == {"total": 2, "completed": 0, "pending": 2}

    done = client.put("/tasks/1/complete")
    assert done.status_code == 200
    assert done.get_json()["completed"] is True

    stats = client.get("/tasks/stats").get_json()
    assert stats == {"total": 2, "completed": 1, "pending": 1}

    deleted = client.delete("/tasks/2")
    assert deleted.status_code == 204

    assert client.get("/tasks/stats").get_json() == {
        "total": 1,
        "completed": 1,
        "pending": 0,
    }

    missing = client.put("/tasks/99/complete")
    assert missing.status_code == 404
    assert "error" in missing.get_json()


def test_create_validation_errors(client):
    assert client.post("/tasks", data="not-json", content_type="text/plain").status_code == 400
    assert client.post("/tasks", json={}).status_code == 400
    assert client.post("/tasks", json={"title": "   "}).status_code == 400
    assert client.post("/tasks", json={"title": 123}).status_code == 400
