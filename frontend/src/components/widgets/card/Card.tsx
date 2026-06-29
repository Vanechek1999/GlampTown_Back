import { Link } from 'react-router-dom'
import type { Listing } from '../../../types/listing'
import { getImageUrl } from '../../../api/listings'
import { Text } from '../../shared'
import styles from './Card.module.css'

interface CardProps {
  item: Listing
}

export const Card = ({ item }: CardProps) => {
  return (
    <Link to={`/listings/${item.id}`} className={styles.container}>
      <div className={styles.images}>
        {item.images.map((image) => (
          <img
            key={image}
            className={styles.image}
            src={getImageUrl(image)}
            alt={item.title}
          />
        ))}
      </div>
      <div className={styles.content}>
        <Text tag="h2" fontWeight="bold" size="large">
          {item.title}
        </Text>
        <Text tag="p" fontWeight="regular" size="medium">
          {item.description}
        </Text>
        <Text tag="p" fontWeight="regular" size="medium">
          {item.city}
        </Text>
        <div className={styles.price}>
          <Text tag="p" fontWeight="regular" size="medium">
            {item.price_per_night} ₽ / ночь
          </Text>
        </div>
      </div>
    </Link>
  )
}
