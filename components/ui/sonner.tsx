'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-zinc-50 group-[.toaster]:dark:bg-zinc-800 group-[.toaster]:shadow-lg',
          description:
            'group-[.toast]:text-zinc-600 group-[.toast]:dark:text-zinc-400',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
