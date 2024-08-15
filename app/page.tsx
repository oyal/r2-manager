import BucketTable from '@/app/_components/bucket-table'

const RootPage = async () => {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">文件列表</h1>
      <BucketTable />
    </div>
  )
}

export default RootPage
