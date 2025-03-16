from uuid import uuid4
from sqlalchemy.orm import Session
from app.alchemy_models import Item, Survivor, Inventory


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
