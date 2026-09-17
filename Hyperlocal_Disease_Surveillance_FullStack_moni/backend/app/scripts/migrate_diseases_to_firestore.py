from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from app.database import SessionLocal
from app import models
from app.firestore_db import db

session = SessionLocal()
try:
    diseases = session.query(models.Disease).all()
    for disease in diseases:
        doc_ref = db.collection("diseases").document(str(disease.id))
        doc_ref.set({
            "id": disease.id,
            "name": disease.name,
            "description": disease.description,
            "is_active": disease.is_active,
            "verification_status": disease.verification_status,
            "created_by_user_id": disease.created_by_user_id,
            "verified_by_user_id": disease.verified_by_user_id,
            "created_at": disease.created_at.isoformat() if disease.created_at else None,
            "verified_at": disease.verified_at.isoformat() if disease.verified_at else None,
        })
        print(f"Migrated disease: {disease.name}")
finally:
    session.close()

print("Done.")