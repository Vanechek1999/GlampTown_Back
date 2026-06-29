import type { Listing, ListingCreatePayload, ListingUpdatePayload } from '../types/listing'

const API_BASE = 'http://localhost:8000/api/v1'

async function parseError(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null)
  if (typeof error?.detail === 'string') return error.detail
  if (Array.isArray(error?.detail)) {
    return error.detail[0]?.msg ?? fallback
  }
  return fallback
}

export async function fetchListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE}/listings?status=active`)
  if (!response.ok) {
    throw new Error('Не удалось загрузить объекты')
  }
  const data = await response.json()
  return data.items
}

export async function fetchPromotionListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE}/listings?status=active&promotion=true`)
  if (!response.ok) {
    throw new Error('Не удалось загрузить объекты с акцией')
  }
  const data = await response.json()
  return data.items
}

export async function fetchListing(id: number): Promise<Listing> {
  const response = await fetch(`${API_BASE}/listings/${id}`)
  if (!response.ok) {
    throw new Error('Не удалось загрузить объект')
  }
  return response.json()
}

export async function createListing(payload: ListingCreatePayload): Promise<Listing> {
  const response = await fetch(`${API_BASE}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await parseError(response, 'Не удалось создать объект'))
  }
  return response.json()
}

export async function updateListing(id: number, payload: ListingUpdatePayload): Promise<Listing> {
  const response = await fetch(`${API_BASE}/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(await parseError(response, 'Не удалось обновить объект'))
  }
  return response.json()
}

export async function deleteListing(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/listings/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(await parseError(response, 'Не удалось удалить объект'))
  }
}

export async function uploadListingImages(listingId: number, images: File[]): Promise<Listing> {
  const formData = new FormData()
  images.forEach((image) => formData.append('images', image))

  const response = await fetch(`${API_BASE}/listings/${listingId}/images`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(await parseError(response, 'Не удалось загрузить изображения'))
  }
  return response.json()
}

export function getImageUrl(path: string): string {
  return `http://localhost:8000${path}`
}
