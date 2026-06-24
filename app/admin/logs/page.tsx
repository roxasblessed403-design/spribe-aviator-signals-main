'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .finally(() => setLoading(false))
  }, [])

  const levelColors: Record<string, string> = {
    info: 'text-cyber-cyan',
    warn: 'text-cyber-yellow',
    error: 'text-cyber-red',
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex">
      <aside className="w-56 border-r border-white/5 bg-cyber-card/50 p-3 sticky top-0 h-screen">
        <div className="p-2 mb-4">
          <div className="font-display text-sm font-black text-cyber-cyan tracking-wider">SPRIB3</div>
        </div>
        {[
          { href: '/admin/dashboard', label: '◈ Dashboard' },
          { href: '/admin/users', label: '⚿ Access Keys' },
          { href: '/admin/sites', label: '⊕ Sites' },
          { href: '/admin/signals', label: '◎ Signals' },
          { href: '/admin/settings', label: '⚙ Settings' },
          { href: '/admin/logs', label: '☰ Logs' },
        ].map(n => (
          <Link key={n.href} href={n.href} className="flex items-center px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all font-mono">
            {n.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-3xl">
          <div className="mb-6">
            <h1 className="font-display text-xl font-black text-white tracking-wider">System Logs</h1>
            <p className="text-white/30 text-sm font-mono mt-1">Connector events and system activity</p>
          </div>

          <div className="glass-card border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/30 font-mono uppercase tracking-widest">Recent Events</span>
              <button onClick={() => { setLoading(true); fetch('/api/admin/logs').then(r => r.json()).then(d => setLogs(d.logs || [])).finally(() => setLoading(false)) }}
                className="text-xs text-cyber-cyan/40 hover:text-cyber-cyan font-mono transition-colors">
                ↻ Refresh
              </button>
            </div>
            {loading ? (
              <div className="p-6 text-white/30 font-mono text-sm">Loading logs...</div>
            ) : (
              <div className="divide-y divide-white/5 font-mono text-xs max-h-[60vh] overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/2">
                    <span className={`w-12 flex-shrink-0 font-bold uppercase ${levelColors[log.level] || 'text-white/40'}`}>
                      {log.level}
                    </span>
                    <span className="text-white/20 flex-shrink-0 tabular-nums">
                      {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                    </span>
                    <span className="text-white/60">{log.message}</span>
                    {log.source && <span className="text-white/20 ml-auto flex-shrink-0">[{log.source}]</span>}
                  </div>
                ))}
                {!logs.length && (
                  <div className="p-6 text-white/20 text-center">No logs yet</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
