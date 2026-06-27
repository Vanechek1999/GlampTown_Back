import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export const listingFormSchema = z.object({
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

export type ListingFormValues = z.infer<typeof listingFormSchema>
