from datetime import datetime
from firebase_admin import auth as firebase_auth

from . import models
from .database import SessionLocal
from .firestore_db import db as firestore_db


SUPERVISOR_EMAIL = "medical_supervisor@yourdomain.com"
SUPERVISOR_PASSWORD = "ChangeMe123!"


def _ensure_firebase_supervisor() -> str:
    try:
        user = firebase_auth.get_user_by_email(SUPERVISOR_EMAIL)
    except firebase_auth.UserNotFoundError:
        user = firebase_auth.create_user(
            email=SUPERVISOR_EMAIL,
            password=SUPERVISOR_PASSWORD,
            display_name="Dr. Monish",
        )
    return user.uid


def _seed_diseases_firestore():
    """Ensure the official disease registry exists in Firestore."""
    diseases_ref = firestore_db.collection("diseases")

    # Find the current max numeric ID so new diseases get sequential IDs
    # (keeps compatibility with anything still expecting integer-like IDs).
    existing_docs = list(diseases_ref.stream())
    existing_names = {
        doc.to_dict().get("name", "").lower()
        for doc in existing_docs
    }
    max_id = max(
        (int(doc.id) for doc in existing_docs if doc.id.isdigit()),
        default=0,
    )

    for name in models.DISEASES:
        if name.lower() not in existing_names:
            max_id += 1
            diseases_ref.document(str(max_id)).set({
                "id": max_id,
                "name": name,
                "description": None,
                "is_active": True,
                "verification_status": "VERIFIED",
                "created_by_user_id": None,
                "verified_by_user_id": None,
                "created_at": datetime.utcnow().isoformat(),
                "verified_at": datetime.utcnow().isoformat(),
            })


def initialize_feature():
    db = SessionLocal()
    try:
        _seed_diseases_firestore()

        firebase_uid = _ensure_firebase_supervisor()

        supervisor = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
        if not supervisor:
            existing_by_username = db.query(models.User).filter(models.User.username == "medical_supervisor").first()
            if existing_by_username:
                existing_by_username.firebase_uid = firebase_uid
                existing_by_username.role = "medical_supervisor"
                existing_by_username.is_active = True
            else:
                db.add(models.User(
                    firebase_uid=firebase_uid,
                    username="medical_supervisor",
                    full_name="Dr. Monish",
                    role="medical_supervisor",
                    is_active=True,
                ))
        else:
            supervisor.role = "medical_supervisor"
            supervisor.is_active = True
            if supervisor.full_name in {None, "", "Medical Supervisor"}:
                supervisor.full_name = "Dr. Monish"

        kodagu = db.query(models.District).filter(models.District.name.ilike("Kodagu")).first()
        supervisor = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
        if supervisor and kodagu:
            supervisor.supervisor_district_id = kodagu.id

        db.commit()
    finally:
        db.close()