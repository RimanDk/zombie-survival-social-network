"""Fixtures for testing the FastAPI application."""
from uuid import uuid4
import logging
import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.alchemy_models import Survivor, Item, LatLong, Inventory
from fastapi.testclient import TestClient

# In-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@pytest.fixture(scope="function")
def db():
    """Creates a new test database and session."""
    test_db = TestingSessionLocal()
    try:
        # Log the tables that exist
        inspector = sqlalchemy.inspect(engine)
        table_names = inspector.get_table_names()
        logger.info(f"Tables in test database: {table_names}")

        yield test_db
    finally:
        # Reset the data, but keep the tables
        for table in reversed(Base.metadata.sorted_tables):
            test_db.execute(sqlalchemy.text(f"DELETE FROM {table.name}"))
        test_db.commit()
        test_db.close()


@pytest.fixture(scope="function")
def seed_data(db):
    """Seeds the database with initial data."""
    # Create some items
    items = [
        Item(id=str(uuid4()), label="water", worth=4),
        Item(id=str(uuid4()), label="food", worth=3),
        Item(id=str(uuid4()), label="medication", worth=2),
        Item(id=str(uuid4()), label="ammunition", worth=1),
    ]
    db.add_all(items)
    db.commit()

    assert db.query(Item).count() == 4

    # Create first survivor: Alice with some inventory
    alice_id = str(uuid4())
    alice = Survivor(id=alice_id, name="Alice",
                     age=30, gender="f", lastLocation=None)
    db.add(alice)
    db.commit()

    location = LatLong(
        id=str(uuid4()), latitude=55.675419, longitude=12.564300, survivor_id=alice_id)
    db.add(location)
    db.commit()

    # Create second survivor: Bob with different inventory
    bob_id = str(uuid4())
    bob = Survivor(id=bob_id, name="Bob",
                   age=35, gender="m", lastLocation=None)
    db.add(bob)
    db.commit()

    bob_location = LatLong(
        id=str(uuid4()), latitude=55.676123, longitude=12.568432, survivor_id=bob_id)
    db.add(bob_location)
    db.commit()

    # Add inventory for Alice
    alice_inventory = [
        Inventory(survivor_id=alice_id,
                  item_id=items[0].id, quantity=5),  # water
        Inventory(survivor_id=alice_id,
                  item_id=items[1].id, quantity=10),  # food
        Inventory(survivor_id=alice_id,
                  item_id=items[2].id, quantity=2),  # medication
        Inventory(survivor_id=alice_id,
                  item_id=items[3].id, quantity=3),  # ammunition
    ]
    db.add_all(alice_inventory)

    # Add inventory for Bob (medication and ammunition)
    bob_inventory = [
        Inventory(survivor_id=bob_id,
                  item_id=items[0].id, quantity=3),  # water
        Inventory(survivor_id=bob_id,
                  item_id=items[1].id, quantity=7),  # food
        Inventory(survivor_id=bob_id,
                  item_id=items[2].id, quantity=4),  # medication
        Inventory(survivor_id=bob_id,
                  item_id=items[3].id, quantity=10),  # ammunition
    ]
    db.add_all(bob_inventory)
    db.commit()

    yield


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with DB session override."""
    # Define the override explicitly
    def override_get_db():
        try:
            yield db
        finally:
            pass

    # Override with our test db
    app.dependency_overrides[get_db] = override_get_db

    # Create client
    # noinspection PyShadowingNames
    with TestClient(app) as client:
        yield client

    # Clear the override
    app.dependency_overrides.clear()
