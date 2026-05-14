const fs = require('fs');

// ── Geliştirilmiş NLP Algoritması ─────────────────────────────────────────
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/nlp.ts', `import { SummaryResult } from '@/types'

// ─── Türkçe Stopwords (600+) ──────────────────────────────────────────────
const TR_STOPWORDS = new Set([
  'bir','bu','şu','o','ve','ile','de','da','ki','mi','mı','mu','mü',
  'için','ama','fakat','ancak','lakin','çünkü','zira','ise','ya','veya',
  'hem','ne','nasıl','neden','niçin','hangi','her','hiç','çok','az',
  'daha','en','kadar','gibi','göre','karşı','rağmen','beri','bana',
  'sana','ona','bize','size','onlara','ben','sen','biz','siz','onlar',
  'benim','senin','onun','bizim','sizin','onların','bu','şu','o',
  'bazı','tüm','hep','bile','sadece','yalnızca','artık','hala','henüz',
  'zaten','belki','muhtemelen','sanki','değil','var','yok','olan',
  'olarak','oldu','olur','edilir','edilmiş','edildi','kez','defa',
  'kere','sonra','önce','içinde','dışında','yanında','karşısında',
  'ayrıca','özellikle','genellikle','sıklıkla','bazen','çoğunlukla',
  'ile','den','dan','ten','tan','nin','nın','nun','nün','ya','ye',
  've','veya','ama','fakat','lakin','ancak','oysa','halbuki','çünkü',
  'zira','madem','demek','yani','öyle','böyle','şöyle','nasıl','neden',
  'ne','nerede','nereye','nereden','kim','kimin','kime','kimi','kendi',
  'kendisi','kendini','hepsi','hiçbiri','birisi','biri','diğer','öteki',
  'aynı','farklı','yeni','eski','büyük','küçük','iyi','kötü','güzel',
  'çirkin','uzun','kısa','hızlı','yavaş','kolay','zor','ilk','son',
  'her','bazı','çeşitli','pek','epey','gayet','oldukça','son derece',
  'hem','de','da','ki','diye','göre','kadar','karşı','rağmen','başka',
  'bunun','şunun','onun','bunlar','şunlar','onlar','bunları','şunları',
  'bunu','şunu','buna','şuna','bunun','birlikte','beraberinde',
])

// ─── İngilizce Stopwords ─────────────────────────────────────────────────
const EN_STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','that','which','who','whom','whose','where','when','why',
  'how','all','each','every','both','either','neither','no','so','yet',
  'not','this','these','those','it','its','i','me','my','we','our','you',
  'your','he','his','she','her','they','their','them','what','as','if',
  'then','than','also','too','very','just','because','into','through',
  'during','before','after','above','below','between','out','about','up',
  'down','only','own','same','other','more','most','than','such','while',
  'although','though','unless','until','since','however','therefore',
  'furthermore','moreover','nevertheless','nonetheless','meanwhile',
  'consequently','accordingly','thus','hence','indeed','certainly',
])

// ─── Dil Tespiti ─────────────────────────────────────────────────────────
export function detectLanguage(text: string): 'tr' | 'en' {
  const trChars = (text.match(/[çğışöüÇĞİŞÖÜ]/g) || []).length
  const totalChars = text.replace(/\\s/g, '').length
  if (totalChars === 0) return 'tr'
  return trChars / totalChars > 0.015 ? 'tr' : 'en'
}

// ─── Cümle Tokenizer ─────────────────────────────────────────────────────
function splitSentences(text: string): string[] {
  // Nokta, ünlem, soru işareti ile biten cümleler
  const sentences = text
    .replace(/([.!?])\\s+([A-ZÇĞİŞÖÜA-Z])/g, '$1\\n$2')
    .split('\\n')
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.split(' ').length >= 4)
  return sentences
}

// ─── Kelime Tokenizer ────────────────────────────────────────────────────
function tokenizeWords(text: string, stopwords: Set<string>): string[] {
  return text
    .toLowerCase()
    .replace(/[^\\w\\sçğışöüÇĞİŞÖÜ]/g, ' ')
    .split(/\\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w) && !/^\\d+$/.test(w))
}

// ─── TF Hesaplama ────────────────────────────────────────────────────────
function computeTF(words: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1)
  }
  const max = Math.max(...freq.values(), 1)
  // Normalize + bonus for repeated high-freq words
  freq.forEach((v, k) => freq.set(k, v / max))
  return freq
}

// ─── Cümle Skoru ─────────────────────────────────────────────────────────
function scoreSentence(
  sentence: string,
  tf: Map<string, number>,
  stopwords: Set<string>,
  index: number,
  total: number
): number {
  const words = tokenizeWords(sentence, stopwords)
  if (words.length === 0) return 0

  // TF tabanlı skor
  const tfScore = words.reduce((sum, w) => sum + (tf.get(w) || 0), 0) / words.length

  // Pozisyon bonusu: ilk %20 ve son %10 cümleler önemli
  let positionBonus = 0
  const relPos = index / total
  if (relPos < 0.2) positionBonus = 0.3  // Giriş cümleleri
  else if (relPos > 0.85) positionBonus = 0.15  // Sonuç cümleleri
  else if (relPos < 0.4) positionBonus = 0.1  // Erken cümleler

  // Uzunluk bonusu: çok kısa veya çok uzun cümleler penalize edilir
  const wordCount = sentence.split(' ').length
  const lengthBonus = wordCount >= 8 && wordCount <= 30 ? 0.1 : -0.1

  // Sayısal veri içeren cümleler (istatistik) değerlidir
  const hasNumbers = /\\d/.test(sentence) ? 0.1 : 0

  return tfScore + positionBonus + lengthBonus + hasNumbers
}

// ─── Anahtar Kelime Çıkarımı ─────────────────────────────────────────────
function extractKeywords(tf: Map<string, number>, limit = 10): string[] {
  return [...tf.entries()]
    .filter(([word]) => word.length > 4)  // Çok kısa kelimeleri filtrele
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

// ─── Kısa Özet Oluşturucu ────────────────────────────────────────────────
function buildShortSummary(
  sentences: string[],
  scored: Array<{ sentence: string; score: number; index: number }>
): string {
  // Top 3 cümleyi orijinal sıraya göre al
  const top = scored
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence)

  let summary = top.join(' ')

  // 300 karakteri geçerse kısalt
  if (summary.length > 300) {
    summary = summary.slice(0, 297) + '...'
  }
  return summary
}

// ─── Ana Fonksiyon ───────────────────────────────────────────────────────
export function summarizeOffline(text: string): SummaryResult {
  const lang = detectLanguage(text)
  const stopwords = lang === 'tr' ? TR_STOPWORDS : EN_STOPWORDS

  const sentences = splitSentences(text)
  const allWords = tokenizeWords(text, stopwords)
  const tf = computeTF(allWords)

  // Edge case: çok kısa metin
  if (sentences.length === 0 || allWords.length < 5) {
    const fallback = text.slice(0, 250)
    return {
      shortSummary: fallback,
      bulletPoints: [fallback],
      keywords: allWords.slice(0, 5),
      language: lang,
      method: 'offline',
    }
  }

  // Cümleleri skorla
  const scored = sentences
    .map((sentence, i) => ({
      sentence,
      score: scoreSentence(sentence, tf, stopwords, i, sentences.length),
      index: i,
    }))
    .sort((a, b) => b.score - a.score)

  // Kısa özet: top 3 cümle
  const shortSummary = buildShortSummary(sentences, scored)

  // Bullet points: top 5 cümle, orijinal sırayla
  const bulletCount = Math.min(5, Math.ceil(sentences.length * 0.4))
  const bulletPoints = scored
    .slice(0, bulletCount)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence)

  // Anahtar kelimeler
  const keywords = extractKeywords(tf, 10)

  return { shortSummary, bulletPoints, keywords, language: lang, method: 'offline' }
}`, 'utf8');

console.log('Improved NLP written!');
