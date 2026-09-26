import slugifyFn from 'slugify'

export function makeSlug(text: string): string {
  return slugifyFn(text, {
    lower: true,
    strict: true,
    locale: 'it',
    trim: true,
  })
}
