from sqlalchemy.orm import Session, selectinload

from app.models.listing import Listing, ListingStatus, PropertyType
from app.schemas.listing import ListingCreate, ListingUpdate


def get_listing(db: Session, listing_id: int) -> Listing | None:
    return (
        db.query(Listing)
        .options(selectinload(Listing.listing_images))
        .filter(Listing.id == listing_id)
        .first()
    )


def create_listing(db: Session, data: ListingCreate) -> Listing:
    listing = Listing(**data.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def update_listing(db: Session, listing: Listing, data: ListingUpdate) -> Listing:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return listing


def delete_listing(db: Session, listing: Listing) -> None:
    db.delete(listing)
    db.commit()


def search_listings(
    db: Session,
    *,
    q: str | None = None,
    city: str | None = None,
    property_type: PropertyType | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    min_guests: int | None = None,
    status: ListingStatus | None = ListingStatus.ACTIVE,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Listing], int]:
    query = db.query(Listing).options(selectinload(Listing.listing_images))

    if status is not None:
        query = query.filter(Listing.status == status)

    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(
            (Listing.title.ilike(pattern)) | (Listing.description.ilike(pattern))
        )

    if city:
        query = query.filter(Listing.city.ilike(f"%{city.strip()}%"))

    if property_type is not None:
        query = query.filter(Listing.property_type == property_type)

    if price_min is not None:
        query = query.filter(Listing.price_per_night >= price_min)

    if price_max is not None:
        query = query.filter(Listing.price_per_night <= price_max)

    if min_guests is not None:
        query = query.filter(Listing.max_guests >= min_guests)

    total = query.count()
    items = (
        query.order_by(Listing.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return items, total
