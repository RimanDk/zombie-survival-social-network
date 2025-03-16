from uuid import uuid4
from sqlalchemy.orm import Session
from app.alchemy_models import Item, Survivor, Inventory, InfectionReport, LatLong


def get_possible_items(db: Session):
    return db.query(Item).all()


def get_survivors(db: Session):
    return db.query(Survivor).all()


def create_survivor(db: Session, name: str, age: int, gender: str, items: dict):
    survivor = Survivor(id=str(uuid4()), name=name, age=age, gender=gender)
    db.add(survivor)
    db.commit()
    db.refresh(survivor)

    for item_id, quantity in items.items():
        # Let's check that the desired item exists
        item = db.query(Item).get(item_id)
        if not item:
            raise ValueError(f"Item with id {item_id} not found")

        inventory = Inventory(survivor_id=survivor.id,
                              item_id=item_id, quantity=quantity)
        db.add(inventory)

    db.commit()
    return survivor


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
