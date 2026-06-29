import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/widgets'
import { fetchPromotionListings } from '../../api/listings'
import { Text } from '../../components/shared'
import type { Listing } from '../../types/listing'
import styles from './Promotion.module.css'

export const Promotion = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPromotionListings = useCallback(() => {
    fetchPromotionListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadPromotionListings()
  }, [loadPromotionListings])

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        ← Назад к списку
      </Link>

      <Text tag="h1" size="large" fontWeight="bold" color="heading" align="left">
        Акции
      </Text>

      {isLoading && (
        <Text tag="p" size="medium" color="gray" align="left">
          Загрузка...
        </Text>
      )}

      {error && (
        <Text tag="p" size="medium" color="red" align="left">
          {error}
        </Text>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <Text tag="p" size="medium" color="gray" align="left">
          Сейчас нет объектов с акцией
        </Text>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <ul className={styles.listingsList}>
          {listings.map((listing) => (
            <li key={listing.id} className={styles.listingItem}>
              <Card item={listing} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
