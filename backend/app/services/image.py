import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.listing import Listing
from app.models.listing_image import ListingImage

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _validate_image(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type or 'unknown'}",
        )


async def save_listing_images(
    db: Session,
    listing: Listing,
    files: list[UploadFile],
) -> list[ListingImage]:
    if not files:
        return []

    max_bytes = settings.max_image_size_mb * 1024 * 1024
    listing_dir = settings.upload_path / str(listing.id)
    listing_dir.mkdir(parents=True, exist_ok=True)

    saved: list[ListingImage] = []
    for index, file in enumerate(files):
        _validate_image(file)
        content = await file.read()
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename or index + 1} exceeds {settings.max_image_size_mb} MB limit",
            )

        extension = EXTENSION_BY_CONTENT_TYPE.get(file.content_type, ".bin")
        filename = f"{uuid.uuid4().hex}{extension}"
        file_path = listing_dir / filename
        file_path.write_bytes(content)

        image = ListingImage(
            listing_id=listing.id,
            filename=f"{listing.id}/{filename}",
            sort_order=index,
        )
        db.add(image)
        saved.append(image)

    db.commit()
    for image in saved:
        db.refresh(image)
    return saved


def get_image_urls(listing: Listing) -> list[str]:
    if listing.listing_images:
        return [f"/uploads/{image.filename}" for image in listing.listing_images]
    return [settings.default_listing_image_url]
