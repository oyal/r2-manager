import { ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { r2 } from '@/lib/r2'

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') || undefined

    const command = new ListObjectsCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Delimiter: '/',
      Prefix: prefix,
    })
    const list = await r2.send(command)

    return Response.json(list)
  } catch (error) {
    return Response.json({ error }, { status: 60 })
  }
}

export const POST = async (request: Request) => {
  try {
    const { key } = await request.json()

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(r2, command, {
      expiresIn: 3600,
    })

    return Response.json({ url: signedUrl })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
