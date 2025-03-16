from typing import List
from uuid import UUID
from pydantic import BaseModel

# I/O Schemas


class Item(BaseModel):
    id: UUID
    label: str
    worth: int

    class Config:
        orm_mode = True


class LatLong(BaseModel):
    id: UUID
    latitude: str
    longitude: str


class InfectionReport(BaseModel):
    id: UUID
    created: int
    reporter: str


class Survivor(BaseModel):
    id: UUID
    name: str
    age: int
    gender: str
    inventory: List[UUID]
    # lastLocation: LatLong
    # InfectionReports: List[InfectionReport]

    class Config:
        orm_mode = True


class Inventory(BaseModel):
    survivor_id: UUID
    item_id: UUID
    quantity: int

    class Config:
        orm_mode = True
