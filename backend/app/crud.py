"""CRUD operations for the Survivors API."""
from uuid import uuid4, UUID
from math import cos, radians, sqrt
from typing import List, Dict, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.pydantic_models import LatLongCreate, SurvivorTradePayload
from app.alchemy_models import InfectionReport, Inventory, Item, LatLong, Survivor


# Helper functions

def exclude_requesting_user(survivors: List[Survivor], user_id: str):
    """Finds the requesting survivor and removes them from the list."""
    requesting_survivor = next(
        (s for s in survivors if str(s.id) == user_id), None)
    survivors = [s for s in survivors if str(s.id) != user_id]
    return requesting_survivor, survivors


def calculate_distance(survivor: Survivor, reference: Survivor) -> Optional[float]:
    """Calculates distance between two survivors using Pythagoras."""
    if not reference or not reference.lastLocation or not survivor.lastLocation:
        return None  # No valid location to calculate

    x1, y1 = reference.lastLocation.latitude, reference.lastLocation.longitude
    x2, y2 = survivor.lastLocation.latitude, survivor.lastLocation.longitude

    # Scaling factors
    lat_m = 111_000  # Meters per degree latitude
    # Meters per degree longitude at this latitude
    lon_m = 111_320 * cos(radians(x1))

    # Convert degrees to meters
    lat_diff_m = (x2 - x1) * lat_m
    lon_diff_m = (y2 - y1) * lon_m

    # Rounded for readability
    return round(sqrt(lat_diff_m ** 2 + lon_diff_m ** 2), 2)


def format_survivor_response(survivor: Survivor, reference: Optional[Survivor] = None) -> Dict:
    """Formats a survivor into a dictionary for API response, adding distance if needed."""
    return {
        "id": survivor.id,
        "name": survivor.name,
        "age": survivor.age,
        "gender": survivor.gender,
        "lastLocation": {
            "id": survivor.lastLocation.id,
            "latitude": survivor.lastLocation.latitude,
            "longitude": survivor.lastLocation.longitude,
            "survivor_id": survivor.lastLocation.survivor_id,
            "distance": calculate_distance(survivor, reference)
        } if survivor.lastLocation else None,
        "infectionReports": [
            {
                "id": report.id,
                "reporter_id": report.reporter_id,
                "reported_id": report.reported_id,
                "created_at": report.created_at
            } for report in survivor.infectionReports
        ],
        "inventory": {str(item.item_id): item.quantity for item in survivor.inventory}
    }


def estimate_trade_value(items: Dict[UUID, int], master_list: List[Item]) -> int:
    """Estimates the total value of a trade."""

    item_lookup = {str(item.id): item.worth for item in master_list}

    return sum(quantity * item_lookup.get(str(item_id), 0) for item_id, quantity in items.items())

# CRUD operations


def get_possible_items(db: Session):
    """Returns all items in the system."""
    return db.query(Item).all()


def get_survivors(db: Session, user_id: Optional[str] = None, max_distance: Optional[int] = None):
    """Handles survivor retrieval based on filters and sorts them by distance if a user ID is provided."""
    survivors = [s for s in db.query(
        Survivor).all() if len(s.infectionReports) < 3]

    if not user_id:
        # Early exit
        return [format_survivor_response(s) for s in survivors]

    # Exclude the requesting user
    requesting_survivor, survivors = exclude_requesting_user(
        survivors, user_id)

    # Format and calculate distances
    survivor_list = [format_survivor_response(
        s, requesting_survivor) for s in survivors]

    # Sort by distance (None distances go last)
    survivor_list.sort(
        key=lambda s: (s["lastLocation"]["distance"] is None,
                       s["lastLocation"]["distance"] or 0)
    )

    if max_distance:
        survivor_list = [
            s for s in survivor_list
            if s["lastLocation"]["distance"] is not None and s["lastLocation"]["distance"] <= max_distance
        ]

    return survivor_list


def get_survivor_by_name_or_id(db: Session, name_or_id: str):
    """Returns a survivor by name or ID, raising an error if infected."""
    survivor = (
        db.query(Survivor)
        .filter(
            or_(
                func.lower(Survivor.name) == name_or_id.lower(),
                Survivor.id == name_or_id
            )
        )
        .first()
    )

    if not survivor:
        return None  # Not found in the system

    if len(survivor.infectionReports) >= 3:
        raise ValueError("Survivor is infected!")

    return format_survivor_response(survivor)


def create_survivor(db: Session, name: str, age: int, gender: str, location: LatLongCreate, items: dict):
    """Creates a new survivor with their inventory and location."""
    survivor = Survivor(id=str(uuid4()), name=name, age=age, gender=gender)
    db.add(survivor)
    db.commit()
    db.refresh(survivor)

    latlong = LatLong(id=str(uuid4()), latitude=location.latitude,
                      longitude=location.longitude, survivor_id=survivor.id)
    db.add(latlong)

    for item_id, quantity in items.items():
        # Let's check that the desired item exists
        item = db.query(Item).get(str(item_id))
        if not item:
            raise ValueError(f"Item with id {item_id} not found")

        inventory = Inventory(survivor_id=survivor.id,
                              item_id=str(item_id), quantity=quantity)
        db.add(inventory)

    db.commit()
    return format_survivor_response(survivor)


def report_infection(db: Session, reporter_id: str, reported_id: str):
    """Creates a new infection report."""
    if reporter_id == reported_id:
        raise ValueError("A survivor cannot report themselves")

    reporter = db.query(Survivor).get(reporter_id)
    if not reporter:
        raise ValueError(f"Survivor with id {reporter_id} not found")

    reported = db.query(Survivor).get(reported_id)
    if not reported:
        raise ValueError(f"Survivor with id {reported_id} not found")

    report = InfectionReport(
        id=str(uuid4()), reporter_id=reporter_id, reported_id=reported_id)

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def update_location(db: Session, survivor_id: str, latitude: str, longitude: str):
    """Updates a survivor's location."""
    survivor = db.query(Survivor).get(survivor_id)
    if not survivor:
        raise ValueError(f"Survivor with id {survivor_id} not found")

    latlong = survivor.lastLocation
    if not latlong:
        latlong = LatLong(id=str(uuid4()), latitude=latitude,
                          longitude=longitude)
        db.add(latlong)
        survivor.lastLocation = latlong
    else:
        latlong.latitude = latitude
        latlong.longitude = longitude

    db.commit()
    db.refresh(survivor)
    return format_survivor_response(survivor)


def delete_survivor(db: Session, survivor_id: str):
    """Deletes a survivor from the system."""
    survivor = db.query(Survivor).get(survivor_id)
    if not survivor:
        raise ValueError(f"Survivor with id {survivor_id} not found")

    db.delete(survivor)
    db.commit()
    return format_survivor_response(survivor)


def update_inventory(db: Session, survivor: Survivor, updated_inventory: Dict[str, int]):
    """Updates a survivor's inventory based on a dictionary of item quantities."""

    # Clear current inventory
    db.query(Inventory).filter(
        Inventory.survivor_id == survivor.id).delete()

    # Re-add updated inventory
    new_items = [
        Inventory(survivor_id=survivor.id,
                  item_id=item_id, quantity=quantity)
        for item_id, quantity in updated_inventory.items() if quantity > 0
    ]

    db.add_all(new_items)


def validate_trade(db: Session, survivor_a_items: SurvivorTradePayload, survivor_b_items: SurvivorTradePayload):
    """Validates a trade between two survivors."""
    # Validate that users exist
    survivor_a = db.query(Survivor).get(str(survivor_a_items.survivor_id))
    if not survivor_a:
        raise ValueError(
            f"Survivor with id {survivor_a_items.survivor_id} not found")

    survivor_b = db.query(Survivor).get(str(survivor_b_items.survivor_id))
    if not survivor_b:
        raise ValueError(
            f"Survivor with id {survivor_b_items.survivor_id} not found")

    survivor_a_inventory = {
        str(item.item_id): item.quantity for item in survivor_a.inventory}
    survivor_b_inventory = {
        str(item.item_id): item.quantity for item in survivor_b.inventory}

    # Validate that the users have the resources in their inventories
    # that they seek to trade
    def validate_inventory(
            survivor: Survivor,
            survivor_inventory: Dict[str, int],
            offered_items: Dict[UUID, int]):
        for item_id, offered_quantity in offered_items.items():
            available_quantity = survivor_inventory.get(str(item_id), 0)
            if offered_quantity > available_quantity:
                raise ValueError(
                    f"Insufficient items: Survivor {survivor.id} has {available_quantity}, but tried to trade {offered_quantity}")

    validate_inventory(survivor_a, survivor_a_inventory,
                       survivor_a_items.items)
    validate_inventory(survivor_b, survivor_b_inventory,
                       survivor_b_items.items)

    # Validate that the trade is balanced
    item_catalogue = get_possible_items(db)

    estimated_worth_a = estimate_trade_value(
        survivor_a_items.items, item_catalogue)
    estimated_worth_b = estimate_trade_value(
        survivor_b_items.items, item_catalogue)

    if estimated_worth_a != estimated_worth_b:
        raise ValueError(
            f"Trade is not balanced: Survivor A offers {estimated_worth_a}, Survivor B offers {estimated_worth_b}")

    return True


def trade_items(
        db: Session,
        survivor_a_items: SurvivorTradePayload,
        survivor_b_items: SurvivorTradePayload,
        dry_run: Optional[bool] = False):
    """Handles the trading of items between two survivors."""
    try:
        validate_trade(db, survivor_a_items, survivor_b_items)
    except ValueError as e:
        raise e

    if dry_run:
        return {"message": "Trade is valid"}

    survivor_a = db.query(Survivor).get(str(survivor_a_items.survivor_id))
    survivor_b = db.query(Survivor).get(str(survivor_b_items.survivor_id))
    survivor_a_inventory = {
        str(item.item_id): item.quantity for item in survivor_a.inventory}
    survivor_b_inventory = {
        str(item.item_id): item.quantity for item in survivor_b.inventory}

    # Perform the trade
    for item_id, quantity in survivor_a_items.items.items():
        if not survivor_a_inventory.get(str(item_id)):
            survivor_a_inventory[str(item_id)] = 0
        else:
            survivor_a_inventory[str(item_id)] -= quantity

        if not survivor_b_inventory.get(str(item_id)):
            survivor_b_inventory[str(item_id)] = quantity
        else:
            survivor_b_inventory[str(item_id)] += quantity

    for item_id, quantity in survivor_b_items.items.items():
        if not survivor_b_inventory.get(str(item_id)):
            survivor_b_inventory[str(item_id)] = 0
        else:
            survivor_b_inventory[str(item_id)] -= quantity

        if not survivor_a_inventory.get(str(item_id)):
            survivor_a_inventory[str(item_id)] = quantity
        else:
            survivor_a_inventory[str(item_id)] += quantity

    update_inventory(db, survivor_a, survivor_a_inventory)
    update_inventory(db, survivor_b, survivor_b_inventory)

    db.commit()

    return {"message": "Trade successful"}
