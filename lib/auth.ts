import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-me'
)

// =============================================
// CLIENT ACCESS KEYS — edit in .env.local
// CLIENT_ACCESS_KEYS=KEY1,KEY2,KEY3
// =============================================

export function getClientAccessKeys(): string[] {
  const raw = process.env.CLIENT_ACCESS_KEYS || 'SIGNAL2024'
  return raw.split(',').map((k) => k.trim()).filter(Boolean)
}

export function validateClientKey(key: string): boolean {
  const keys = getClientAccessKeys()
  return keys.includes(key.toUpperCase().trim())
}

// =============================================
// ADMIN PASSWORD — edit ADMIN_PASSWORD in .env.local
// =============================================
export function validateAdminPassword(password: string): boolean {
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123'
  return password === adminPass
}

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn = '8h'
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}

export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export function getTokenFromCookies(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/)
  return match ? match[1] : null
}
