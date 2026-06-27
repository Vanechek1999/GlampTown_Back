import type { Listing, ListingCreatePayload } from '../types/listing'

const API_BASE = 'http://localhost:8000/api/v1'

export async function fetchListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE}/listings?status=active`)
  if (!response.ok) {
    throw new Error('Не удалось загрузить объекты')
  }
  const data = await response.json()
  return data.items
}

export async function createListing(payload: ListingCreatePayload): Promise<Listing> {
  const response = await fetch(`${API_BASE}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail?.[0]?.msg ?? 'Не удалось создать объект')
  }
  return response.json()
}

export async function uploadListingImages(listingId: number, images: File[]): Promise<Listing> {
  const formData = new FormData()
  images.forEach((image) => formData.append('images', image))

  const response = await fetch(`${API_BASE}/listings/${listingId}/images`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail ?? 'Не удалось загрузить изображения')
  }
  return response.json()
}

export function getImageUrl(path: string): string {
  return `http://localhost:8000${path}`
}
