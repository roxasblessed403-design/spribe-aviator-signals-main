'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DEFAULT_SIGNAL_RULE } from '@/config/signals'

export default function AdminSignalsPage() {
  const [rule, setRule] = useState({ ...DEFAULT_SIGNAL_RULE })
  const [saved, setSaved] = useState(false)

  function handleChange(field: string, value: string) {
    setRule(prev => ({ ...prev, [field]: parseFloat(value) || value }))
  }

  function handleSave() {
    // In production: save to DB or config file
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex">
      <aside className="w-56 border-r border-white/5 bg-cyber-card/50 p-3 sticky top-0 h-screen">
        <div className="p-2 mb-4">
          <div className="font-display text-sm font-black text-cyber-cyan tracking-wider">LISCONVASTAG</div>
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
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="font-display text-xl font-black text-white tracking-wider">Signal Rules</h1>
            <p className="text-white/30 text-sm font-mono mt-1">Configure thresholds and signal logic</p>
          </div>

          <div className="text-xs text-cyber-cyan/50 font-mono border border-cyber-cyan/10 bg-cyber-cyan/5 rounded-lg px-4 py-3 mb-5">
            ℹ To permanently save rule changes, edit <span className="text-cyber-cyan">config/signals.ts</span> directly.
            This UI preview shows what the engine uses — runtime changes reset on restart.
          </div>

          <div className="glass-card border border-white/5 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Low Threshold', field: 'lowThreshold', desc: 'Below = low multiplier' },
                { label: 'Mid Threshold', field: 'midThreshold', desc: 'Above = watch zone' },
                { label: 'High Threshold', field: 'highThreshold', desc: 'Above = high risk zone' },
                { label: 'Low Streak Count', field: 'streakLowCount', desc: 'Consecutive lows = safe signal' },
                { label: 'High Streak Count', field: 'streakHighCount', desc: 'Consecutive highs = risk signal' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs text-white/40 font-mono uppercase tracking-widest mb-1">{f.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(rule as any)[f.field]}
                    onChange={e => handleChange(f.field, e.target.value)}
                    className="w-full bg-cyber-muted/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyber-cyan/40 transition-all"
                  />
                  <div className="text-xs text-white/20 font-mono mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="font-display text-xs text-white/40 uppercase tracking-widest mb-3">Signal Output Labels</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center border border-cyber-green/20 bg-cyber-green/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 font-mono mb-1">Safe</div>
                  <div className="text-cyber-green font-mono text-sm">{rule.safeRange}</div>
                </div>
                <div className="text-center border border-cyber-yellow/20 bg-cyber-yellow/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 font-mono mb-1">Watch</div>
                  <div className="text-cyber-yellow font-mono text-sm">{rule.watchRange}</div>
                </div>
                <div className="text-center border border-cyber-red/20 bg-cyber-red/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 font-mono mb-1">High Risk</div>
                  <div className="text-cyber-red font-mono text-sm">{rule.highRiskRange}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full rounded-lg py-3 font-display font-black text-sm tracking-widest uppercase transition-all ${saved ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/30' : 'bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/20'}`}
            >
              {saved ? '✓ Saved (Runtime Only)' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
