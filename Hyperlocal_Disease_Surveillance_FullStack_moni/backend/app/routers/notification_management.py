from datetime import datetime

from typing import Optional


from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)


from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)


from sqlalchemy.orm import (
    Session,
    relationship,
)


from .. import (
    auth,
    models,
)


from ..database import (
    Base,
    get_db,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    tags=["notifications"],
)


# ============================================================
# NOTIFICATION PUBLICATION METADATA
# ============================================================
#
# Existing notifications table already stores:
#
#     title
#     message
#     type
#     taluk_id
#     created_at
#
# Instead of changing that existing table, this table records:
#
#     WHO published it
#     WHICH district it belongs to
#     WHICH taluk it belongs to
#     WHETHER it is district/taluk scoped
#
# This keeps the existing surveillance.db compatible.
# ============================================================

class NotificationPublication(Base):

    __tablename__ = (
        "notification_publications"
    )


    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )


    notification_id = Column(
        Integer,
        ForeignKey(
            "notifications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )


    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )


    district_id = Column(
        Integer,
        ForeignKey("districts.id"),
        nullable=True,
        index=True,
    )


    taluk_id = Column(
        Integer,
        ForeignKey("taluks.id"),
        nullable=True,
        index=True,
    )


    scope_type = Column(
        String(30),
        nullable=False,
    )


    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


    notification = relationship(
        "Notification",
        lazy="joined",
    )


    created_by = relationship(
        "User",
        lazy="joined",
    )


# ============================================================
# TEXT VALIDATION
# ============================================================

def _clean_text(
    value,
    field_name,
    max_length,
):

    value = str(
        value or ""
    ).strip()


    if not value:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is required."
            ),
        )


    if len(value) > max_length:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{field_name} is too long."
            ),
        )


    return value


# ============================================================
# FORMAT NOTIFICATION
# ============================================================

def _notification_dict(
    note: models.Notification,
    publication: Optional[
        NotificationPublication
    ],
    db: Session,
):

    taluk = None
    district = None


    # --------------------------------------------------------
    # Resolve taluk
    # --------------------------------------------------------

    if note.taluk_id:

        taluk = (
            db.query(
                models.Taluk
            )
            .filter(
                models.Taluk.id
                == note.taluk_id
            )
            .first()
        )


        if taluk:

            district = (
                taluk.district
            )


    # --------------------------------------------------------
    # Publication taluk fallback
    # --------------------------------------------------------

    if (
        publication
        and publication.taluk_id
        and not taluk
    ):

        taluk = (
            db.query(
                models.Taluk
            )
            .filter(
                models.Taluk.id
                == publication.taluk_id
            )
            .first()
        )


        if taluk:

            district = (
                taluk.district
            )


    # --------------------------------------------------------
    # Publication district
    # --------------------------------------------------------

    if (
        publication
        and publication.district_id
    ):

        district = (
            db.query(
                models.District
            )
            .filter(
                models.District.id
                == publication.district_id
            )
            .first()
        )


    # --------------------------------------------------------
    # SOURCE
    # --------------------------------------------------------

    author = (
        publication.created_by
        if publication
        else None
    )


    if author:

        if (
            author.role
            == "medical_supervisor"
        ):

            source_role = (
                "Medical Supervisor"
            )

        elif (
            author.role
            == "agent"
        ):

            source_role = (
                "Agent"
            )

        else:

            source_role = (
                "Admin"
            )


        source_name = (
            author.full_name
            or author.username
        )

    else:

        source_role = (
            "Admin / System"
        )

        source_name = (
            "Administration"
        )


    # --------------------------------------------------------
    # SCOPE
    # --------------------------------------------------------

    if publication:

        if (
            publication.scope_type
            == "district"
        ):

            scope_label = (

                f"District · "
                f"{district.name}"

                if district

                else
                "District"
            )

        else:

            scope_label = (

                f"Taluk · "
                f"{taluk.name}"

                if taluk

                else
                "Taluk"
            )

    elif taluk:

        scope_label = (
            f"Taluk · {taluk.name}"
        )

    else:

        scope_label = (
            "Statewide"
        )


    return {

        "id":
            note.id,

        "title":
            note.title,

        "message":
            note.message,

        "type":
            note.type,

        "taluk_id":
            note.taluk_id,

        "taluk_name":
            taluk.name
            if taluk
            else None,

        "district_id":
            district.id
            if district
            else None,

        "district_name":
            district.name
            if district
            else None,

        "scope_type":
            (
                publication.scope_type
                if publication
                else "statewide"
            ),

        "scope_label":
            scope_label,

        "source_role":
            source_role,

        "source_name":
            source_name,

        "created_at":
            note.created_at,
    }


# ============================================================
# AGENT PROFILE
# ============================================================

def _get_agent(
    db: Session,
    user: models.User,
):

    agent = (
        db.query(
            models.Agent
        )
        .filter(
            models.Agent.user_id
            == user.id
        )
        .first()
    )


    if not agent:

        raise HTTPException(
            status_code=400,
            detail=(
                "This account has no assigned taluk."
            ),
        )


    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail=(
                "This agent account is inactive."
            ),
        )


    if not agent.taluk:

        raise HTTPException(
            status_code=400,
            detail=(
                "This agent has no assigned taluk."
            ),
        )


    return agent


# ============================================================
# SUPERVISOR DISTRICT
# ============================================================

def _get_supervisor_district(
    db: Session,
    user: models.User,
):

    district_id = getattr(
        user,
        "supervisor_district_id",
        None,
    )


    if district_id:

        district = (
            db.query(
                models.District
            )
            .filter(
                models.District.id
                == district_id
            )
            .first()
        )


        if district:

            return district


    # Existing project fallback
    # for older supervisor accounts.

    district = (
        db.query(
            models.District
        )
        .filter(
            models.District.name.ilike(
                "Kodagu"
            )
        )
        .first()
    )


    if district:

        return district


    raise HTTPException(
        status_code=403,
        detail=(
            "No district is assigned "
            "to this Medical Supervisor."
        ),
    )


# ============================================================
# LOAD PUBLICATIONS
# ============================================================

def _load_publications(
    db: Session,
    publications,
):

    results = []


    for publication in publications:

        note = (
            publication.notification
        )


        if not note:

            continue


        results.append(
            _notification_dict(
                note,
                publication,
                db,
            )
        )


    return results


# ============================================================
# CREATE PUBLICATION
# ============================================================

def _create_publication(
    db: Session,
    user: models.User,
    title,
    message,
    notification_type,
    district_id,
    taluk_id,
    scope_type,
):

    note = models.Notification(

        title=_clean_text(
            title,
            "Title",
            200,
        ),

        message=_clean_text(
            message,
            "Message",
            4000,
        ),

        type=_clean_text(
            notification_type
            or "info",
            "Notification type",
            80,
        ),

        taluk_id=taluk_id,

        created_at=
            datetime.utcnow(),
    )


    db.add(note)

    db.flush()


    publication = (
        NotificationPublication(

            notification_id=
                note.id,

            created_by_user_id=
                user.id,

            district_id=
                district_id,

            taluk_id=
                taluk_id,

            scope_type=
                scope_type,

            created_at=
                note.created_at,
        )
    )


    db.add(
        publication
    )


    db.commit()


    db.refresh(
        publication
    )


    return _notification_dict(
        note,
        publication,
        db,
    )


# ============================================================
# USER / CITIZEN NOTIFICATIONS
# ============================================================

@router.get(
    "/notifications/{taluk_id}",
)
def get_citizen_notifications(
    taluk_id: int,

    db: Session = Depends(
        get_db
    ),
):

    taluk = (
        db.query(
            models.Taluk
        )
        .filter(
            models.Taluk.id
            == taluk_id
        )
        .first()
    )


    if not taluk:

        raise HTTPException(
            status_code=404,
            detail="Taluk not found.",
        )


    # --------------------------------------------------------
    # Medical Supervisor:
    # district-wide notifications
    #
    # Agent:
    # selected-taluk notifications
    # --------------------------------------------------------

    publications = (

        db.query(
            NotificationPublication
        )

        .join(
            models.User,

            models.User.id
            ==
            NotificationPublication.created_by_user_id,
        )

        .filter(

            (

                (
                    models.User.role
                    ==
                    "medical_supervisor"
                )

                &

                (
                    NotificationPublication.district_id
                    ==
                    taluk.district_id
                )

            )

            |

            (

                (
                    models.User.role
                    ==
                    "agent"
                )

                &

                (
                    NotificationPublication.taluk_id
                    ==
                    taluk_id
                )

            )

        )

        .order_by(
            NotificationPublication.created_at.desc()
        )

        .limit(100)

        .all()
    )


    # --------------------------------------------------------
    # LEGACY ADMIN / SYSTEM NOTIFICATIONS
    #
    # Notifications created by the old admin endpoint before
    # this workflow existed have no publication metadata.
    #
    # Keep them visible to citizens.
    # --------------------------------------------------------

    legacy = (

        db.query(
            models.Notification
        )

        .outerjoin(
            NotificationPublication,

            NotificationPublication.notification_id
            ==
            models.Notification.id,
        )

        .filter(

            NotificationPublication.id.is_(
                None
            ),

            (

                models.Notification.taluk_id
                ==
                taluk_id

            )

            |

            (

                models.Notification.taluk_id.is_(
                    None
                )

            ),

        )

        .order_by(
            models.Notification.created_at.desc()
        )

        .limit(100)

        .all()
    )


    results = _load_publications(
        db,
        publications,
    )


    for note in legacy:

        results.append(
            _notification_dict(
                note,
                None,
                db,
            )
        )


    results.sort(
        key=lambda item:
            item.get(
                "created_at"
            )
            or datetime.min,

        reverse=True,
    )


    return results[:100]


# ============================================================
# ADMIN
# ============================================================

@router.get(
    "/admin/notifications",
)
def list_admin_notifications(

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "admin"
        )
    ),
):

    publications = (

        db.query(
            NotificationPublication
        )

        .join(
            models.User,

            models.User.id
            ==
            NotificationPublication.created_by_user_id,
        )

        .filter(
            models.User.role.in_(
                [
                    "medical_supervisor",
                    "agent",
                ]
            )
        )

        .order_by(
            NotificationPublication.created_at.desc()
        )

        .limit(500)

        .all()
    )


    return _load_publications(
        db,
        publications,
    )


# ============================================================
# BLOCK ADMIN PUBLISHING
# ============================================================

@router.post(
    "/admin/notifications",
)
def block_admin_notification_publish(

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "admin"
        )
    ),
):

    raise HTTPException(

        status_code=403,

        detail=(
            "Administrators can only review "
            "notifications. Medical Supervisors "
            "and Agents publish notifications."
        ),
    )


# ============================================================
# MEDICAL SUPERVISOR
# ============================================================

@router.get(
    "/medical/notifications",
)
def list_supervisor_notifications(

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "medical_supervisor"
        )
    ),
):

    publications = (

        db.query(
            NotificationPublication
        )

        .filter(
            NotificationPublication.created_by_user_id
            ==
            user.id
        )

        .order_by(
            NotificationPublication.created_at.desc()
        )

        .limit(200)

        .all()
    )


    return _load_publications(
        db,
        publications,
    )


@router.post(
    "/medical/notifications",
)
def create_supervisor_notification(

    payload: dict,

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "medical_supervisor"
        )
    ),
):

    district = (
        _get_supervisor_district(
            db,
            user,
        )
    )


    return _create_publication(

        db=db,

        user=user,

        title=
            payload.get(
                "title"
            ),

        message=
            payload.get(
                "message"
            ),

        notification_type=(
            payload.get(
                "type"
            )

            or

            payload.get(
                "notification_type"
            )

            or "info"
        ),

        district_id=
            district.id,

        taluk_id=None,

        scope_type=
            "district",
    )


# ============================================================
# AGENT
# ============================================================

@router.get(
    "/agent/notifications",
)
def list_agent_notifications(

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "agent"
        )
    ),
):

    agent = _get_agent(
        db,
        user,
    )


    district_id = (
        agent.taluk.district_id
    )


    publications = (

        db.query(
            NotificationPublication
        )

        .join(
            models.User,

            models.User.id
            ==
            NotificationPublication.created_by_user_id,
        )

        .filter(

            (

                NotificationPublication.created_by_user_id
                ==
                user.id

            )

            |

            (

                (
                    models.User.role
                    ==
                    "medical_supervisor"
                )

                &

                (
                    NotificationPublication.district_id
                    ==
                    district_id
                )

            )

        )

        .order_by(
            NotificationPublication.created_at.desc()
        )

        .limit(200)

        .all()
    )


    return _load_publications(
        db,
        publications,
    )


@router.post(
    "/agent/notifications",
)
def create_agent_notification(

    payload: dict,

    db: Session = Depends(
        get_db
    ),

    user: models.User = Depends(
        auth.require_role(
            "agent"
        )
    ),
):

    agent = _get_agent(
        db,
        user,
    )


    return _create_publication(

        db=db,

        user=user,

        title=
            payload.get(
                "title"
            ),

        message=
            payload.get(
                "message"
            ),

        notification_type=(
            payload.get(
                "type"
            )

            or

            payload.get(
                "notification_type"
            )

            or "info"
        ),

        district_id=
            agent.taluk.district_id,

        taluk_id=
            agent.taluk_id,

        scope_type=
            "taluk",
    )