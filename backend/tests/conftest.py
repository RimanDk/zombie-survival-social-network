from uuid import uuid4
import logging
import pytest
import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.alchemy_models import Survivor, Item, LatLong, InfectionReport, Inventory
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
def test_db():
    """Creates a new test database and session."""
    db = TestingSessionLocal()
    try:
        # Log the tables that exist
        inspector = sqlalchemy.inspect(engine)
        table_names = inspector.get_table_names()
        logger.info(f"Tables in test database: {table_names}")

        yield db
    finally:
        # Reset the data, but keep the tables
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(sqlalchemy.text(f"DELETE FROM {table.name}"))
        db.commit()
        db.close()


@pytest.fixture(scope="function")
def seed_data(test_db):
    """Seeds the database with initial data."""
    # Create some items
    items = [
        Item(id=str(uuid4()), label="water", worth=4),
        Item(id=str(uuid4()), label="food", worth=3),
        Item(id=str(uuid4()), label="medication", worth=2),
        Item(id=str(uuid4()), label="ammunition", worth=1),
    ]
    test_db.add_all(items)
    test_db.commit()

    assert test_db.query(Item).count() == 4

    # Create a survivor with some inventory
    survivor = Survivor(id=str(uuid4()), name="Alice",
                        age=30, gender="f", lastLocation=None)
    test_db.add(survivor)
    test_db.commit()

    location = LatLong(
        id=str(uuid4()), latitude=55.675419, longitude=12.564300, survivor_id=survivor.id)
    test_db.add(location)
    test_db.commit()

    inventory_items = [
        Inventory(
            survivor_id=survivor.id, item_id=items[0].id, quantity=5),
        Inventory(
            survivor_id=survivor.id, item_id=items[1].id, quantity=10),
        Inventory(
            survivor_id=survivor.id, item_id=items[2].id, quantity=2),
        Inventory(
            survivor_id=survivor.id, item_id=items[3].id, quantity=3),
    ]
    test_db.add_all(inventory_items)
    test_db.commit()

    yield


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with DB session override."""
    # Define the override explicitly
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    # Override with our test db
    app.dependency_overrides[get_db] = override_get_db

    # Create client
    with TestClient(app) as client:
        yield client

    # Clear the override
    app.dependency_overrides.clear()
