import { useCallback, useEffect, useState } from 'react'
import { AddNewItemModal, Card } from '../../components/widgets'
import { fetchListings } from '../../api/listings'
import type { Listing } from '../../types/listing'
import { Text } from '../../components/shared'
import styles from './HomePage.module.css'
import { Link } from 'react-router-dom'

export const HomePage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const loadListings = useCallback(() => {
    fetchListings()
      .then(setListings)
      .catch((error) => console.error('Error fetching listings:', error))
  }, [])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  return (
    <>
      <Text tag="h1" size="large" fontWeight="bold" color="heading">
        Glamping Rentals
      </Text>
      <nav>
        <Link to="/promotion">Акции</Link>
      </nav>

      <button
        type="button"
        className={styles.addListingBtn}
        onClick={() => setIsAddModalOpen(true)}
      >
        Добавить объект
      </button>

      <AddNewItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadListings}
      />

      <ul className={styles.listingsList}>
        {listings.map((listing) => (
          <li key={listing.id} className={styles.listingItem}>
            <Card item={listing} />
          </li>
        ))}
      </ul>
    </>
  )
}
