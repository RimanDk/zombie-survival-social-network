"""Contains Pydantic models for the API."""
from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

# I/O Schemas


class Item(BaseModel):
    """Model for a base item"""
    id: UUID
    label: str
    worth: int

    class Config:
        from_attributes = True


class LatLong(BaseModel):
    """Model for a latitude and longitude pair for a survivor's location"""
    id: Optional[UUID]
    latitude: float
    longitude: float
    distance: Optional[float] = None
    survivor_id: Optional[UUID]

    class Config:
        from_attributes = True


class LatLongUpdate(BaseModel):
    """Minimal model for updating a survivor's location"""
    latitude: float
    longitude: float


class InfectionReport(BaseModel):
    """Model for an infection report"""
    id: UUID
    reporter_id: UUID
    reported_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Inventory(BaseModel):
    """Model for a survivor's inventory"""
    survivor_id: UUID
    item_id: UUID
    quantity: int

    class Config:
        from_attributes = True


class Survivor(BaseModel):
    """Model for a survivor"""
    id: Optional[UUID] = None
    name: str
    age: int
    gender: str
    inventory: Dict[UUID, int]
    lastLocation: LatLong
    infectionReports: List[InfectionReport] = []

    class Config:
        from_attributes = True


class LatLongCreate(BaseModel):
    """Model for creating a latitude and longitude pair for a survivor's location"""
    latitude: float
    longitude: float


class SurvivorCreate(BaseModel):
    """Model for creating a survivor"""
    id: Optional[UUID] = None
    name: str
    age: int
    gender: str
    inventory: Dict[UUID, int]
    lastLocation: LatLongCreate
    infectionReports: List[InfectionReport] = []


class SurvivorTradePayload(BaseModel):
    """Model for a survivor trade payload"""
    survivor_id: UUID
    items: Dict[UUID, int]
