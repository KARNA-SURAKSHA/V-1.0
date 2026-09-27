from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from app.database import SessionLocal
from app import models
from app.firestore_db import db

session = SessionLocal()
try:
    states = session.query(models.State).all()
    for state in states:
        doc_ref = db.collection("states").document(str(state.id))
        doc_ref.set({
            "id": state.id,
            "name": state.name,
        })
        print(f"Migrated state: {state.name}")
finally:
    session.close()

print("Done.")