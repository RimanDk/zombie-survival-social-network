from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

# I/O Schemas


class Item(BaseModel):
    id: UUID
    label: str
    worth: int

    class Config:
        from_attributes = True


class LatLong(BaseModel):
    id: Optional[UUID]
    latitude: float
    longitude: float
    distance: Optional[float] = None
    survivor_id: Optional[UUID]

    class Config:
        from_attributes = True


class LatLongUpdate(BaseModel):
    latitude: float
    longitude: float


class InfectionReport(BaseModel):
    id: UUID
    reporter_id: UUID
    reported_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class Inventory(BaseModel):
    survivor_id: UUID
    item_id: UUID
    quantity: int

    class Config:
        from_attributes = True


class Survivor(BaseModel):
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
    latitude: float
    longitude: float


class SurvivorCreate(BaseModel):
    id: Optional[UUID] = None
    name: str
    age: int
    gender: str
    inventory: Dict[UUID, int]
    lastLocation: LatLongCreate
    infectionReports: List[InfectionReport] = []


class SurvivorTradePayload(BaseModel):
    survivor_id: UUID
    items: Dict[UUID, int]
