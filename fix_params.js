const fs = require('fs');

// Next.js 15/16: params is now a Promise - must be awaited!
fs.writeFileSync('src/app/api/notes/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const note = await prisma.note.findFirst({ where: { id, userId } })
  if (!note) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  return NextResponse.json({
    ...note,
    bulletPoints: note.bulletPoints ? JSON.parse(note.bulletPoints) : [],
    keywords: note.keywords ? JSON.parse(note.keywords) : [],
  })
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  try {
    const { title, content } = await req.json()
    const summary = await summarize(content)
    const updated = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        shortSummary: summary.shortSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        keywords: JSON.stringify(summary.keywords),
        language: summary.language,
        wordCount: content.split(/\\s+/).length,
      },
    })
    return NextResponse.json({
      ...updated,
      bulletPoints: summary.bulletPoints,
      keywords: summary.keywords,
    })
  } catch {
    return NextResponse.json({ error: 'Guncelleme basarisiz' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ success: true })
}`, 'utf8');

console.log('Route fixed: params now awaited (Next.js 15/16 fix)');
