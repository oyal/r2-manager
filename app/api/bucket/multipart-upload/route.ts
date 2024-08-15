import {
  CreateMultipartUploadCommand,
  ListMultipartUploadsCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { r2 } from '@/lib/r2'

export const GET = async (request: Request) => {
  try {
    const command = new ListMultipartUploadsCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    })
    const ongoingUploads = await r2.send(command)

    return Response.json(ongoingUploads)
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

export const POST = async (request: Request) => {
  try {
    const { key, partsCount, contentType } = await request.json()
    const uploadId = await createMultipartUploadSignedUrl(key, contentType)
    const signedUrls = []
    for (let i = 1; i <= partsCount; i++) {
      const signedUrl = await getUploadPartSignedUrl(key, uploadId, i)
      signedUrls.push(signedUrl)
    }
    return Response.json({
      uploadId,
      signedUrls,
    })
  } catch (error) {
    return Response.json({ error }, { status: 500 })
  }
}

async function createMultipartUploadSignedUrl(
  key: string | undefined,
  contentType: string,
) {
  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  const uploadId = await r2.send(command)
  return uploadId.UploadId
}

async function getUploadPartSignedUrl(
  key: string,
  uploadId: string | undefined,
  partNumber: number,
) {
  const command = new UploadPartCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  })
  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })
  return signedUrl
}
