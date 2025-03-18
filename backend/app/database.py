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

def seed_survivors(db_session):
    from app.alchemy_models import Item
    items = db_session.query(Item).all()

    from app.alchemy_models import Survivor
    survivors = [
        Survivor(name="Jack", age=30, gender="m"),
        Survivor(name="Emma", age=5, gender="f"),
        Survivor(name="Liam", age=10, gender="m"),
        Survivor(name="Olivia", age=15, gender="f"),
        Survivor(name="Noah", age=20, gender="m"),
        Survivor(name="Ava", age=25, gender="f"),
        Survivor(name="William", age=30, gender="m"),
        Survivor(name="Sophia", age=35, gender="f"),
        Survivor(name="James", age=40, gender="m"),
        Survivor(name="Isabella", age=45, gender="f"),
        Survivor(name="Benjamin", age=50, gender="m"),
        Survivor(name="Mia", age=55, gender="f"),
        Survivor(name="Lucas", age=59, gender="m"),
        Survivor(name="Ella", age=6, gender="f"),
        Survivor(name="Henry", age=11, gender="m"),
        Survivor(name="Amelia", age=16, gender="f"),
        Survivor(name="Alexander", age=21, gender="m"),
        Survivor(name="Charlotte", age=26, gender="f"),
        Survivor(name="Sebastian", age=31, gender="m"),
        Survivor(name="Harper", age=36, gender="f"),
        Survivor(name="Daniel", age=41, gender="m"),
        Survivor(name="Evelyn", age=46, gender="f"),
        Survivor(name="Matthew", age=51, gender="m"),
        Survivor(name="Abigail", age=56, gender="f"),
        Survivor(name="Oliver", age=7, gender="m"),
        Survivor(name="Emily", age=12, gender="f"),
        Survivor(name="Jacob", age=17, gender="m"),
        Survivor(name="Katrine", age=22, gender="f"),
        Survivor(name="Michael", age=27, gender="m"),
        Survivor(name="Aarav", age=32, gender="m")
    ]

    db_session.add_all(survivors)
    db_session.commit()

    from app.alchemy_models import LatLong
    locations = [
        LatLong(latitude=55.675419558911905, longitude=12.564300846013314, survivor_id=survivors[0].id),
        LatLong(latitude=55.65516537453284, longitude=12.447689887187982, survivor_id=survivors[1].id),
        LatLong(latitude=55.674548626919204, longitude=12.554647620944992, survivor_id=survivors[2].id),
        LatLong(latitude=55.61353519221935, longitude=12.551944717925862, survivor_id=survivors[3].id),
        LatLong(latitude=55.68804589409217, longitude=12.571637297065239, survivor_id=survivors[4].id),
        LatLong(latitude=55.6113543828474, longitude=12.553875362939529, survivor_id=survivors[5].id),
        LatLong(latitude=56.04120566224172, longitude=12.60157274306721, survivor_id=survivors[6].id),
        LatLong(latitude=56.036939174605, longitude=12.5939352953613, survivor_id=survivors[7].id),
        LatLong(latitude=56.025737400136315, longitude=12.716134458655825, survivor_id=survivors[8].id),
        LatLong(latitude=56.06679468356646, longitude=12.69513147746458, survivor_id=survivors[9].id),
        LatLong(latitude=55.99585010661434, longitude=12.548110609125855, survivor_id=survivors[10].id),
        LatLong(latitude=56.038539162746765, longitude=12.570068271280338, survivor_id=survivors[11].id),
        LatLong(latitude=56.11738958390208, longitude=12.29989355868385, survivor_id=survivors[12].id),
        LatLong(latitude=55.648865447783365, longitude=12.266479724255223, survivor_id=survivors[13].id),
        LatLong(latitude=55.62353877452857, longitude=12.304666962784761, survivor_id=survivors[14].id),
        LatLong(latitude=55.63270137578691, longitude=12.06599671776299, survivor_id=survivors[15].id),
        LatLong(latitude=55.62946776100481, longitude=12.067906079689468, survivor_id=survivors[16].id),
        LatLong(latitude=55.461710056635916, longitude=12.18063081616833, survivor_id=survivors[17].id),
        LatLong(latitude=55.48770059386816, longitude=12.18181678064842, survivor_id=survivors[18].id),
        LatLong(latitude=55.49979379170528, longitude=12.154539597606359, survivor_id=survivors[19].id),
        LatLong(latitude=55.57828321762898, longitude=12.950559084829285, survivor_id=survivors[20].id),
        LatLong(latitude=55.513342213105346, longitude=12.97081580490585, survivor_id=survivors[21].id),
        LatLong(latitude=55.4099799810679, longitude=12.84477399109611, survivor_id=survivors[22].id),
        LatLong(latitude=55.804100403174765, longitude=13.002326260569257, survivor_id=survivors[23].id),
        LatLong(latitude=55.86729774435275, longitude=12.536421698808256, survivor_id=survivors[24].id),
        LatLong(latitude=55.83444794497708, longitude=12.16729924407973, survivor_id=survivors[25].id),
        LatLong(latitude=55.907690159508185, longitude=12.302344044590166, survivor_id=survivors[26].id),
        LatLong(latitude=55.96568063289631, longitude=12.414881378348863, survivor_id=survivors[27].id),
        LatLong(latitude=56.08532250579572, longitude=12.447954221746777, survivor_id=survivors[28].id),
        LatLong(latitude=55.955212995694275, longitude=12.521777153411756, survivor_id=survivors[29].id )
    ]
    db_session.add_all(locations)
    db_session.commit()

    from app.alchemy_models import Inventory
    inventories = [
        Inventory(survivor_id=survivors[0].id, item_id=items[0].id, quantity=3),
        Inventory(survivor_id=survivors[0].id, item_id=items[1].id, quantity=5),
        Inventory(survivor_id=survivors[0].id, item_id=items[2].id, quantity=7),
        Inventory(survivor_id=survivors[0].id, item_id=items[3].id, quantity=2),
        Inventory(survivor_id=survivors[1].id, item_id=items[0].id, quantity=1),
        Inventory(survivor_id=survivors[1].id, item_id=items[1].id, quantity=4),
        Inventory(survivor_id=survivors[1].id, item_id=items[2].id, quantity=6),
        Inventory(survivor_id=survivors[1].id, item_id=items[3].id, quantity=8),
        Inventory(survivor_id=survivors[2].id, item_id=items[0].id, quantity=2),
        Inventory(survivor_id=survivors[2].id, item_id=items[1].id, quantity=3),
        Inventory(survivor_id=survivors[2].id, item_id=items[2].id, quantity=5),
        Inventory(survivor_id=survivors[2].id, item_id=items[3].id, quantity=7),
        Inventory(survivor_id=survivors[3].id, item_id=items[0].id, quantity=4),
        Inventory(survivor_id=survivors[3].id, item_id=items[1].id, quantity=6),
        Inventory(survivor_id=survivors[3].id, item_id=items[2].id, quantity=8),
        Inventory(survivor_id=survivors[3].id, item_id=items[3].id, quantity=1),
        Inventory(survivor_id=survivors[4].id, item_id=items[0].id, quantity=5),
        Inventory(survivor_id=survivors[4].id, item_id=items[1].id, quantity=7),
        Inventory(survivor_id=survivors[4].id, item_id=items[2].id, quantity=2),
        Inventory(survivor_id=survivors[4].id, item_id=items[3].id, quantity=3),
        Inventory(survivor_id=survivors[5].id, item_id=items[0].id, quantity=6),
        Inventory(survivor_id=survivors[5].id, item_id=items[1].id, quantity=8),
        Inventory(survivor_id=survivors[5].id, item_id=items[2].id, quantity=1),
        Inventory(survivor_id=survivors[5].id, item_id=items[3].id, quantity=4),
        Inventory(survivor_id=survivors[6].id, item_id=items[0].id, quantity=7),
        Inventory(survivor_id=survivors[6].id, item_id=items[1].id, quantity=2),
        Inventory(survivor_id=survivors[6].id, item_id=items[2].id, quantity=3),
        Inventory(survivor_id=survivors[6].id, item_id=items[3].id, quantity=5),
        Inventory(survivor_id=survivors[7].id, item_id=items[0].id, quantity=8),
        Inventory(survivor_id=survivors[7].id, item_id=items[1].id, quantity=1),
        Inventory(survivor_id=survivors[7].id, item_id=items[2].id, quantity=4),
        Inventory(survivor_id=survivors[7].id, item_id=items[3].id, quantity=6),
        Inventory(survivor_id=survivors[8].id, item_id=items[0].id, quantity=2),
        Inventory(survivor_id=survivors[8].id, item_id=items[1].id, quantity=3),
        Inventory(survivor_id=survivors[8].id, item_id=items[2].id, quantity=5),
        Inventory(survivor_id=survivors[8].id, item_id=items[3].id, quantity=7),
        Inventory(survivor_id=survivors[9].id, item_id=items[0].id, quantity=4),
        Inventory(survivor_id=survivors[9].id, item_id=items[1].id, quantity=6),
        Inventory(survivor_id=survivors[9].id, item_id=items[2].id, quantity=8),
        Inventory(survivor_id=survivors[9].id, item_id=items[3].id, quantity=1),
        Inventory(survivor_id=survivors[10].id, item_id=items[0].id, quantity=5),
        Inventory(survivor_id=survivors[10].id, item_id=items[1].id, quantity=7),
        Inventory(survivor_id=survivors[10].id, item_id=items[2].id, quantity=2),
        Inventory(survivor_id=survivors[10].id, item_id=items[3].id, quantity=3),
        Inventory(survivor_id=survivors[11].id, item_id=items[0].id, quantity=6),
        Inventory(survivor_id=survivors[11].id, item_id=items[1].id, quantity=8),
        Inventory(survivor_id=survivors[11].id, item_id=items[2].id, quantity=1),
        Inventory(survivor_id=survivors[11].id, item_id=items[3].id, quantity=4),
        Inventory(survivor_id=survivors[12].id, item_id=items[0].id, quantity=7),
        Inventory(survivor_id=survivors[12].id, item_id=items[1].id, quantity=2),
        Inventory(survivor_id=survivors[12].id, item_id=items[2].id, quantity=3),
        Inventory(survivor_id=survivors[12].id, item_id=items[3].id, quantity=5),
        Inventory(survivor_id=survivors[13].id, item_id=items[0].id, quantity=8),
        Inventory(survivor_id=survivors[13].id, item_id=items[1].id, quantity=1),
        Inventory(survivor_id=survivors[13].id, item_id=items[2].id, quantity=4),
        Inventory(survivor_id=survivors[13].id, item_id=items[3].id, quantity=6),
        Inventory(survivor_id=survivors[14].id, item_id=items[0].id, quantity=2),
        Inventory(survivor_id=survivors[14].id, item_id=items[1].id, quantity=3),
        Inventory(survivor_id=survivors[14].id, item_id=items[2].id, quantity=5),
        Inventory(survivor_id=survivors[14].id, item_id=items[3].id, quantity=7),
        Inventory(survivor_id=survivors[15].id, item_id=items[0].id, quantity=4),
        Inventory(survivor_id=survivors[15].id, item_id=items[1].id, quantity=6),
        Inventory(survivor_id=survivors[15].id, item_id=items[2].id, quantity=8),
        Inventory(survivor_id=survivors[15].id, item_id=items[3].id, quantity=1),
        Inventory(survivor_id=survivors[16].id, item_id=items[0].id, quantity=5),
        Inventory(survivor_id=survivors[16].id, item_id=items[1].id, quantity=7),
        Inventory(survivor_id=survivors[16].id, item_id=items[2].id, quantity=2),
        Inventory(survivor_id=survivors[16].id, item_id=items[3].id, quantity=3),
        Inventory(survivor_id=survivors[17].id, item_id=items[0].id, quantity=6),
        Inventory(survivor_id=survivors[17].id, item_id=items[1].id, quantity=8),
        Inventory(survivor_id=survivors[17].id, item_id=items[2].id, quantity=1),
        Inventory(survivor_id=survivors[17].id, item_id=items[3].id, quantity=4),
        Inventory(survivor_id=survivors[18].id, item_id=items[0].id, quantity=7),
        Inventory(survivor_id=survivors[18].id, item_id=items[1].id, quantity=2),
        Inventory(survivor_id=survivors[18].id, item_id=items[2].id, quantity=3),
        Inventory(survivor_id=survivors[18].id, item_id=items[3].id, quantity=5),
        Inventory(survivor_id=survivors[19].id, item_id=items[0].id, quantity=8),
        Inventory(survivor_id=survivors[19].id, item_id=items[1].id, quantity=1),
        Inventory(survivor_id=survivors[19].id, item_id=items[2].id, quantity=4),
        Inventory(survivor_id=survivors[19].id, item_id=items[3].id, quantity=6),
        Inventory(survivor_id=survivors[20].id, item_id=items[0].id, quantity=2),
        Inventory(survivor_id=survivors[20].id, item_id=items[1].id, quantity=3),
        Inventory(survivor_id=survivors[20].id, item_id=items[2].id, quantity=5),
        Inventory(survivor_id=survivors[20].id, item_id=items[3].id, quantity=7),
        Inventory(survivor_id=survivors[21].id, item_id=items[0].id, quantity=4),
        Inventory(survivor_id=survivors[21].id, item_id=items[1].id, quantity=6),
        Inventory(survivor_id=survivors[21].id, item_id=items[2].id, quantity=8),
        Inventory(survivor_id=survivors[21].id, item_id=items[3].id, quantity=1),
        Inventory(survivor_id=survivors[22].id, item_id=items[0].id, quantity=5),
        Inventory(survivor_id=survivors[22].id, item_id=items[1].id, quantity=7),
        Inventory(survivor_id=survivors[22].id, item_id=items[2].id, quantity=2),
        Inventory(survivor_id=survivors[22].id, item_id=items[3].id, quantity=3),
        Inventory(survivor_id=survivors[23].id, item_id=items[0].id, quantity=6),
        Inventory(survivor_id=survivors[23].id, item_id=items[1].id, quantity=8),
        Inventory(survivor_id=survivors[23].id, item_id=items[2].id, quantity=1),
        Inventory(survivor_id=survivors[23].id, item_id=items[3].id, quantity=4),
        Inventory(survivor_id=survivors[24].id, item_id=items[0].id, quantity=7),
        Inventory(survivor_id=survivors[24].id, item_id=items[1].id, quantity=2),
        Inventory(survivor_id=survivors[24].id, item_id=items[2].id, quantity=3),
        Inventory(survivor_id=survivors[24].id, item_id=items[3].id, quantity=5),
        Inventory(survivor_id=survivors[25].id, item_id=items[0].id, quantity=8),
        Inventory(survivor_id=survivors[25].id, item_id=items[1].id, quantity=1),
        Inventory(survivor_id=survivors[25].id, item_id=items[2].id, quantity=4),
        Inventory(survivor_id=survivors[25].id, item_id=items[3].id, quantity=6),
        Inventory(survivor_id=survivors[26].id, item_id=items[0].id, quantity=2),
        Inventory(survivor_id=survivors[26].id, item_id=items[1].id, quantity=3),
        Inventory(survivor_id=survivors[26].id, item_id=items[2].id, quantity=5),
        Inventory(survivor_id=survivors[26].id, item_id=items[3].id, quantity=7),
        Inventory(survivor_id=survivors[27].id, item_id=items[0].id, quantity=4),
        Inventory(survivor_id=survivors[27].id, item_id=items[1].id, quantity=6),
        Inventory(survivor_id=survivors[27].id, item_id=items[2].id, quantity=8),
        Inventory(survivor_id=survivors[27].id, item_id=items[3].id, quantity=1),
        Inventory(survivor_id=survivors[28].id, item_id=items[0].id, quantity=5),
        Inventory(survivor_id=survivors[28].id, item_id=items[1].id, quantity=7),
        Inventory(survivor_id=survivors[28].id, item_id=items[2].id, quantity=2),
        Inventory(survivor_id=survivors[28].id, item_id=items[3].id, quantity=3),
        Inventory(survivor_id=survivors[29].id, item_id=items[0].id, quantity=6),
        Inventory(survivor_id=survivors[29].id, item_id=items[1].id, quantity=8),
        Inventory(survivor_id=survivors[29].id, item_id=items[2].id, quantity=1),
        Inventory(survivor_id=survivors[29].id, item_id=items[3].id, quantity=4)
    ]
    db_session.add_all(inventories)
    db_session.commit()

    from app.alchemy_models import InfectionReport
    infectionReports = [
        InfectionReport(reporter_id=survivors[0].id, reported_id=survivors[26].id),
        InfectionReport(reporter_id=survivors[18].id, reported_id=survivors[26].id),
        InfectionReport(reporter_id=survivors[21].id, reported_id=survivors[0].id),
        InfectionReport(reporter_id=survivors[3].id, reported_id=survivors[13].id),
        InfectionReport(reporter_id=survivors[7].id, reported_id=survivors[13].id),
        InfectionReport(reporter_id=survivors[9].id, reported_id=survivors[13].id),
        InfectionReport(reporter_id=survivors[9].id, reported_id=survivors[14].id),
        InfectionReport(reporter_id=survivors[0].id, reported_id=survivors[22].id)
    ]
    db_session.add_all(infectionReports)
    db_session.commit()


# Create the database tables


def init_db():
    import app.alchemy_models
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        from app.alchemy_models import Item, Survivor
        if not db.query(Item).first():  # Prevent duplicate seeding
            seed_items(db)
        if not db.query(Survivor).first():  # Prevent duplicate seeding
            seed_survivors(db)
    finally:
        db.close()


init_db()  # Run on import
