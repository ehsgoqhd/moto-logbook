import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-gray-500'}`} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/motorcycles',
    label: '오토바이',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    to: '/fuel',
    label: '주유',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h2l2 9h10l2-9h2M7 10V7a5 5 0 0110 0v3M12 14v3" />
      </svg>
    ),
  },
  {
    to: '/maintenance',
    label: '정비',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/more',
    label: '더보기',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-brand-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex-1 flex flex-col items-center gap-1 py-2 pt-3"
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span className={`text-xs ${isActive ? 'text-brand-500' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* iOS safe area */}
      <div className="h-safe-area-inset-bottom bg-gray-900" />
    </nav>
  )
}
