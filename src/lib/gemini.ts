import Groq from 'groq-sdk'
import { SummaryResult } from '@/types'

export async function summarizeWithGemini(text: string, courseName?: string): Promise<SummaryResult | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey || apiKey.trim() === '') return null

  try {
    const groq = new Groq({ apiKey })

    const courseContext = courseName ? `Bu not "${courseName}" dersine aittir. Analizleri ve soruları bu dersin akademik veya profesyonel bağlamına uygun olarak hazırla.` : ''

    const prompt = `
      Aşağıdaki metni analiz et ve KESİNLİKLE GEÇERLİ BİR JSON nesnesi (object) döndür.
      ${courseContext}
      
      KRİTİK KURALLAR:
      1. ÖZETLER: Metni üç farklı uzunlukta özetle. BU ÜÇ ÖZET KESİNLİKLE BİRBİRİNDEN FARKLI VE FARKLI UZUNLUKTA OLMALIDIR. Aynı metni kopyalama.
         - shortSummary: En temel fikri veren çok kısa 1-2 cümle.
         - mediumSummary: Ana başlıkları ve sonuçları kapsayan 1-2 paragraf.
         - detailedSummary: Metnin tüm önemli noktalarını, argümanlarını ve detaylarını kapsayan çok detaylı ve uzun bir özet.
      2. MADDELER (bulletPoints): Metindeki önemli detayları SINIR OLMADAN, gerekiyorsa 15-20 maddelik uzun bir liste olarak çıkar. Tüm önemli noktaları al.
      3. SORU-CEVAP (questions): Metnin İÇERİĞİYLE DOĞRUDAN İLGİLİ, spesifik ve özellikle sınavda çıkabilecek zorlukta 5-7 adet soru ve detaylı cevap üret. 
      4. FLASHCARDS: Öğrenmeyi ve ezberlemeyi kolaylaştırmak için, ön yüzünde kavram/soru, arka yüzünde açıklama/cevap olan EN AZ 10 ADET bilgi kartı üret.
      5. SINAV SORULARI: Metni test etmek için çoktan seçmeli (A, B, C, D) TAM OLARAK 10 ADET zorlayıcı sınav sorusu hazırla. Doğru cevabı ve neden o cevabın doğru olduğunu (explanation) ekle.
      6. FORMAT: Sadece ve sadece JSON döndür. Markdown blokları (\`\`\`json) KULLANMA.
      7. VURGULAMALAR (highlights): İçerikte çok önemli olan kelimeleri veya çok kritik kısa cümleleri fosforlu kalemle çizmek için "highlights" adında bir liste döndür.
      
      JSON YAPISI:
      {
        "shortSummary": "...",
        "mediumSummary": "...",
        "detailedSummary": "...",
        "bulletPoints": ["...", "..."],
        "highlights": ["özel kelime", "kısa kritik cümle"],
        "questions": [{"question": "Konuya özel zor bir soru", "answer": "Metne dayalı açıklayıcı cevap"}],
        "flashcards": [{"front": "Kavram/Soru", "back": "Açıklama/Cevap"}],
        "examQuestions": [
          {
            "question": "Soru metni",
            "options": ["A) Seçenek", "B) Seçenek", "C) Seçenek", "D) Seçenek"],
            "answer": "Doğru Seçenek (A, B, C veya D)",
            "explanation": "Neden bu cevap doğru?"
          }
        ],
        "language": "tr"
      }

      METİN:
      ${text.slice(0, 20000)}
    `

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Sen profesyonel bir metin analistisin. Görevin, verilen metinleri en ince ayrıntısına kadar inceleyip akademik düzeyde özet ve sorular üretmektir. Yalnızca geçerli bir JSON objesi döndür.' 
        },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const rawText = completion.choices[0]?.message?.content || '{}'
    
    // JSON parse
    const data = JSON.parse(rawText)
    
    return {
      shortSummary: data.shortSummary || '',
      mediumSummary: data.mediumSummary || data.shortSummary || '',
      detailedSummary: data.detailedSummary || data.shortSummary || '',
      bulletPoints: data.bulletPoints || [],
      highlights: data.highlights || [],
      questions: data.questions || [],
      flashcards: data.flashcards || [],
      examQuestions: data.examQuestions || [],
      language: data.language || 'tr',
      method: 'groq'
    }
  } catch (error) {
    console.error('Groq API Error:', error)
    return null
  }
}
