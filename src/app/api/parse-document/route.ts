import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadi' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      text = data.text
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'Sadece PDF ve DOCX desteklenir' }, { status: 400 })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('File parse error:', error)
    return NextResponse.json({ error: 'Dosya okunurken bir hata olustu' }, { status: 500 })
  }
}
