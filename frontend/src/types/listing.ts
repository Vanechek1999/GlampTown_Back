export const PROPERTY_TYPES = [
  { value: 'tent', label: 'Палатка' },
  { value: 'yurt', label: 'Юрта' },
  { value: 'cabin', label: 'Домик' },
  { value: 'dome', label: 'Купол' },
  { value: 'treehouse', label: 'Дом на дереве' },
  { value: 'other', label: 'Другое' },
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]['value']

export interface Listing {
  id: number
  title: string
  description: string
  price_per_night: string
  city: string
  region: string
  address: string
  property_type: PropertyType
  max_guests: number
  bedrooms: number
  amenities: string[]
  images: string[]
  status: string
  created_at: string
  updated_at: string
}

export interface ListingCreatePayload {
  title: string
  description: string
  price_per_night: number
  city: string
  region: string
  address: string
  property_type: PropertyType
  max_guests: number
  bedrooms: number
  status: 'draft' | 'active'
}
