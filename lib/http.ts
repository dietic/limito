import { NextResponse } from 'next/server'

export function jsonSuccess<T>(data: T, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? init : undefined
  const initObj = typeof init === 'object' ? init : undefined
  return NextResponse.json({ success: true, data }, { status: status ?? 200, ...initObj })
}

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: true, message }, { status })
}

