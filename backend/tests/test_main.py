import logging
from fastapi.testclient import TestClient
from app.main import app
from app.alchemy_models import Item, Survivor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


def test_get_items(test_db, client, seed_data):
    """Test fetching all items."""
    response = client.get("/items/")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 4
    assert any(i["label"] == "water" for i in items)


def test_get_survivors(test_db, client, seed_data):
    """Test fetching all survivors."""
    response = client.get("/survivors/")
    assert response.status_code == 200
    survivors = response.json()
    assert any(s["name"] == "Alice" for s in survivors)
    assert len(survivors) > 0
