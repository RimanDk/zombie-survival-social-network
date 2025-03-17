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
        orm_mode = True


class LatLong(BaseModel):
    id: Optional[UUID]
    latitude: str
    longitude: str
    survivor_id: Optional[UUID]

    class Config:
        orm_mode = True


class InfectionReport(BaseModel):
    id: UUID
    reporter_id: UUID
    reported_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

class Inventory(BaseModel):
    survivor_id: UUID
    item_id: UUID
    quantity: int

    class Config:
        orm_mode = True

class Survivor(BaseModel):
    id: Optional[UUID] = None
    name: str
    age: int
    gender: str
    inventory: Dict[UUID, int]
    lastLocation: LatLong
    infectionReports: List[InfectionReport] = []

    class Config:
        orm_mode = True

class LatLongCreate(BaseModel):
    latitude: str
    longitude: str

class SurvivorCreate(BaseModel):
    id: Optional[UUID] = None
    name: str
    age: int
    gender: str
    inventory: Dict[UUID, int]
    lastLocation: LatLongCreate
    infectionReports: List[InfectionReport] = []
