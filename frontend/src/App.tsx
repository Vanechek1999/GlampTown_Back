import { useCallback, useEffect, useState } from 'react'
import { AddNewItemModal, Card } from './components/widgets'
import { fetchListings } from './api/listings'
import type { Listing } from './types/listing'
import styles from './App.module.css'

function App() {
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
      <h1>Glamping Rentals</h1>

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
        onCreated={loadListings}
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

export default App
