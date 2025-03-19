from typing import List, Optional
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db
from app.pydantic_models import InfectionReport, Item, LatLongUpdate, Survivor, SurvivorCreate
import app.crud as crud

# Create the API
app = FastAPI(
    title="Zombie Apocalypse API",
    description="API to interact with the Zombie Apocalypse app",
    version="0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
@app.get("/items/", response_model=List[Item])
def get_items(db: Session = Depends(get_db)):
    items = crud.get_possible_items(db)
    return items


@app.get("/survivors/", response_model=List[Survivor])
def get_survivors(
    user_id: Optional[str] = Header(None, alias="X-User-Id"),
    max_distance: Optional[int] = None,
    db: Session = Depends(get_db)):
    survivors = crud.get_survivors(db, user_id, max_distance)
    return survivors


@app.get("/survivors/{name_or_id}", response_model=Optional[Survivor])
def get_survivor_by_name_or_id(name_or_id: str, db: Session = Depends(get_db)):
    try:
        survivor = crud.get_survivor_by_name_or_id(db, name_or_id)
        if not survivor:
            raise HTTPException(status_code=404, detail="Survivor not found in the system")
        return survivor
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@app.post("/survivors/", response_model=Survivor)
def create_survivor(survivor: SurvivorCreate, db: Session = Depends(get_db)):
    survivor = crud.create_survivor(
        db, survivor.name, survivor.age, survivor.gender, survivor.lastLocation, survivor.inventory)
    return survivor


@app.post("/survivors/{reported_id}/report/", response_model=InfectionReport)
def report_infection(
    reported_id: str,
    user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)):

    if not user_id:
        raise HTTPException(status_code=401, detail="You need to be logged in to report an infection.")

    report = crud.report_infection(db, user_id, reported_id)
    return report


@app.put("/survivors/{survivor_id}/location/", response_model=Survivor)
def update_location(
    survivor_id: str,
    latlong: LatLongUpdate,
    user_id: str = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db)):

    if not user_id:
        raise HTTPException(status_code=401, detail="You need to be logged in.")

    if user_id != survivor_id:
        raise HTTPException(status_code=401, detail="You can only update your own location.")

    survivor = crud.update_location(
        db, survivor_id, latlong.latitude, latlong.longitude)
    return survivor

@app.delete("/survivors/{survivor_id}/", response_model=Survivor)
def delete_survivor(survivor_id: str, db: Session = Depends(get_db)):
    survivor = crud.delete_survivor(db, survivor_id)
    return survivor
