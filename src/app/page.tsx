import Client from '@/components/Client'
import { cn } from '@/lib/utils'
import { caller, getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import React, { Suspense } from 'react'

const Page = async () => {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions())

  return (
    <div className={cn('min-h-screen min-w-screen flex items-center justify-center')}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default Page
