from uuid import uuid4
from math import cos, radians, sqrt
from typing import List, Dict, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.pydantic_models import LatLongCreate
from app.alchemy_models import InfectionReport, Inventory, Item, LatLong, Survivor


# Helper functions

def exclude_requesting_user(survivors: List[Survivor], user_id: str):
    """Finds the requesting survivor and removes them from the list."""
    requesting_survivor = next((s for s in survivors if str(s.id) == user_id), None)
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
    lon_m = 111_320 * cos(radians(x1))  # Meters per degree longitude at this latitude

    # Convert degrees to meters
    lat_diff_m = (x2 - x1) * lat_m
    lon_diff_m = (y2 - y1) * lon_m

    return round(sqrt(lat_diff_m ** 2 + lon_diff_m ** 2), 2)  # Rounded for readability

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

# CRUD operations

def get_possible_items(db: Session):
    return db.query(Item).all()


def get_survivors(db: Session, user_id: Optional[str] = None, max_distance: Optional[int] = None):
    """Handles survivor retrieval based on filters and sorts them by distance if a user ID is provided."""
    survivors = [s for s in db.query(Survivor).all() if len(s.infectionReports) < 3]

    if not user_id:
        # Early exit
        return [format_survivor_response(s) for s in survivors]

    # Exclude the requesting user
    requesting_survivor, survivors = exclude_requesting_user(survivors, user_id)

    # Format and calculate distances
    survivor_list = [format_survivor_response(s, requesting_survivor) for s in survivors]

    # Sort by distance (None distances go last)
    survivor_list.sort(key=lambda s: (s["lastLocation"]["distance"] is None, s["lastLocation"]["distance"] or 0))

    if max_distance:
        survivor_list = [s for s in survivor_list if s["lastLocation"]["distance"] and s["lastLocation"]["distance"] <= max_distance]

    return survivor_list


def get_survivor_by_name_or_id(db: Session, name_or_id: str):
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
    return survivor

def delete_survivor(db: Session, survivor_id: str):
    survivor = db.query(Survivor).get(survivor_id)
    if not survivor:
        raise ValueError(f"Survivor with id {survivor_id} not found")

    db.delete(survivor)
    db.commit()
    return survivor
