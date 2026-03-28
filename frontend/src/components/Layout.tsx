import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  title?: string
  rightAction?: ReactNode
  children: ReactNode
  hideNav?: boolean
}

export function Layout({ title, rightAction, children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col max-w-md mx-auto">
      {title !== undefined && (
        <header className="flex items-center justify-between px-4 pt-12 pb-4 bg-gray-950 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-gray-100">{title}</h1>
          {rightAction && <div>{rightAction}</div>}
        </header>
      )}
      <main className={`flex-1 overflow-y-auto px-4 ${hideNav ? 'pb-4' : 'pb-24'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
