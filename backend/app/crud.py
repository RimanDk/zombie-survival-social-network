from uuid import uuid4
from math import sqrt
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
    return round(sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 6)  # Rounded for readability

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
        "infectionReports": [report.reporter_id for report in survivor.infectionReports],
        "inventory": {str(item.item_id): item.quantity for item in survivor.inventory}
    }

# CRUD operations

def get_possible_items(db: Session):
    return db.query(Item).all()


def get_survivors(db: Session, user_id: Optional[str] = None):
    """Handles survivor retrieval based on filters and formats the response."""
    survivors = db.query(Survivor).all()

    requesting_survivor = None
    if user_id:
        requesting_survivor, survivors = exclude_requesting_user(survivors, user_id)

    return [format_survivor_response(s, requesting_survivor) for s in survivors]


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
    return format_survivor_response(survivor) if survivor else None


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
