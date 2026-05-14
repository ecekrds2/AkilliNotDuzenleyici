import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API Key eksik' }, { status: 500 })

  try {
    const groq = new Groq({ apiKey })
    const { message, context } = await req.json()
    if (!message || !context) return NextResponse.json({ error: 'Message and context required' }, { status: 400 })

    const prompt = `
      Kullanıcının Notu (Bağlam):
      """
      ${context.slice(0, 20000)}
      """

      Kullanıcının Sorusu: ${message}
    `

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Sen, kullanıcının yüklediği bir nota (metne) dayalı olarak soruları yanıtlayan profesyonel bir asistansın. Sadece verilen nota göre cevap ver. Eğer sorunun cevabı notta yoksa, "Bu bilgi notta yer almıyor" şeklinde belirt.' 
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    })

    const answer = completion.choices[0]?.message?.content || ''
    
    if (!answer) throw new Error('Bos cevap dondu')
    
    return NextResponse.json({ answer })
  } catch (error: any) {
    console.error('Groq Chat API Error:', error.message || error)
    return NextResponse.json({ error: 'Cevap üretilemedi', details: error.message }, { status: 500 })
  }
}
