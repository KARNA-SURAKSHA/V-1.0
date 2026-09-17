"""Firestore client initialization.

This module provides a single shared Firestore client, using the same
service account credentials already configured for Firebase Auth
(GOOGLE_APPLICATION_CREDENTIALS).
"""

import os
from firebase_admin import firestore, initialize_app, get_app, credentials

# Reuse the existing Firebase app if one was already initialized
# (e.g. by auth_router.py), otherwise initialize it here.
try:
    _app = get_app()
except ValueError:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path:
        raise RuntimeError(
            "GOOGLE_APPLICATION_CREDENTIALS env var is required to initialize Firebase Admin SDK"
        )
    _app = initialize_app(credentials.Certificate(cred_path))

db = firestore.client()

def get_next_id(collection_name: str) -> int:
    """Return the next integer ID for a Firestore collection, mimicking
    SQL auto-increment behavior for compatibility with SQLite foreign
    keys that still reference these IDs (e.g. EmergingDiseaseReport.mapped_disease_id)."""
    docs = db.collection(collection_name).stream()
    max_id = max(
        (int(doc.id) for doc in docs if doc.id.isdigit()),
        default=0,
    )
    return max_id + 1