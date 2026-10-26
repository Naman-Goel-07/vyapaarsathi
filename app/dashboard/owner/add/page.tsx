import { Suspense } from 'react'
import OwnerAdd from '@/components/owner/OwnerAdd'
import OwnerSkeleton from '@/components/owner/OwnerSkeleton'
export default function Page() { return <Suspense fallback={<OwnerSkeleton />}><OwnerAdd /></Suspense> }
