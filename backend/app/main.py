from typing import List
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.pydantic_models import Item, Survivor
import app.crud as crud

# Create the API
app = FastAPI(
    title="Zombie Apocalypse API",
    description="API to interact with the Zombie Apocalypse app",
    version="0.1",
)


# Routes
@app.get("/items/", response_model=List[Item])
def get_items(db: Session = Depends(get_db)):
    items = crud.get_possible_items(db)
    return items


@app.get("/survivors/", response_model=List[Survivor])
def get_survivors(db: Session = Depends(get_db)):
    survivors = crud.get_survivors(db)
    return survivors


@app.post("/survivors/", response_model=Survivor)
def create_survivor(survivor: Survivor, db: Session = Depends(get_db)):
    survivor = crud.create_survivor(
        db, survivor.name, survivor.age, survivor.gender, survivor.inventory)
    return survivor
