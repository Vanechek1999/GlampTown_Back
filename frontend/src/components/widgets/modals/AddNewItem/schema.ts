import { z } from 'zod'
import type { Listing, ListingPayload } from '../../../../types/listing'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const EMPTY_FORM_VALUES: ListingFormValues = {
  title: '',
  description: '',
  price_per_night: undefined as unknown as number,
  city: '',
  region: '',
  address: '',
  property_type: 'cabin',
  max_guests: 2,
  bedrooms: 1,
  promotion: false,
  promotion_old_price: undefined,
  promotion_new_price: undefined,
  promotion_conditions: '',
  images: [],
}

export function listingToFormValues(listing: Listing): ListingFormValues {
  return {
    title: listing.title,
    description: listing.description,
    price_per_night: Number(listing.price_per_night),
    city: listing.city,
    region: listing.region,
    address: listing.address,
    property_type: listing.property_type,
    max_guests: listing.max_guests,
    bedrooms: listing.bedrooms,
    promotion: listing.promotion,
    promotion_old_price: listing.promotion_old_price
      ? Number(listing.promotion_old_price)
      : undefined,
    promotion_new_price: listing.promotion_new_price
      ? Number(listing.promotion_new_price)
      : undefined,
    promotion_conditions: listing.promotion_conditions,
    images: [],
  }
}

export function formValuesToPayload(data: ListingFormValues): ListingPayload {
  return {
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
    promotion: data.promotion,
    promotion_old_price: data.promotion ? data.promotion_old_price : null,
    promotion_new_price: data.promotion ? data.promotion_new_price : null,
    promotion_conditions: data.promotion ? data.promotion_conditions : '',
  }
}

export const listingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Укажите название')
      .max(200, 'Не более 200 символов'),
    description: z.string().max(5000, 'Не более 5000 символов'),
    price_per_night: z
      .number({ error: 'Укажите цену за ночь' })
      .positive('Цена должна быть больше 0'),
    city: z
      .string()
      .trim()
      .min(1, 'Укажите город')
      .max(100, 'Не более 100 символов'),
    region: z.string().max(100, 'Не более 100 символов'),
    address: z.string().max(255, 'Не более 255 символов'),
    property_type: z.enum(['tent', 'yurt', 'cabin', 'dome', 'treehouse', 'other'], {
      error: 'Выберите тип жилья',
    }),
    max_guests: z
      .number({ error: 'Укажите количество гостей' })
      .int('Только целое число')
      .min(1, 'Минимум 1 гость')
      .max(50, 'Максимум 50 гостей'),
    bedrooms: z
      .number({ error: 'Укажите количество спален' })
      .int('Только целое число')
      .min(0, 'Не может быть отрицательным')
      .max(20, 'Максимум 20 спален'),
    promotion: z.boolean(),
    promotion_old_price: z.number().positive('Старая цена должна быть больше 0').optional(),
    promotion_new_price: z.number().positive('Новая цена должна быть больше 0').optional(),
    promotion_conditions: z.string().max(2000, 'Не более 2000 символов'),
    images: z
      .array(z.instanceof(File))
      .refine(
        (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
        'Допустимы только JPEG, PNG, WebP и GIF',
      )
      .refine(
        (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
        'Каждый файл не должен превышать 5 МБ',
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.promotion) return

    if (data.promotion_old_price === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Укажите старую цену',
        path: ['promotion_old_price'],
      })
    }

    if (data.promotion_new_price === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Укажите новую цену',
        path: ['promotion_new_price'],
      })
    }

    if (
      data.promotion_old_price !== undefined &&
      data.promotion_new_price !== undefined &&
      data.promotion_new_price >= data.promotion_old_price
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Новая цена должна быть меньше старой',
        path: ['promotion_new_price'],
      })
    }

    if (!data.promotion_conditions.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Укажите условия проведения акции',
        path: ['promotion_conditions'],
      })
    }
  })

export type ListingFormValues = z.infer<typeof listingFormSchema>
