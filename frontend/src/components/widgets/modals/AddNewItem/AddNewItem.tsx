import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createListing, uploadListingImages } from '../../../../api/listings'
import { PROPERTY_TYPES } from '../../../../types/listing'
import { listingFormSchema, type ListingFormValues } from './schema'
import styles from './AddNewItem.module.css'

interface AddNewItemProps {
  onCreated?: () => void
}

export const AddNewItem = ({ onCreated }: AddNewItemProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: '',
      description: '',
      price_per_night: undefined,
      city: '',
      region: '',
      address: '',
      property_type: 'cabin',
      max_guests: 2,
      bedrooms: 1,
      images: [],
    },
  })

  const images = watch('images')

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [images])

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    const merged = [...images, ...selected]
    setValue('images', merged, { shouldValidate: true })
    event.target.value = ''
  }

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    setValue('images', next, { shouldValidate: true })
  }

  const onSubmit = async (data: ListingFormValues) => {
    setServerError(null)

    try {
      const listing = await createListing({
        title: data.title,
        description: data.description,
        price_per_night: data.price_per_night,
        city: data.city,
        region: data.region,
        address: data.address,
        property_type: data.property_type,
        max_guests: data.max_guests,
        bedrooms: data.bedrooms,
        status: 'active',
      })

      if (data.images.length > 0) {
        await uploadListingImages(listing.id, data.images)
      }

      reset()
      onCreated?.()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Произошла ошибка')
    }
  }

  return (
    <section className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label htmlFor="title">Название *</label>
          <input id="title" type="text" {...register('title')} />
          {errors.title && <span className={styles.error}>{errors.title.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Описание</label>
          <textarea id="description" {...register('description')} />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="price_per_night">Цена за ночь (₽) *</label>
            <input
              id="price_per_night"
              type="number"
              min="0"
              step="0.01"
              {...register('price_per_night', { valueAsNumber: true })}
            />
            {errors.price_per_night && (
              <span className={styles.error}>{errors.price_per_night.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="property_type">Тип жилья *</label>
            <select id="property_type" {...register('property_type')}>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.property_type && (
              <span className={styles.error}>{errors.property_type.message}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="city">Город *</label>
            <input id="city" type="text" {...register('city')} />
            {errors.city && <span className={styles.error}>{errors.city.message}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="region">Регион</label>
            <input id="region" type="text" {...register('region')} />
            {errors.region && <span className={styles.error}>{errors.region.message}</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Адрес</label>
          <input id="address" type="text" {...register('address')} />
          {errors.address && <span className={styles.error}>{errors.address.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="max_guests">Макс. гостей *</label>
            <input
              id="max_guests"
              type="number"
              min="1"
              {...register('max_guests', { valueAsNumber: true })}
            />
            {errors.max_guests && (
              <span className={styles.error}>{errors.max_guests.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="bedrooms">Спальни</label>
            <input
              id="bedrooms"
              type="number"
              min="0"
              {...register('bedrooms', { valueAsNumber: true })}
            />
            {errors.bedrooms && (
              <span className={styles.error}>{errors.bedrooms.message}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="images">Фотографии</label>
          <p className={styles.hint}>
            Необязательно — если не добавить, будет использовано стандартное фото
          </p>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImagesChange}
          />
          {errors.images && <span className={styles.error}>{errors.images.message}</span>}

          {previewUrls.length > 0 && (
            <div className={styles.previews}>
              {previewUrls.map((url, index) => (
                <div key={url} className={styles.preview}>
                  <img src={url} alt={`Превью ${index + 1}`} />
                  <button
                    type="button"
                    className={styles.previewRemove}
                    onClick={() => removeImage(index)}
                    aria-label="Удалить изображение"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {serverError && <div className={styles.serverError}>{serverError}</div>}

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Добавить объект'}
        </button>
      </form>
    </section>
  )
}
