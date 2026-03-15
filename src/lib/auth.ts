import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = '7log_session'

export interface SessionUser {
  id: string
  username: string
  role: 'admin' | 'member'
  memberId?: string
  name?: string
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME
