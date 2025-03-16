from uuid import uuid4
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TEXT
from app.database import Base, engine

# ORM models


class Item(Base):
    __tablename__ = "items"

    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    label = Column(String)
    worth = Column(Integer)

    survivors = relationship("Inventory", back_populates="item")


class Survivor(Base):
    __tablename__ = "survivors"

    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    # lastLocation = Column()

    inventory = relationship("Inventory", back_populates="survivor")


class Inventory(Base):
    __tablename__ = "inventory"

    survivor_id = Column(TEXT, ForeignKey("survivors.id"), primary_key=True)
    item_id = Column(TEXT, ForeignKey("items.id"), primary_key=True)
    quantity = Column(Integer)

    survivor = relationship("Survivor", back_populates="inventory")
    item = relationship("Item", back_populates="survivors")


Base.metadata.create_all(bind=engine)
