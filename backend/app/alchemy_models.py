"""Collection of ORM models for the database."""
from uuid import uuid4
from sqlalchemy import Column, Float, Integer, String, ForeignKey, TIMESTAMP, TEXT, text
from sqlalchemy.orm import relationship
from app.database import Base, engine

# ORM models


class Item(Base):
    """Model for items that can be carried in a survivor's inventory."""
    __tablename__ = "items"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    label = Column(String)
    worth = Column(Integer)
    survivors = relationship("Inventory", back_populates="item")


class Survivor(Base):
    """Model for survivors in the Zombie Apocalypse app."""
    __tablename__ = "survivors"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    lastLocation = relationship(
        "LatLong", back_populates="survivor", uselist=False)
    infectionReports = relationship(
        "InfectionReport",
        foreign_keys="[InfectionReport.reported_id]",
        back_populates="reported",
        cascade="all, delete-orphan"
    )
    inventory = relationship("Inventory", back_populates="survivor")


class LatLong(Base):
    """Model for the last known location of a survivor."""
    __tablename__ = "latlong"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    survivor_id = Column(TEXT, ForeignKey("survivors.id"))
    survivor = relationship("Survivor", back_populates="lastLocation")


class InfectionReport(Base):
    """Model for reports of infection between survivors."""
    __tablename__ = "infection_reports"
    id = Column(TEXT, primary_key=True, default=lambda: str(uuid4()))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    reported_id = Column(TEXT, ForeignKey("survivors.id"))
    reporter_id = Column(TEXT, ForeignKey("survivors.id"))
    reported = relationship("Survivor", foreign_keys=[
                            reported_id], back_populates="infectionReports")
    reporter = relationship("Survivor", foreign_keys=[reporter_id])


class Inventory(Base):
    """Model for the inventory of a survivor."""
    __tablename__ = "inventory"
    survivor_id = Column(TEXT, ForeignKey("survivors.id"), primary_key=True)
    item_id = Column(TEXT, ForeignKey("items.id"), primary_key=True)
    quantity = Column(Integer)
    survivor = relationship("Survivor", back_populates="inventory")
    item = relationship("Item", back_populates="survivors")


Base.metadata.create_all(bind=engine)
