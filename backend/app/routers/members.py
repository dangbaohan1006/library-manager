from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_, asc, desc

from app.db.database import get_db
from app.models import Member, Loan, LoanStatus
from app.schemas import MemberCreate, MemberResponse

router = APIRouter(
    prefix="/members",
    tags=["Members"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate, db: Session = Depends(get_db)):
    existing_member = db.query(Member).filter(Member.email == member_in.email).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_member = Member(
        email=member_in.email,
        full_name=member_in.full_name,
        phone=member_in.phone,
        is_active=True
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member

@router.get("/", response_model=List[MemberResponse])
def read_members(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "desc",
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Member)
    
    # Text search filter
    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Member.full_name.ilike(search),
                Member.email.ilike(search)
            )
        )
    
    # Column-specific filters
    if full_name:
        query = query.filter(Member.full_name.ilike(f"%{full_name}%"))
    if email:
        query = query.filter(Member.email.ilike(f"%{email}%"))
    if is_active is not None:
        query = query.filter(Member.is_active == is_active)
    
    # Sorting
    if sort_by:
        sort_column = None
        if sort_by == "full_name":
            sort_column = Member.full_name
        elif sort_by == "email":
            sort_column = Member.email
        elif sort_by == "joined_date":
            sort_column = Member.joined_date
        elif sort_by == "is_active":
            sort_column = Member.is_active
        
        if sort_column:
            if sort_order == "asc":
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(Member.id.desc())
    else:
        query = query.order_by(Member.id.desc())
        
    return query.offset(skip).limit(limit).all()

@router.get("/{member_id}", response_model=MemberResponse)
def read_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.put("/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member_in: MemberCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    member.full_name = member_in.full_name
    member.phone = member_in.phone
    
    db.commit()
    db.refresh(member)
    return member