from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db


router = APIRouter(
    prefix="/agent/emerging",
    tags=["emerging disease surveillance"],
)


def get_agent(user, db: Session):
    agent = (
        db.query(models.Agent)
        .filter(models.Agent.user_id == user.id)
        .first()
    )

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has no assigned taluk.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    if not agent.taluk_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No taluk is assigned to this agent.",
        )

    return agent


def serialize(report):
    return schemas.EmergingDiseaseOut(
        id=report.id,
        agent_id=report.agent_id,
        taluk_id=report.taluk_id,
        taluk_name=(
            report.taluk.name
            if report.taluk
            else None
        ),
        reported_name=report.reported_name,
        suspected_cases=report.suspected_cases,
        symptoms=report.symptoms,
        description=report.description,
        observed_date=report.observed_date,
        status=report.status,
        mapped_disease_id=report.mapped_disease_id,
        mapped_disease_name=(
            report.mapped_disease.name
            if report.mapped_disease
            else None
        ),
        review_notes=report.review_notes,
        created_at=report.created_at,
        reviewed_at=report.reviewed_at,
    )


def get_agent_report(
    report_id: int,
    agent,
    db: Session,
):
    report = (
        db.query(models.EmergingDiseaseReport)
        .filter(
            models.EmergingDiseaseReport.id == report_id,
            models.EmergingDiseaseReport.agent_id == agent.id,
            models.EmergingDiseaseReport.taluk_id == agent.taluk_id,
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emerging disease report not found.",
        )

    return report


@router.post(
    "",
    response_model=schemas.EmergingDiseaseOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_emerging(
    payload: schemas.EmergingDiseaseCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(
        auth.require_role("agent")
    ),
):
    agent = get_agent(user, db)

    reported_name = payload.reported_name.strip()

    if len(reported_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Disease or condition name is required.",
        )

    report = models.EmergingDiseaseReport(
        agent_id=agent.id,
        taluk_id=agent.taluk_id,
        reported_name=reported_name,
        suspected_cases=payload.suspected_cases,
        symptoms=(
            payload.symptoms.strip()
            if payload.symptoms
            else None
        ),
        description=payload.description,
        observed_date=(
            payload.observed_date
            if payload.observed_date
            else datetime.utcnow()
        ),
        status="PENDING",
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return serialize(report)


@router.put(
    "/{report_id}",
    response_model=schemas.EmergingDiseaseOut,
)
def update_emerging(
    report_id: int,
    payload: schemas.EmergingDiseaseCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(
        auth.require_role("agent")
    ),
):
    agent = get_agent(user, db)
    report = get_agent_report(
        report_id,
        agent,
        db,
    )

    if str(report.status).upper() != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending reports can be edited.",
        )

    reported_name = payload.reported_name.strip()

    if len(reported_name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Disease or condition name is required.",
        )

    report.reported_name = reported_name
    report.suspected_cases = payload.suspected_cases
    report.symptoms = (
        payload.symptoms.strip()
        if payload.symptoms
        else None
    )
    report.description = payload.description

    if payload.observed_date:
        report.observed_date = payload.observed_date

    # Never allow the agent to move the report to another taluk.
    report.agent_id = agent.id
    report.taluk_id = agent.taluk_id

    db.commit()
    db.refresh(report)

    return serialize(report)


@router.get(
    "/mine",
    response_model=List[schemas.EmergingDiseaseOut],
)
def my_emerging_reports(
    db: Session = Depends(get_db),
    user: models.User = Depends(
        auth.require_role("agent")
    ),
):
    agent = get_agent(user, db)

    reports = (
        db.query(models.EmergingDiseaseReport)
        .filter(
            models.EmergingDiseaseReport.agent_id == agent.id,
            models.EmergingDiseaseReport.taluk_id == agent.taluk_id,
        )
        .order_by(
            models.EmergingDiseaseReport.created_at.desc()
        )
        .all()
    )

    return [serialize(report) for report in reports]
