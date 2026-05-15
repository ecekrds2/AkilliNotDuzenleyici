import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  
  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id

  try {
    const { name, color } = await req.json()
    if (!name) return NextResponse.json({ error: 'Ders adi zorunludur' }, { status: 400 })
    
    // Check if exists
    const existing = await prisma.course.findFirst({
      where: { userId, name: { equals: name, mode: 'insensitive' } }
    })
    if (existing) return NextResponse.json(existing)

    const course = await prisma.course.create({
      data: { name, color: color || 'indigo', userId }
    })
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Ders olusturulamadi' }, { status: 500 })
  }
}
