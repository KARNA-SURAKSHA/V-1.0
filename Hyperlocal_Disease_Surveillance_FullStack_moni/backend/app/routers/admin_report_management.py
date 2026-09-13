from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import auth
from ..database import get_db


router = APIRouter(
    prefix="/admin/report-management",
    tags=["admin report management"],
)


# ============================================================
# ADMIN AUTHORIZATION
# ============================================================

admin_only = auth.require_role("admin")


# ============================================================
# REVIEW COLUMN COMPATIBILITY
# ============================================================

def ensure_review_columns(db: Session):
    """
    Keep existing surveillance.db files compatible with the
    report-review fields used by Medical Supervisors.

    This allows older databases to continue working even if
    the review-related columns were not present originally.
    """

    columns = {
        row[1]
        for row in db.execute(
            text("PRAGMA table_info(disease_reports)")
        ).fetchall()
    }

    statements = []

    # --------------------------------------------------------
    # REVIEW STATUS
    # --------------------------------------------------------

    if "review_status" not in columns:
        statements.append(
            """
            ALTER TABLE disease_reports
            ADD COLUMN review_status VARCHAR(30)
            DEFAULT 'PENDING_REVIEW'
            """
        )

    # --------------------------------------------------------
    # REVIEW NOTES
    # --------------------------------------------------------

    if "review_notes" not in columns:
        statements.append(
            """
            ALTER TABLE disease_reports
            ADD COLUMN review_notes TEXT
            """
        )

    # --------------------------------------------------------
    # REVIEWED BY
    # --------------------------------------------------------

    if "reviewed_by" not in columns:
        statements.append(
            """
            ALTER TABLE disease_reports
            ADD COLUMN reviewed_by INTEGER
            """
        )

    # --------------------------------------------------------
    # REVIEWED AT
    # --------------------------------------------------------

    if "reviewed_at" not in columns:
        statements.append(
            """
            ALTER TABLE disease_reports
            ADD COLUMN reviewed_at DATETIME
            """
        )

    # --------------------------------------------------------
    # APPLY MIGRATIONS
    # --------------------------------------------------------

    for statement in statements:
        db.execute(text(statement))

    if statements:
        db.commit()


# ============================================================
# GET REPORT MANAGEMENT REPORTS
# ============================================================

@router.get("/reports")
def get_report_management_reports(
    taluk_id: Optional[int] = None,
    district_id: Optional[int] = None,
    disease: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    """
    Complete read-only report dataset for System Administrators.

    System Administrators can:
        - View reports
        - Filter reports
        - Search/filter by district
        - Search/filter by taluk
        - Filter by disease
        - Filter by review status
        - Filter by date range

    They cannot modify reports through this endpoint.
    """

    # Make sure the review fields exist in older databases.
    ensure_review_columns(db)

    # ========================================================
    # BASE QUERY
    # ========================================================

    query = """
        SELECT
            dr.id,
            dr.disease,
            dr.cases,
            dr.severity,
            dr.week_number,
            dr.year,
            dr.created_at,
            dr.updated_at,
            dr.remarks,
            dr.preventive_measures,

            dr.review_status,
            dr.review_notes,
            dr.reviewed_by,
            dr.reviewed_at,

            t.id AS taluk_id,
            t.name AS taluk_name,

            d.id AS district_id,
            d.name AS district_name,

            a.id AS agent_id,

            u.full_name AS agent_name,

            ru.full_name AS reviewed_by_name

        FROM disease_reports dr

        JOIN taluks t
            ON t.id = dr.taluk_id

        JOIN districts d
            ON d.id = t.district_id

        JOIN agents a
            ON a.id = dr.agent_id

        JOIN users u
            ON u.id = a.user_id

        LEFT JOIN users ru
            ON ru.id = dr.reviewed_by

        WHERE 1 = 1
    """

    params = {}

    # ========================================================
    # TALUK FILTER
    # ========================================================

    if taluk_id is not None:
        query += """
            AND dr.taluk_id = :taluk_id
        """

        params["taluk_id"] = taluk_id

    # ========================================================
    # DISTRICT FILTER
    # ========================================================

    if district_id is not None:
        query += """
            AND d.id = :district_id
        """

        params["district_id"] = district_id

    # ========================================================
    # DISEASE FILTER
    # ========================================================

    if disease:
        query += """
            AND LOWER(dr.disease) = LOWER(:disease)
        """

        params["disease"] = disease.strip()

    # ========================================================
    # STATUS FILTER
    # ========================================================

    if status:
        normalized = (
            status
            .strip()
            .upper()
            .replace(" ", "_")
        )

        # Allow frontend to send "PENDING"
        # while database uses "PENDING_REVIEW".
        if normalized == "PENDING":
            normalized = "PENDING_REVIEW"

        query += """
            AND COALESCE(
                dr.review_status,
                'PENDING_REVIEW'
            ) = :status
        """

        params["status"] = normalized

    # ========================================================
    # DATE FROM FILTER
    # ========================================================

    if date_from:
        query += """
            AND DATE(dr.created_at)
                >= DATE(:date_from)
        """

        params["date_from"] = date_from

    # ========================================================
    # DATE TO FILTER
    # ========================================================

    if date_to:
        query += """
            AND DATE(dr.created_at)
                <= DATE(:date_to)
        """

        params["date_to"] = date_to

    # ========================================================
    # ORDER
    # ========================================================

    query += """
        ORDER BY
            dr.created_at DESC,
            dr.id DESC
    """

    # ========================================================
    # EXECUTE QUERY
    # ========================================================

    rows = (
        db.execute(
            text(query),
            params
        )
        .mappings()
        .all()
    )

    # ========================================================
    # STATUS DISPLAY LABELS
    # ========================================================

    status_labels = {
        "PENDING_REVIEW": "Pending Review",
        "APPROVED": "Approved",
        "REJECTED": "Rejected",
        "DRAFT": "Draft",
    }

    # ========================================================
    # FORMAT RESPONSE
    # ========================================================

    result = []

    for row in rows:

        raw_status = (
            row["review_status"]
            or "PENDING_REVIEW"
        ).upper()

        result.append(
            {
                "id": row["id"],

                # Example:
                # RPT-2025-1248
                "report_id": (
                    f"RPT-2025-{int(row['id']):04d}"
                ),

                "disease": row["disease"],

                "cases": row["cases"] or 0,

                "severity": row["severity"],

                "week_number": row["week_number"],

                "year": row["year"],

                "created_at": row["created_at"],

                "updated_at": row["updated_at"],

                "remarks": row["remarks"],

                "preventive_measures": (
                    row["preventive_measures"]
                ),

                # ------------------------------------------------
                # LOCATION
                # ------------------------------------------------

                "taluk_id": row["taluk_id"],

                "taluk_name": row["taluk_name"],

                "district_id": row["district_id"],

                "district_name": row["district_name"],

                # ------------------------------------------------
                # AGENT
                # ------------------------------------------------

                "agent_id": row["agent_id"],

                "agent_name": row["agent_name"],

                # ------------------------------------------------
                # STATUS
                # ------------------------------------------------

                "status": status_labels.get(
                    raw_status,
                    "Pending Review"
                ),

                "review_status": raw_status,

                # ------------------------------------------------
                # REVIEW INFORMATION
                # ------------------------------------------------

                "review_notes": row["review_notes"],

                "reviewed_by": row["reviewed_by"],

                "reviewed_by_name": (
                    row["reviewed_by_name"]
                ),

                "reviewed_at": row["reviewed_at"],
            }
        )

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {
        "reports": result,
        "total": len(result),
        "generated_at": datetime.utcnow(),
    }