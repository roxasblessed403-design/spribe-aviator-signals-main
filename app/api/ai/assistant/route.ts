import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { isOpenAIAvailable } from '@/lib/openai'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value || req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isOpenAIAvailable()) {
    return NextResponse.json({ reply: 'AI assistant requires OPENAI_API_KEY in .env.local.', aiEnabled: false })
  }

  const { question } = await req.json()
  if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 })

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for the Lisconvastag Aviator Signals platform. You help admins understand signal logic, round patterns, and platform configuration. Be concise and factual. Never claim to predict future game outcomes.',
        },
        { role: 'user', content: question },
      ],
    })
    return NextResponse.json({ reply: response.choices[0]?.message?.content || 'No response.', aiEnabled: true })
  } catch {
    return NextResponse.json({ reply: 'AI assistant temporarily unavailable.', aiEnabled: true })
  }
}
