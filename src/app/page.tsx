import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'

const Page = () => {
  return (
    <div className={cn('min-h-screen min-w-screen flex items-center justify-center')}>
      <Button>
        Click Me
      </Button>
    </div>
  )
}

export default Page
