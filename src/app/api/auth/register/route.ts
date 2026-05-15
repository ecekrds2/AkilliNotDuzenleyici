import { NextRequest, NextResponse } from 'next/server'
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
    
    // Varsayılan ana dersleri oluştur
    const defaultCourses = [
      { name: 'Matematik', color: 'blue' },
      { name: 'Fizik', color: 'indigo' },
      { name: 'Kimya', color: 'emerald' },
      { name: 'Biyoloji', color: 'green' },
      { name: 'Tarih', color: 'amber' },
      { name: 'Coğrafya', color: 'orange' },
      { name: 'Edebiyat', color: 'rose' }
    ]
    
    await prisma.course.createMany({
      data: defaultCourses.map(c => ({ ...c, userId: user.id }))
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Kayit basarisiz' }, { status: 500 })
  }
}