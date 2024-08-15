import { AbortMultipartUploadCommand } from '@aws-sdk/client-s3'

import { r2 } from '@/lib/r2'

export const POST = async (request: Request) => {
  try {
    const { key, uploadId } = await request.json()
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    })
    await r2.send(command)
    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
