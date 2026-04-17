'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: '◈' },
  { href: '/admin/users',     label: 'Access Keys',  icon: '⚿' },
  { href: '/admin/sites',     label: 'Sites',        icon: '⊕' },
  { href: '/admin/signals',   label: 'Signals',      icon: '◎' },
  { href: '/admin/settings',  label: 'Settings',     icon: '⚙' },
  { href: '/admin/logs',      label: 'Logs',         icon: '☰' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <aside className="w-56 border-r border-white/5 bg-cyber-card/50 flex flex-col sticky top-0 h-screen flex-shrink-0">
      <div className="p-5 border-b border-white/5">
        <div className="font-display text-sm font-black text-cyber-cyan tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>
          LISCONVASTAG
        </div>
        <div className="text-white/30 text-xs font-mono mt-0.5">Admin Control</div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(n => {
          const active = pathname === n.href || pathname.startsWith(n.href + '/')
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                ${active
                  ? 'bg-cyber-cyan/10 text-white border border-cyber-cyan/15'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <span className={`font-mono text-sm transition-colors ${active ? 'text-cyber-cyan' : 'text-white/30 group-hover:text-cyber-cyan/60'}`}>
                {n.icon}
              </span>
              <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>{n.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1">
        <Link
          href="/signals"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/25 hover:text-cyber-cyan/50 font-mono transition-colors"
        >
          → Client View
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/25 hover:text-cyber-red/60 font-mono transition-colors"
        >
          ✕ Logout Admin
        </button>
      </div>
    </aside>
  )
}
