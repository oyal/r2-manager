import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

import { r2 } from '@/lib/r2'

export const GET = async (
  request: Request,
  { params: { key } }: { params: { key: string[] } },
) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key.join('/'),
    })
    const object = await r2.send(command)

    return new Response(object.Body?.transformToWebStream(), {
      headers: {
        'Content-Type': object.ContentType!,
        'Content-Length': object.ContentLength?.toString()!,
      },
    })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export const DELETE = async (
  request: Request,
  { params: { key } }: { params: { key: string[] } },
) => {
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key.join('/'),
      }),
    )

    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
