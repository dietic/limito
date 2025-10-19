import { NextResponse } from 'next/server'

export function jsonSuccess<T>(data: T, init?: number | ResponseInit) {
  const status = typeof init === 'number' ? init : undefined
  const initObj = typeof init === 'object' ? init : undefined
  return NextResponse.json({ success: true, data }, { status: status ?? 200, ...initObj })
}

export function jsonError(message: string, init: number | ResponseInit = 400) {
  if (typeof init === 'number') {
    return NextResponse.json({ error: true, message }, { status: init })
  }
  const status = (init as ResponseInit).status ?? 400
  const rest = init as ResponseInit
  return NextResponse.json({ error: true, message }, { status, ...rest })
}

