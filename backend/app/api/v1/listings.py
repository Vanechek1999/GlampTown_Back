from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.listing import Listing, ListingStatus, PropertyType
from app.schemas.listing import (
    ListingCreate,
    ListingListResponse,
    ListingRead,
    ListingUpdate,
)
from app.services import listing as listing_service
from app.services import image as image_service

router = APIRouter(prefix="/listings", tags=["listings"])


def _to_listing_read(listing: Listing) -> ListingRead:
    return ListingRead.model_validate(listing).model_copy(
        update={"images": image_service.get_image_urls(listing)},
    )


@router.get("", response_model=ListingListResponse)
def list_listings(
    q: str | None = Query(default=None, description="Search in title and description"),
    city: str | None = Query(default=None),
    property_type: PropertyType | None = Query(default=None),
    price_min: float | None = Query(default=None, ge=0),
    price_max: float | None = Query(default=None, ge=0),
    min_guests: int | None = Query(default=None, ge=1),
    status: ListingStatus | None = Query(default=ListingStatus.ACTIVE),
    promotion: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ListingListResponse:
    items, total = listing_service.search_listings(
        db,
        q=q,
        city=city,
        property_type=property_type,
        price_min=price_min,
        price_max=price_max,
        min_guests=min_guests,
        status=status,
        promotion=promotion,
        page=page,
        page_size=page_size,
    )
    return ListingListResponse(
        items=[_to_listing_read(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
) -> ListingRead:
    listing = listing_service.create_listing(db, data)
    listing = listing_service.get_listing(db, listing.id)
    assert listing is not None
    return _to_listing_read(listing)


@router.post("/{listing_id}/images", response_model=ListingRead)
async def upload_listing_images(
    listing_id: int,
    images: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> ListingRead:
    listing = listing_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if not images:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one image is required")
    await image_service.save_listing_images(db, listing, images)
    listing = listing_service.get_listing(db, listing_id)
    assert listing is not None
    return _to_listing_read(listing)


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
) -> ListingRead:
    listing = listing_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _to_listing_read(listing)


@router.put("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    data: ListingUpdate,
    db: Session = Depends(get_db),
) -> ListingRead:
    listing = listing_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _to_listing_read(listing_service.update_listing(db, listing, data))


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
) -> None:
    listing = listing_service.get_listing(db, listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    listing_service.delete_listing(db, listing)
