const fs = require('fs');
const path = require('path');

// ── All remaining files ──────────────────────────────────────────────────

// API: Register
fs.mkdirSync('src/app/api/auth/register', { recursive: true });
fs.writeFileSync('src/app/api/auth/register/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tum alanlar zorunludur' }, { status: 400 })
    }
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Bu email zaten kayitli' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kayit basarisiz' }, { status: 500 })
  }
}`, 'utf8');

// API: NextAuth
fs.mkdirSync('src/app/api/auth/[...nextauth]', { recursive: true });
fs.writeFileSync('src/app/api/auth/[...nextauth]/route.ts', `import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }`, 'utf8');

// API: Notes list
fs.mkdirSync('src/app/api/notes', { recursive: true });
fs.writeFileSync('src/app/api/notes/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes.map(n => ({
    ...n,
    bulletPoints: n.bulletPoints ? JSON.parse(n.bulletPoints) : [],
    keywords: n.keywords ? JSON.parse(n.keywords) : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, content } = await req.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Baslik ve icerik zorunludur' }, { status: 400 })
    }
    const summary = await summarize(content)
    const note = await prisma.note.create({
      data: {
        title, content, userId,
        shortSummary: summary.shortSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        keywords: JSON.stringify(summary.keywords),
        language: summary.language,
        wordCount: content.split(/\\s+/).length,
      },
    })
    return NextResponse.json({
      ...note,
      bulletPoints: summary.bulletPoints,
      keywords: summary.keywords,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not olusturulamadi' }, { status: 500 })
  }
}`, 'utf8');

// API: Notes [id]
fs.mkdirSync('src/app/api/notes/[id]', { recursive: true });
fs.writeFileSync('src/app/api/notes/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const note = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!note) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  return NextResponse.json({
    ...note,
    bulletPoints: note.bulletPoints ? JSON.parse(note.bulletPoints) : [],
    keywords: note.keywords ? JSON.parse(note.keywords) : [],
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  const { title, content } = await req.json()
  const summary = await summarize(content)
  const updated = await prisma.note.update({
    where: { id: params.id },
    data: {
      title, content,
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
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  await prisma.note.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}`, 'utf8');

// API: Summarize
fs.mkdirSync('src/app/api/summarize', { recursive: true });
fs.writeFileSync('src/app/api/summarize/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { summarize } from '@/lib/huggingface'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { text } = await req.json()
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Metin cok kisa' }, { status: 400 })
    }
    const result = await summarize(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Ozet olusturulamadi' }, { status: 500 })
  }
}`, 'utf8');

console.log('All API routes written!');
