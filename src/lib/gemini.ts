import { GoogleGenerativeAI } from '@google/generative-ai'
import { SummaryResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: 'Sen profesyonel bir metin analistisin. Görevin, verilen metinleri en ince ayrıntısına kadar inceleyip, okuyucunun konuyu kavramasını sağlayacak akademik düzeyde özet ve sorular üretmektir.'
    })

    const prompt = `
      Aşağıdaki metni analiz et ve kesinlikle JSON formatında bir yanıt döndür.
      
      KRİTİK KURALLAR:
      1. SORULAR: Kesinlikle "X nedir?" veya tırnak içinde kelime seçerek soru sorma. Bu çok basit kalıyor. 
         Bunun yerine; metindeki fikirleri çarpıştır, "Neden?", "Nasıl?" ve "Sonuç ne olur?" odaklı, 
         metnin derinliğini sorgulayan 3-5 adet kaliteli soru ve detaylı cevap üret.
      2. ÖZET: Metni sadece kısaltma, ana fikri ve yazarın niyetini 2-3 güçlü cümleyle açıkla.
      3. FORMAT: Sadece JSON döndür. Başka hiçbir açıklama yazma.
      
      JSON YAPISI:
      {
        "shortSummary": "...",
        "bulletPoints": ["...", "..."],
        "keywords": ["...", "..."],
        "questions": [
          {"question": "Derinlemesine analiz sorusu", "answer": "Metne dayalı kapsamlı cevap"}
        ],
        "language": "tr"
      }

      METİN:
      ${text.slice(0, 20000)}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text()
    
    // JSON ayıklama: İlk { ve son } arasındaki her şeyi al
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('AI geçerli bir JSON üretmedi')
    
    const jsonText = rawText.substring(start, end + 1)
    const data = JSON.parse(jsonText)
    
    return {
      shortSummary: data.shortSummary,
      bulletPoints: data.bulletPoints,
      keywords: data.keywords,
      questions: data.questions,
      language: data.language || 'tr',
      method: 'gemini'
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return null
  }
}
