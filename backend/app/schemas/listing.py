from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.listing import ListingStatus, PropertyType


class ListingBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    price_per_night: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    city: str = Field(min_length=1, max_length=100)
    region: str = Field(default="", max_length=100)
    address: str = Field(default="", max_length=255)
    property_type: PropertyType
    max_guests: int = Field(ge=1, le=50)
    bedrooms: int = Field(default=1, ge=0, le=20)
    amenities: list[str] = Field(default_factory=list)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    status: ListingStatus = ListingStatus.DRAFT


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    price_per_night: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    region: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=255)
    property_type: PropertyType | None = None
    max_guests: int | None = Field(default=None, ge=1, le=50)
    bedrooms: int | None = Field(default=None, ge=0, le=20)
    amenities: list[str] | None = None
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    status: ListingStatus | None = None


class ListingRead(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    images: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ListingListResponse(BaseModel):
    items: list[ListingRead]
    total: int
    page: int
    page_size: int
