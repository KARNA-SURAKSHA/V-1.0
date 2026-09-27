from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from app.database import SessionLocal
from app import models
from app.firestore_db import db

session = SessionLocal()
try:
    districts = session.query(models.District).all()
    for district in districts:
        doc_ref = db.collection("districts").document(str(district.id))
        doc_ref.set({
            "id": district.id,
            "name": district.name,
            "state_id": district.state_id,
        })
        print(f"Migrated district: {district.name}")
finally:
    session.close()

print("Done.")