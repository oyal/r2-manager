import { useState } from 'react'

import { useSearchParams } from 'next/navigation'

import axios from 'axios'
import { filesize } from 'filesize'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '@/components/ui/dialog'

const UploadDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
}) => {
  const { mutate } = useSWRConfig()
  const [progress, setProgress] = useState(0)
  const searchParams = useSearchParams()
  const prefix = searchParams.get('prefix') || ''

  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const file = formData.get('file') as File

    try {
      if (file.size < 10 * 1024 * 1024) {
        const res = await fetch('/api/bucket', {
          method: 'POST',
          body: JSON.stringify({
            key: `${prefix}${file.name}`,
          }),
        })

        if (res.ok) {
          const { url } = await res.json()
          const uploadRes = await axios.put(url, file, {
            headers: {
              'Content-Type': file.type,
            },
            onUploadProgress: (event) => {
              const percentCompleted = Math.round(
                (event.loaded * 100) / file.size,
              )
              setProgress(percentCompleted)
            },
          })
          if (uploadRes.status === 200) {
            toast.success('上传成功')
            setProgress(100)
            setFile(null)
            setIsOpen(false)
            await mutate(`/api/bucket?prefix=${prefix}`)
          } else {
            toast.error('上传失败')
          }
        } else {
          toast.error('上传失败')
        }
      } else {
        const partsCount = Math.ceil(file.size / (5 * 1024 * 1024))
        let progressArray = new Array(partsCount).fill(0)
        const updateProgress = (partIndex: number, percent: number) => {
          progressArray[partIndex] = percent

          const totalProgress =
            progressArray.reduce((acc, curr) => acc + curr, 0) / partsCount

          setProgress(totalProgress)
        }

        const res = await fetch(`/api/bucket/multipart-upload`, {
          method: 'POST',
          body: JSON.stringify({
            key: `${prefix}${file.name}`,
            partsCount: Math.ceil(file.size / (5 * 1024 * 1024)),
            contentType: file.type,
          }),
        })

        if (res.ok) {
          const { uploadId, signedUrls } = await res.json()
          const parts = await Promise.all(
            signedUrls.map(async (signedUrl: string, index: number) => {
              const part = file.slice(
                index * 5 * 1024 * 1024,
                (index + 1) * 5 * 1024 * 1024,
              )
              const uploadRes = await axios.put(signedUrl, part, {
                onUploadProgress: (event) => {
                  const percentCompleted = Math.round(
                    (event.loaded * 100) / part.size,
                  )
                  updateProgress(index, percentCompleted)
                },
              })
              if (uploadRes.status === 200) {
                return {
                  PartNumber: index + 1,
                  ETag: uploadRes.headers.etag,
                }
              } else {
                throw new Error('上传失败')
              }
            }),
          )

          const completeRes = await fetch(
            `/api/bucket/complete-multipart-upload`,
            {
              method: 'POST',
              body: JSON.stringify({
                key: `${prefix}${file.name}`,
                uploadId,
                parts,
              }),
            },
          )

          if (completeRes.ok) {
            toast.success('上传成功')
            setProgress(100)
            setFile(null)
            setIsOpen(false)
            await mutate(`/api/bucket?prefix=${prefix}`)
          } else {
            toast.error('上传失败')
          }
        } else {
          toast.error('上传失败')
        }
      }
    } catch (error) {
      toast.error('上传失败')
    } finally {
      setProgress(0)
    }
  }

  return (
    <Dialog open={isOpen} onClose={setIsOpen}>
      <DialogTitle>上传文件</DialogTitle>
      <DialogBody className="space-y-6">
        <form onSubmit={handleSubmit}>
          <input
            onChange={(event) => {
              if (event.currentTarget.files) {
                setFile(event.currentTarget.files[0])
              }
            }}
            type="file"
            name="file"
          />
          <button type="submit">上传</button>
        </form>

        {file && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-zinc-500">
                  {filesize(file.size, { standard: 'jedec' })}
                </p>
              </div>
              <div>{progress.toFixed(2)} %</div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                style={{ width: `${progress}%` }}
                className="h-2 rounded-full bg-blue-600"
              />
            </div>
          </div>
        )}
      </DialogBody>
      <DialogActions>
        <Button plain onClick={() => setIsOpen(false)}>
          取消
        </Button>
        <Button>确定</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadDialog
