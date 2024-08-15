import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3'

import { r2 } from '@/lib/r2'

export const POST = async (request: Request) => {
  try {
    const { key, uploadId, parts } = await request.json()
    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
    await r2.send(command)
    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}
