"""Test the FastAPI from app."""
import logging
from uuid import uuid4
from fastapi.testclient import TestClient
from app.main import app
from app.alchemy_models import Item, Survivor, LatLong, Inventory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


# Items
def test_get_items(db, client, seed_data):
    """Test fetching all items."""
    response = client.get("/items/")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 4
    assert any(i["label"] == "water" for i in items)


# Survivors
def test_get_survivors(db, client, seed_data):
    """Test fetching all survivors."""
    response = client.get("/survivors/")
    assert response.status_code == 200
    survivors = response.json()
    assert any(s["name"] == "Alice" for s in survivors)
    assert len(survivors) > 0


def test_get_survivor_by_id(db, client, seed_data):
    """Test fetching a survivor by ID."""
    # Get pre-seeded survivor
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    assert alice is not None, "Pre-seeded Alice not found"

    response = client.get(f"/survivors/{alice.id}")
    assert response.status_code == 200
    survivor = response.json()
    assert survivor["name"] == "Alice"


def test_get_survivor_by_name(db, client, seed_data):
    """Test fetching a survivor by name."""
    # Get pre-seeded survivor
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    assert alice is not None, "Pre-seeded Alice not found"

    response = client.get(f"/survivors/Alice")
    assert response.status_code == 200
    survivor = response.json()
    assert survivor["name"] == "Alice"


def test_create_survivor(db, client, seed_data):
    """Test creating a new survivor."""
    # Get pre-seeded items
    items = db.query(Item).all()

    # Create a new survivor via the API - adjust format based on your API expectations
    new_survivor = {
        "name": "Bob",
        "age": 35,
        "gender": "m",
        "inventory": {
            str(items[0].id): 3,
            str(items[1].id): 5,
            str(items[2].id): 1,
            str(items[3].id): 10,
        },
        "lastLocation": {
            "latitude": 55.676123,
            "longitude": 12.568432,
        },
    }

    response = client.post("/survivors/", json=new_survivor)
    assert response.status_code == 201

    created = response.json()

    # Verify the survivor was created with expected data
    assert created["name"] == "Bob"
    assert created["age"] == 35
    assert created["gender"] == "m"
    assert created["lastLocation"]["latitude"] == 55.676123
    assert created["lastLocation"]["longitude"] == 12.568432

    # Verify inventory was created
    assert "inventory" in created
    inventory = created["inventory"]

    inventory = created["inventory"]
    for i, item in enumerate(items):
        item_id = str(item.id)
        # For water, food, medication, ammunition
        expected_quantities = [3, 5, 1, 10]
        assert item_id in inventory
        assert inventory[item_id] == expected_quantities[i]

    # Verify survivor exists in database
    created_id = created["id"]
    db_survivor = db.query(Survivor).filter(Survivor.id == created_id).first()
    assert db_survivor is not None
    assert db_survivor.name == "Bob"


# Infection reports
def test_report_infection(db, client, seed_data):
    """Test reporting another survivor as infected."""
    # Get pre-seeded survivors
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    bob = db.query(Survivor).filter(Survivor.name == "Bob").first()

    assert alice is not None, "Pre-seeded Alice not found"
    assert bob is not None, "Pre-seeded Bob not found"

    # Check initial infection reports count
    bob_before = client.get(f"/survivors/{bob.id}").json()
    initial_reports = len(bob_before.get("infectionReports", []))

    response = client.post(
        f"/survivors/{bob.id}/report/",
        headers={"X-User-Id": alice.id}
    )

    assert response.status_code == 201

    # Check Bob's updated infection status
    bob_after = client.get(f"/survivors/{bob.id}").json()
    assert len(bob_after.get("infectionReports", [])) == initial_reports + 1

    # Verify the report contains Alice as the reporter
    found_alice_report = False
    for report in bob_after.get("infectionReports", []):
        if report.get("reporter_id") == alice.id:
            found_alice_report = True
            break

    assert found_alice_report, "Alice's infection report not found"


# Locations
def test_update_survivor_location(db, client, seed_data):
    """Test updating a survivor's location."""
    # Get pre-seeded survivor
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    assert alice is not None, "Pre-seeded Alice not found"

    # New location data
    new_location = {
        "latitude": 45.123456,
        "longitude": 75.654321
    }

    # Update Alice's location
    response = client.put(
        f"/survivors/{alice.id}/location/",
        json=new_location,
        headers={"X-User-Id": alice.id}
    )

    assert response.status_code == 200
    result = response.json()

    # Verify the location was updated
    assert result["lastLocation"]["latitude"] == new_location["latitude"]
    assert result["lastLocation"]["longitude"] == new_location["longitude"]

    # Double-check by getting Alice's data again
    alice_after = client.get(f"/survivors/{alice.id}").json()
    assert alice_after["lastLocation"]["latitude"] == new_location["latitude"]
    assert alice_after["lastLocation"]["longitude"] == new_location["longitude"]


def test_cannot_update_other_survivor_location(db, client, seed_data):
    """Test that a survivor cannot update another survivor's location."""
    # Get pre-seeded survivors
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    bob = db.query(Survivor).filter(Survivor.name == "Bob").first()

    assert alice is not None, "Pre-seeded Alice not found"
    assert bob is not None, "Pre-seeded Bob not found"

    # New location data
    new_location = {
        "latitude": 45.123456,
        "longitude": -75.654321
    }

    # Bob tries to update Alice's location
    response = client.put(
        f"/survivors/{alice.id}/location",
        json=new_location,
        headers={"X-User-Id": bob.id}
    )

    assert response.status_code == 401
    error_result = response.json()
    assert "you can only update your own location." in error_result.get(
        "detail", "").lower()


# Trading
def test_trade_between_survivors(db, client, seed_data):
    """Test trading between two survivors using pre-seeded data."""
    # Get pre-seeded items from the database
    water = db.query(Item).filter(Item.label == "water").first()
    food = db.query(Item).filter(Item.label == "food").first()
    medication = db.query(Item).filter(Item.label == "medication").first()
    ammunition = db.query(Item).filter(Item.label == "ammunition").first()

    # Get the pre-seeded survivors
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    bob = db.query(Survivor).filter(Survivor.name == "Bob").first()

    assert alice is not None, "Pre-seeded Alice not found"
    assert bob is not None, "Pre-seeded Bob not found"

    # Get current inventories to calculate differences
    alice_before = client.get(f"/survivors/{alice.id}").json()
    bob_before = client.get(f"/survivors/{bob.id}").json()

    # Now perform a trade: Alice gives 2 water for Bob's 4 medication
    trade_request = {
        "survivor_a_items": {
            "survivor_id": alice.id,
            "items": {
                str(water.id): 2,
                str(food.id): 0,
                str(medication.id): 0,
                str(ammunition.id): 0
            }
        },
        "survivor_b_items": {
            "survivor_id": bob.id,
            "items": {
                str(water.id): 0,
                str(food.id): 0,
                str(medication.id): 4,
                str(ammunition.id): 0
            }
        }
    }

    # Execute the trade
    response = client.post(
        "/survivors/trade/",
        json=trade_request,
        headers={"X-User-Id": alice.id}
    )
    assert response.status_code == 201

    # Check updated inventories
    alice_after = client.get(f"/survivors/{alice.id}").json()
    bob_after = client.get(f"/survivors/{bob.id}").json()

    # Alice should now have 2 fewer water and 4 more medication
    alice_inventory = alice_after["inventory"]
    assert str(water.id) in alice_inventory
    assert alice_inventory[str(water.id)] == alice_before["inventory"].get(
        str(water.id), 0) - 2  # Gave 2 to Bob
    assert str(food.id) in alice_inventory
    assert alice_inventory[str(food.id)] == alice_before["inventory"].get(
        str(food.id), 0)  # No change
    assert str(medication.id) in alice_inventory
    assert alice_inventory[str(medication.id)] == alice_before["inventory"].get(
        str(medication.id), 0) + 4  # Received 4 from Bob
    assert str(ammunition.id) in alice_inventory
    assert alice_inventory[str(ammunition.id)] == alice_before["inventory"].get(
        str(ammunition.id), 0)  # No change

    # Check Bob's updated inventory
    bob_inventory = bob_after["inventory"]
    assert str(water.id) in bob_inventory
    assert bob_inventory[str(water.id)] == bob_before["inventory"].get(
        str(water.id), 0) + 2  # Received 2 from Alice
    assert str(food.id) in bob_inventory
    assert bob_inventory[str(food.id)] == bob_before["inventory"].get(
        str(food.id), 0)  # No change
    assert str(medication.id) in bob_inventory
    assert bob_inventory[str(medication.id)] == bob_before["inventory"].get(
        str(medication.id), 0) - 4  # Gave 4 to Alice
    assert str(ammunition.id) in bob_inventory
    assert bob_inventory[str(ammunition.id)] == bob_before["inventory"].get(
        str(ammunition.id), 0)  # No change


def test_unfair_trade_rejected(db, client, seed_data):
    """Test that unfair trades are rejected using pre-seeded data."""
    # Get pre-seeded items
    water = db.query(Item).filter(Item.label == "water").first()
    food = db.query(Item).filter(Item.label == "food").first()
    medication = db.query(Item).filter(Item.label == "medication").first()
    ammunition = db.query(Item).filter(Item.label == "ammunition").first()

    # Get pre-seeded Alice and Bob
    alice = db.query(Survivor).filter(Survivor.name == "Alice").first()
    bob = db.query(Survivor).filter(Survivor.name == "Bob").first()

    assert alice is not None, "Pre-seeded Alice not found"
    assert bob is not None, "Pre-seeded Bob not found"

    # Get current inventories to calculate differences
    alice_before = client.get(f"/survivors/{alice.id}").json()
    bob_before = client.get(f"/survivors/{bob.id}").json()

    # Unfair trade: Alice gives 1 water (worth 4) for Bob's 3 food (worth 9)
    unfair_trade = {
        "survivor_a_items": {
            "survivor_id": alice.id,
            "items": {
                str(water.id): 2,
                str(food.id): 0,
                str(medication.id): 0,
                str(ammunition.id): 0
            }
        },
        "survivor_b_items": {
            "survivor_id": bob.id,
            "items": {
                str(water.id): 0,
                str(food.id): 0,
                str(medication.id): 0,
                str(ammunition.id): 4
            }
        }
    }

    # This trade should be rejected
    response = client.post(
        "/survivors/trade/",
        json=unfair_trade,
        headers={"X-User-Id": alice.id}
    )
    assert response.status_code == 400
    error_result = response.json()

    # Verify error message
    assert "trade is not balanced: survivor a offers 8, survivor b offers 4" in error_result.get(
        "detail", "").lower()

    # Verify inventories remain unchanged
    alice_after = client.get(f"/survivors/{alice.id}").json()
    bob_after = client.get(f"/survivors/{bob.id}").json()

    # Verify Alice's water amount hasn't changed
    alice_inventory = alice_after["inventory"]
    assert str(water.id) in alice_inventory
    assert alice_inventory[str(water.id)] == alice_before["inventory"].get(
        str(water.id), 0)

    # Verify Bob's food amount hasn't changed
    bob_inventory = bob_after["inventory"]
    assert str(food.id) in bob_inventory
    assert bob_inventory[str(food.id)] == bob_before["inventory"].get(
        str(food.id), 0)
