// =============================================
// OPENAI INTEGRATION
// Configure OPENAI_API_KEY in .env.local
// Leave blank to disable AI features gracefully
// =============================================

import OpenAI from 'openai'
import type { Round, Signal } from '@/lib/types'

let _client: OpenAI | null = null

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}

// ---- Explain why signal is at current level ----
export async function explainSignal(
  signal: Signal,
  rounds: Round[]
): Promise<string> {
  const client = getClient()
  if (!client) return 'AI explanation unavailable (no API key configured).'

  const recentMultipliers = rounds
    .slice(0, 10)
    .map((r) => r.multiplier)
    .join(', ')

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'You are an Aviator signal analyst. Explain signal results in plain English for non-technical users. Be concise (2-3 sentences). Do NOT claim to predict the future. Speak in terms of patterns and statistics only.',
        },
        {
          role: 'user',
          content: `Signal: ${signal.label} | Risk: ${signal.riskLevel} | Confidence: ${signal.confidence}% | Recent multipliers: [${recentMultipliers}]. Explain why this signal was generated.`,
        },
      ],
    })
    return response.choices[0]?.message?.content || 'Unable to generate explanation.'
  } catch {
    return 'AI explanation temporarily unavailable.'
  }
}

// ---- Summarize recent round patterns ----
export async function summarizeRounds(
  rounds: Round[],
  siteName: string
): Promise<string> {
  const client = getClient()
  if (!client) return 'AI summary unavailable.'

  const data = rounds.slice(0, 20).map((r) => r.multiplier).join(', ')

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content:
            'You analyze Aviator game round history and summarize the pattern in plain English. Be factual and neutral. Do NOT promise future outcomes.',
        },
        {
          role: 'user',
          content: `Site: ${siteName}. Last 20 round multipliers: [${data}]. Give a brief 3-sentence summary of the pattern.`,
        },
      ],
    })
    return response.choices[0]?.message?.content || 'Summary unavailable.'
  } catch {
    return 'AI summary temporarily unavailable.'
  }
}

// ---- Admin insight about connector health ----
export async function generateAdminInsight(
  connectorStatuses: Record<string, string>
): Promise<string> {
  const client = getClient()
  if (!client) return 'AI insights unavailable.'

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: 'You are a system health analyst for a signal platform. Describe connector health clearly.',
        },
        {
          role: 'user',
          content: `Connector statuses: ${JSON.stringify(connectorStatuses)}. Give a brief health summary.`,
        },
      ],
    })
    return response.choices[0]?.message?.content || 'No insight available.'
  } catch {
    return 'AI insight temporarily unavailable.'
  }
}
