from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "sqlite:///./zombie-apocalypse.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pre-seed the database


def seed_items(db_session):
    from app.alchemy_models import Item
    items = [
        Item(label="water", worth=4),
        Item(label="food", worth=3),
        Item(label="medication", worth=2),
        Item(label="ammunition", worth=1),
    ]
    db_session.bulk_save_objects(items)
    db_session.commit()

# Create the database tables


def init_db():
    import app.alchemy_models
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from app.alchemy_models import Item
        if not db.query(Item).first():  # Prevent duplicate seeding
            seed_items(db)
    finally:
        db.close()


init_db()  # Run on import
