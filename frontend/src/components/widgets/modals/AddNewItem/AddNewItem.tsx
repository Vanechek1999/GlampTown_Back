import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createListing,
  getImageUrl,
  updateListing,
  uploadListingImages,
} from '../../../../api/listings'
import type { Listing } from '../../../../types/listing'
import { PROPERTY_TYPES } from '../../../../types/listing'
import {
  EMPTY_FORM_VALUES,
  formValuesToPayload,
  listingFormSchema,
  listingToFormValues,
  type ListingFormValues,
} from './schema'
import styles from './AddNewItem.module.css'

interface AddNewItemProps {
  listing?: Listing
  onSuccess?: () => void
}

export const AddNewItem = ({ listing, onSuccess }: AddNewItemProps) => {
  const isEditMode = Boolean(listing)
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
    defaultValues: listing ? listingToFormValues(listing) : EMPTY_FORM_VALUES,
  })

  const images = watch('images')
  const promotionEnabled = watch('promotion')

  useEffect(() => {
    reset(listing ? listingToFormValues(listing) : EMPTY_FORM_VALUES)
  }, [listing, reset])

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
      const payload = formValuesToPayload(data)

      if (isEditMode && listing) {
        await updateListing(listing.id, payload)
        if (data.images.length > 0) {
          await uploadListingImages(listing.id, data.images)
        }
      } else {
        const created = await createListing(payload)
        if (data.images.length > 0) {
          await uploadListingImages(created.id, data.images)
        }
      }

      if (!isEditMode) {
        reset(EMPTY_FORM_VALUES)
      }

      onSuccess?.()
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

        <div className={styles.promotionSection}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" {...register('promotion')} />
            Добавить акцию
          </label>

          {promotionEnabled && (
            <div className={styles.promotionFields}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="promotion_old_price">Старая цена (₽) *</label>
                  <input
                    id="promotion_old_price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('promotion_old_price', { valueAsNumber: true })}
                  />
                  {errors.promotion_old_price && (
                    <span className={styles.error}>{errors.promotion_old_price.message}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="promotion_new_price">Новая цена (₽) *</label>
                  <input
                    id="promotion_new_price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('promotion_new_price', { valueAsNumber: true })}
                  />
                  {errors.promotion_new_price && (
                    <span className={styles.error}>{errors.promotion_new_price.message}</span>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="promotion_conditions">Условия проведения акции *</label>
                <textarea
                  id="promotion_conditions"
                  {...register('promotion_conditions')}
                  placeholder="Например: действует при бронировании от 3 ночей"
                />
                {errors.promotion_conditions && (
                  <span className={styles.error}>{errors.promotion_conditions.message}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="images">Фотографии</label>
          <p className={styles.hint}>
            {isEditMode
              ? 'Можно добавить новые фото — существующие сохранятся'
              : 'Необязательно — если не добавить, будет использовано стандартное фото'}
          </p>

          {isEditMode && listing && listing.images.length > 0 && (
            <div className={styles.previews}>
              {listing.images.map((image) => (
                <div key={image} className={styles.preview}>
                  <img src={getImageUrl(image)} alt="Текущее фото" />
                </div>
              ))}
            </div>
          )}

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
          {isSubmitting
            ? 'Сохранение...'
            : isEditMode
              ? 'Сохранить изменения'
              : 'Добавить объект'}
        </button>
      </form>
    </section>
  )
}
