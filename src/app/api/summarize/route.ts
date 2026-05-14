import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { summarize } from '@/lib/huggingface'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { text } = await req.json()
    if (!text || text.trim().length < 20) return NextResponse.json({ error: 'Metin cok kisa' }, { status: 400 })
    const result = await summarize(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Ozet olusturulamadi' }, { status: 500 })
  }
}