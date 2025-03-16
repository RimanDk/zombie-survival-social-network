from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    id: str
    label: str
    value: int

class LatLong(BaseModel):
    id: str
    latitude: str
    longitude: str

class InfectionReport(BaseModel):
    id: str
    created: int
    reporter: str

class Survivor(BaseModel):
    id: str
    name: str
    gender: str
    lastLocation: LatLong
    inventory: list[Item]
    InfectionReports: list[InfectionReport]
