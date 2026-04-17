'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface Site {
  id: string
  name: string
  url: string
  enabled: boolean
  mode: 'mock' | 'live' | 'manual'
  order: number
}

const BUILT_IN = ['pridebet', 'winbucks', 'bettingcozw', 'bolabet']

export default function AdminSitesPage() {
  const [sites, setSites]       = useState<Site[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Add form state
  const [newName, setNewName] = useState('')
  const [newUrl,  setNewUrl]  = useState('')
  const [newMode, setNewMode] = useState<'mock' | 'manual'>('mock')

  // Inline edit state
  const [editing, setEditing]   = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl,  setEditUrl]  = useState('')

  function notify(type: 'ok' | 'err', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  async function loadSites() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/sites')
      if (r.status === 401) { window.location.href = '/admin'; return }
      const d = await r.json()
      setSites(d.sites || [])
    } catch { notify('err', 'Failed to load sites.') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadSites() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const r = await fetch('/api/admin/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, url: newUrl, mode: newMode, enabled: true }),
      })
      const d = await r.json()
      if (!r.ok) { notify('err', d.error || 'Failed to add site.'); return }
      notify('ok', `"${d.site.name}" added successfully.`)
      setNewName(''); setNewUrl(''); setNewMode('mock'); setShowAdd(false)
      await loadSites()
    } catch { notify('err', 'Network error.') }
    finally { setSaving(false) }
  }

  async function handleToggleEnabled(id: string, current: boolean) {
    const r = await fetch('/api/admin/sites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !current }),
    })
    if (r.ok) {
      setSites(prev => prev.map(s => s.id === id ? { ...s, enabled: !current } : s))
      notify('ok', `Site ${!current ? 'enabled' : 'disabled'}.`)
    }
  }

  async function handleToggleMode(id: string, current: string) {
    const next = current === 'mock' ? 'manual' : current === 'manual' ? 'live' : 'mock'
    const r = await fetch('/api/admin/sites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, mode: next }),
    })
    if (r.ok) {
      setSites(prev => prev.map(s => s.id === id ? { ...s, mode: next as Site['mode'] } : s))
    }
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    try {
      const r = await fetch('/api/admin/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName, url: editUrl }),
      })
      const d = await r.json()
      if (!r.ok) { notify('err', d.error || 'Update failed.'); return }
      notify('ok', 'Site updated.')
      setEditing(null)
      await loadSites()
    } catch { notify('err', 'Network error.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const r = await fetch('/api/admin/sites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const d = await r.json()
    if (!r.ok) { notify('err', d.error || 'Delete failed.'); return }
    notify('ok', `"${name}" removed.`)
    await loadSites()
  }

  const modeStyle: Record<string, string> = {
    mock:   'border-cyber-yellow/40 text-cyber-yellow',
    live:   'border-cyber-green/40  text-cyber-green',
    manual: 'border-cyber-purple/40 text-cyber-purple',
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-xl font-black text-white tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>
                Site Manager
              </h1>
              <p className="text-white/30 text-sm font-mono mt-1">
                Add, edit, enable/disable betting sites · {sites.length} total
              </p>
            </div>
            <button
              onClick={() => setShowAdd(v => !v)}
              className={`px-4 py-2 rounded-lg text-sm font-mono font-bold border transition-all ${
                showAdd
                  ? 'border-white/20 text-white/50 hover:text-white'
                  : 'border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10'
              }`}
            >
              {showAdd ? '✕ Cancel' : '+ Add Site'}
            </button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div className={`mb-4 px-4 py-3 rounded-lg border text-xs font-mono ${
              feedback.type === 'ok'
                ? 'border-cyber-green/30 bg-cyber-green/5 text-cyber-green'
                : 'border-cyber-red/30 bg-cyber-red/5 text-cyber-red'
            }`}>
              {feedback.type === 'ok' ? '✓' : '⚠'} {feedback.msg}
            </div>
          )}

          {/* Add site form */}
          {showAdd && (
            <form onSubmit={handleAdd} className="glass-card border border-cyber-cyan/20 rounded-xl p-5 mb-5">
              <div className="font-display text-sm font-bold text-cyber-cyan mb-4 tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>
                ⊕ New Betting Site
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-white/40 font-mono uppercase tracking-widest mb-1.5">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. SportPesa"
                    required
                    className="w-full bg-cyber-muted/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 font-mono uppercase tracking-widest mb-1.5">
                    Site URL *
                  </label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="e.g. https://sportpesa.co.zw/"
                    required
                    className="w-full bg-cyber-muted/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-white/40 font-mono uppercase tracking-widest mb-2">
                  Initial Mode
                </label>
                <div className="flex gap-2">
                  {(['mock', 'manual'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewMode(m)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all capitalize ${
                        newMode === m
                          ? modeStyle[m] + ' bg-white/5'
                          : 'border-white/10 text-white/30 hover:text-white/60'
                      }`}
                    >
                      {m === 'mock' ? '🤖 Mock (simulated)' : '✏️ Manual (you enter rounds)'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan rounded-lg text-sm font-mono font-bold hover:bg-cyber-cyan/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Site'}
                </button>
                <span className="text-xs text-white/20 font-mono">
                  HTTPS prefix and trailing slash added automatically
                </span>
              </div>
            </form>
          )}

          {/* Mode legend */}
          <div className="flex gap-3 mb-4">
            {[
              { mode: 'mock',   label: 'Mock — AI-simulated rounds' },
              { mode: 'manual', label: 'Manual — you enter rounds' },
              { mode: 'live',   label: 'Live — real connector' },
            ].map(m => (
              <div key={m.mode} className={`flex items-center gap-1.5 text-xs font-mono border px-2 py-1 rounded ${modeStyle[m.mode]} bg-white/2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {m.label}
              </div>
            ))}
          </div>

          {/* Sites list */}
          {loading ? (
            <div className="flex items-center gap-3 text-white/30 font-mono text-sm py-8">
              <div className="w-4 h-4 border border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
              Loading sites...
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map(site => (
                <div
                  key={site.id}
                  className={`glass-card border rounded-xl p-4 transition-all ${
                    site.enabled ? 'border-white/8' : 'border-white/3 opacity-60'
                  }`}
                >
                  {editing === site.id ? (
                    /* ─── Inline edit form ─── */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Site name"
                          className="bg-cyber-muted/60 border border-cyber-cyan/30 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-cyber-cyan/60"
                        />
                        <input
                          value={editUrl}
                          onChange={e => setEditUrl(e.target.value)}
                          placeholder="URL"
                          className={`bg-cyber-muted/60 border rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyber-cyan/60 ${
                            BUILT_IN.includes(site.id)
                              ? 'border-white/10 opacity-50 cursor-not-allowed'
                              : 'border-cyber-cyan/30'
                          }`}
                          disabled={BUILT_IN.includes(site.id)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(site.id)}
                          disabled={saving}
                          className="px-4 py-1.5 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-lg text-xs font-mono hover:bg-cyber-green/20 transition-all disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : '✓ Save'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="px-4 py-1.5 border border-white/10 text-white/40 rounded-lg text-xs font-mono hover:text-white/70 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ─── Display row ─── */
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${site.enabled ? 'bg-cyber-green status-pulse' : 'bg-white/15'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                              {site.name}
                            </span>
                            {BUILT_IN.includes(site.id) && (
                              <span className="text-xs text-white/20 font-mono border border-white/10 px-1.5 py-0.5 rounded">built-in</span>
                            )}
                          </div>
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyber-cyan/40 hover:text-cyber-cyan/70 font-mono truncate block transition-colors"
                          >
                            {site.url} ↗
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Mode toggle */}
                        <button
                          onClick={() => handleToggleMode(site.id, site.mode)}
                          title="Click to cycle mode: mock → manual → live"
                          className={`text-xs font-mono px-2.5 py-1 rounded border transition-all hover:opacity-80 ${modeStyle[site.mode] || modeStyle.mock}`}
                        >
                          {site.mode?.toUpperCase() || 'MOCK'}
                        </button>

                        {/* Enable/Disable */}
                        <button
                          onClick={() => handleToggleEnabled(site.id, site.enabled)}
                          className={`text-xs font-mono px-2.5 py-1 rounded border transition-all ${
                            site.enabled
                              ? 'border-cyber-green/30 text-cyber-green hover:bg-cyber-red/10 hover:text-cyber-red hover:border-cyber-red/30'
                              : 'border-white/15 text-white/30 hover:bg-cyber-green/10 hover:text-cyber-green hover:border-cyber-green/30'
                          }`}
                          title={site.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          {site.enabled ? 'ENABLED' : 'DISABLED'}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => { setEditing(site.id); setEditName(site.name); setEditUrl(site.url) }}
                          className="text-xs font-mono px-2.5 py-1 rounded border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all"
                        >
                          Edit
                        </button>

                        {/* Delete (custom only) */}
                        {!BUILT_IN.includes(site.id) && (
                          <button
                            onClick={() => handleDelete(site.id, site.name)}
                            className="text-xs font-mono px-2.5 py-1 rounded border border-cyber-red/20 text-cyber-red/50 hover:text-cyber-red hover:border-cyber-red/50 hover:bg-cyber-red/5 transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info box */}
          <div className="mt-6 glass-card border border-white/5 rounded-xl p-4 space-y-2">
            <div className="text-xs font-display font-bold text-white/40 uppercase tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
              Mode Reference
            </div>
            <div className="text-xs text-white/30 font-mono space-y-1">
              <div><span className="text-cyber-yellow">MOCK</span> — Signal engine runs on simulated round data. Safe for all sites.</div>
              <div><span className="text-cyber-purple">MANUAL</span> — You type or paste rounds on the signals page. AI analyzes them live.</div>
              <div><span className="text-cyber-green">LIVE</span> — Real WebSocket connector. Requires implementation in connectors/yoursite.ts</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
