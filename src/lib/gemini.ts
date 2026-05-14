import { GoogleGenerativeAI } from '@google/generative-ai'
import { SummaryResult } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Aşağıdaki metni derinlemesine analiz et ve şu formatta bir JSON yanıtı döndür. 
      Yanıt kesinlikle sadece geçerli bir JSON olmalı, başka metin içermemeli.
      
      TALİMATLAR:
      - "shortSummary": Metnin ana temasını ve en önemli sonucunu anlatan 2-3 cümlelik akıcı bir özet olsun.
      - "bulletPoints": Metindeki önemli detayları ve alt başlıkları içeren 5-10 maddelik liste.
      - "keywords": Metni tanımlayan en önemli 5-8 kavram.
      - "questions": Metinle ilgili 3-5 adet Soru-Cevap çifti oluştur. 
        ÖNEMLİ: Sorular "Metinde geçen X nedir?" gibi basit kelime bulmaca tarzında olmasın. 
        Bunun yerine; "Y olayının temel sebebi nedir?", "Yazarın Z konusundaki ana argümanı nedir?", 
        "Bu süreç nasıl işlemektedir?" gibi metnin içeriğini ve mantığını sorgulayan, 
        okuyucunun konuyu anlamasını sağlayacak derinlikte sorular olsun.
      - "language": Metnin dili ("tr" veya "en").

      Metin:
      ${text.slice(0, 15000)}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text()
    
    // JSON'ı metin içinden daha güvenli bir şekilde ayıkla (kod blokları olsa da olmasa da)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : rawText
    
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
