'use client'

import { Fragment, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { ListObjectsCommandOutput } from '@aws-sdk/client-s3'
import {
  ArrowDownOnSquareIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { ArrowPathIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { filesize } from 'filesize'
import useSWR from 'swr'

import UploadDialog from '@/app/_components/upload-dialog'
import { Button } from '@/components/ui/button'
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/ui/dropdown'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const fetcher = async (url: string) => fetch(url).then((r) => r.json())

const BucketTable = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefix = searchParams.get('prefix') || ''
  const { data, isValidating, mutate } = useSWR<ListObjectsCommandOutput>(
    `/api/bucket?prefix=${prefix}`,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  )
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false)

  const goBack = () => {
    const prefix = searchParams.get('prefix') || ''
    const parts = prefix.split('/').filter(Boolean)
    parts.pop()
    if (!parts.length) {
      router.push('/')
    } else {
      router.push(`/?prefix=${parts.join('/')}`)
    }
  }

  const handleDownload = async (key: string | undefined) => {
    const res = await fetch(`/api/bucket/${key}`, {
      method: 'GET',
    })
    const blob = await res.blob()
    const fileURL = window.URL.createObjectURL(blob)
    let anchor = document.createElement('a')
    anchor.href = fileURL
    anchor.download = key?.split('/').pop() || ''
    anchor.click()
  }

  const handleDelete = async (key: string | undefined) => {
    const res = await fetch(`/api/bucket/${key}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      await mutate()
    } else {
      alert('删除失败')
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-zinc-400">
          {!prefix && <span>/</span>}
          {prefix
            .split('/')
            .filter(Boolean)
            .map((item, index) => (
              <Fragment key={index}>
                <span>{item}</span>
                <span>/</span>
              </Fragment>
            ))}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
            />
          </svg>
        </div>
        <div className="space-x-2">
          <Button onClick={() => mutate()} outline>
            <ArrowPathIcon className="size-5" />
            刷新
          </Button>
          <Button onClick={() => setUploadDialogVisible(true)}>
            <CloudArrowUpIcon className="size-5" />
            上传
          </Button>
        </div>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>名称</TableHeader>
            <TableHeader>大小</TableHeader>
            <TableHeader>最后修改时间</TableHeader>
            <TableHeader>操作</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {isValidating &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="animate-pulse">
                <TableCell>
                  <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                </TableCell>
                <TableCell>
                  <div className="h-5 w-10 rounded bg-zinc-200 dark:bg-zinc-800"></div>
                </TableCell>
              </TableRow>
            ))}

          {!isValidating && data?.Prefix && (
            <TableRow
              onClick={goBack}
              className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <TableCell>...</TableCell>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
            </TableRow>
          )}

          {!isValidating &&
            data?.CommonPrefixes?.map((item) => (
              <TableRow
                onClick={() => router.push(`/?prefix=${item.Prefix}`)}
                key={item.Prefix}
                className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <TableCell>{item.Prefix}</TableCell>
                <TableCell>—</TableCell>
                <TableCell>—</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            ))}
          {!isValidating &&
            data?.Contents?.map((item) => (
              <TableRow
                key={item.Key}
                className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <TableCell>
                  {item.Key?.replace(
                    new RegExp(`^${searchParams.get('prefix') || ''}`),
                    '',
                  )}
                </TableCell>
                <TableCell>{item.Size ? filesize(item.Size) : '—'}</TableCell>
                <TableCell>
                  {item.LastModified
                    ? format(item.LastModified, 'yyyy-MM-dd HH:mm:ss')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownButton plain>
                      <EllipsisVerticalIcon />
                    </DropdownButton>
                    <DropdownMenu>
                      <DropdownItem
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/api/bucket/${item.Key}`,
                          )
                        }
                      >
                        <LinkIcon />
                        <DropdownLabel>复制链接</DropdownLabel>
                      </DropdownItem>
                      <DropdownItem onClick={() => handleDownload(item.Key)}>
                        <ArrowDownOnSquareIcon />
                        <DropdownLabel>下载</DropdownLabel>
                      </DropdownItem>
                      <DropdownItem>
                        <TrashIcon className="fill-red-500" />
                        <DropdownLabel
                          onClick={() => handleDelete(item.Key)}
                          className="text-red-500"
                        >
                          删除
                        </DropdownLabel>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <UploadDialog
        isOpen={uploadDialogVisible}
        setIsOpen={setUploadDialogVisible}
      />
    </>
  )
}

export default BucketTable
