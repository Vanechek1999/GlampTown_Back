import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AddNewItemModal } from '../../components/widgets'
import { deleteListing, fetchListing, getImageUrl } from '../../api/listings'
import { Text } from '../../components/shared'
import { PROPERTY_TYPES, type Listing } from '../../types/listing'
import styles from './ListingPage.module.css'

export const ListingPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadListing = () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    fetchListing(Number(id))
      .then(setListing)
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadListing()
  }, [id])

  const propertyTypeLabel =
    PROPERTY_TYPES.find((type) => type.value === listing?.property_type)?.label ??
    listing?.property_type

  const handleDelete = async () => {
    if (!listing) return

    const confirmed = window.confirm(`Удалить объект «${listing.title}»?`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteListing(listing.id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить объект')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Text tag="p" size="medium" color="gray">
          Загрузка...
        </Text>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className={styles.page}>
        <Link to="/" className={styles.backLink}>
          ← Назад к списку
        </Link>
        <Text tag="p" size="medium" color="red" align="left">
          {error ?? 'Объект не найден'}
        </Text>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Назад к списку
      </Link>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => setIsEditModalOpen(true)}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Удаление...' : 'Удалить'}
        </button>
      </div>

      <AddNewItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadListing}
        listing={listing}
      />

      {listing.images.length > 0 && (
        <div className={styles.gallery}>
          {listing.images.map((image) => (
            <img
              key={image}
              className={styles.galleryImage}
              src={getImageUrl(image)}
              alt={listing.title}
            />
          ))}
        </div>
      )}

      <div className={styles.content}>
        <Text tag="h1" size="large" fontWeight="bold" color="heading" align="left">
          {listing.title}
        </Text>

        <Text tag="p" size="medium" color="gray" align="left">
          {listing.city}
          {listing.region ? `, ${listing.region}` : ''}
        </Text>

        {listing.address && (
          <Text tag="p" size="medium" color="gray" align="left">
            {listing.address}
          </Text>
        )}

        {listing.promotion && listing.promotion_new_price ? (
          <div className={styles.promotionPrice}>
            <Text tag="p" size="medium" color="gray" align="left">
              <span className={styles.oldPrice}>{listing.promotion_old_price} ₽</span>
            </Text>
            <Text tag="p" size="large" fontWeight="bold" color="primary" align="left">
              {listing.promotion_new_price} ₽ / ночь
            </Text>
            {listing.promotion_conditions && (
              <Text tag="p" size="small" color="gray" align="left">
                {listing.promotion_conditions}
              </Text>
            )}
          </div>
        ) : (
          <Text tag="p" size="large" fontWeight="bold" color="primary" align="left">
            {listing.price_per_night} ₽ / ночь
          </Text>
        )}

        <div className={styles.details}>
          <Text tag="p" size="medium" align="left">
            Тип: {propertyTypeLabel}
          </Text>
          <Text tag="p" size="medium" align="left">
            Гостей: до {listing.max_guests}
          </Text>
          <Text tag="p" size="medium" align="left">
            Спальни: {listing.bedrooms}
          </Text>
        </div>

        {listing.description && (
          <Text tag="p" size="medium" align="left">
            {listing.description}
          </Text>
        )}

        {listing.amenities.length > 0 && (
          <div className={styles.amenities}>
            <Text tag="p" size="medium" fontWeight="medium" align="left">
              Удобства:
            </Text>
            <ul className={styles.amenitiesList}>
              {listing.amenities.map((amenity) => (
                <li key={amenity}>
                  <Text tag="span" size="small" align="left">
                    {amenity}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
