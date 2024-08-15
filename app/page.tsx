import { Suspense } from 'react'

import BucketTable from '@/app/_components/bucket-table'

const RootPage = async () => {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">文件列表</h1>
      <Suspense>
        <BucketTable />
      </Suspense>
    </div>
  )
}

export default RootPage
