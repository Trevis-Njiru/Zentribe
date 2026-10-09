import type { SupabaseClient } from '@supabase/supabase-js'

export const PHOTO_BUCKET = 'therapist-photos'

const MAX_INPUT_BYTES = 8 * 1024 * 1024
const OUTPUT_WIDTH = 800
const OUTPUT_HEIGHT = 1000

async function preparePhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('We could not read that image.'))
      element.src = url
    })

    const targetRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT
    let sourceWidth = image.width
    let sourceHeight = image.height

    if (sourceWidth / sourceHeight > targetRatio) {
      sourceWidth = sourceHeight * targetRatio
    } else {
      sourceHeight = sourceWidth / targetRatio
    }

    const sourceX = (image.width - sourceWidth) / 2
    const sourceY = (image.height - sourceHeight) * 0.2

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_WIDTH
    canvas.height = OUTPUT_HEIGHT

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Your browser could not prepare the image.')
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    )

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error('We could not prepare that image.')),
        'image/jpeg',
        0.85
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function uploadTherapistPhoto(
  supabase: SupabaseClient,
  professionalId: string,
  file: File
): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP image.')
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is over 8 MB. Please choose a smaller one.')
  }

  const blob = await preparePhoto(file)
  const path = `${professionalId}/${Date.now()}.jpg`

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path)

  return data.publicUrl
}

export async function removeTherapistPhoto(
  supabase: SupabaseClient,
  url: string | null
) {
  if (!url) return

  const marker = `/${PHOTO_BUCKET}/`
  const index = url.indexOf(marker)

  if (index === -1) return

  const path = url.slice(index + marker.length)

  await supabase.storage.from(PHOTO_BUCKET).remove([path])
}