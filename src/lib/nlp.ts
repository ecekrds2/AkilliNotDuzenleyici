import { SummaryResult } from '@/types'

const TR_STOPWORDS = new Set([
  'bir','bu','şu','o','ve','ile','de','da','ki','mi','mı','mu','mü',
  'için','ama','fakat','ancak','lakin','çünkü','zira','ise','ya','veya',
  'hem','ne','nasıl','neden','niçin','hangi','her','hiç','çok','az',
  'daha','en','kadar','gibi','göre','karşı','rağmen','beri','bana',
  'sana','ona','bize','size','onlara','ben','sen','biz','siz','onlar',
  'benim','senin','onun','bizim','sizin','onların','bazı','tüm','hep',
  'bile','sadece','yalnızca','artık','hala','henüz','zaten','belki',
  'muhtemelen','sanki','değil','var','yok','olan','olarak','oldu',
  'olur','edilir','edilmiş','edildi','kez','defa','kere','sonra',
  'önce','içinde','dışında','yanında','karşısında','ayrıca','özellikle',
  'genellikle','sıklıkla','bazen','çoğunlukla','ile','den','dan','ten',
  'tan','nin','nın','nun','nün','ya','ye','oysa','halbuki','madem',
  'demek','yani','öyle','böyle','şöyle','nerede','nereye','nereden',
  'kim','kimin','kime','kimi','kendi','kendisi','kendini','hepsi',
  'hiçbiri','birisi','biri','diğer','öteki','aynı','farklı','yeni',
  'eski','büyük','küçük','iyi','kötü','güzel','çirkin','uzun','kısa',
  'hızlı','yavaş','kolay','zor','ilk','son','çeşitli','pek','epey',
  'gayet','oldukça','başka','bunun','şunun','onun','bunlar','şunlar',
  'onlar','bunları','şunları','bunu','şunu','buna','şuna','birlikte'
])

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
  'consequently','accordingly','thus','hence','indeed','certainly'
])

export function detectLanguage(text: string): 'tr' | 'en' {
  const trChars = (text.match(/[çğışöüÇĞİŞÖÜ]/g) || []).length
  const totalChars = text.replace(/\s/g, '').length
  if (totalChars === 0) return 'tr'
  return trChars / totalChars > 0.015 ? 'tr' : 'en'
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+([A-ZÇĞİŞÖÜA-Z])/g, '$1\n$2')
    .split('\n')
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length > 15 && s.split(' ').length >= 4)
}

function tokenizeWords(text: string, stopwords: Set<string>): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sçğışöüÇĞİŞÖÜ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w) && !/^\d+$/.test(w))
}

function computeTF(words: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1)
  const max = Math.max(...freq.values(), 1)
  freq.forEach((v, k) => freq.set(k, v / max))
  return freq
}

function scoreSentence(sentence: string, tf: Map<string, number>, stopwords: Set<string>, index: number, total: number): number {
  const words = tokenizeWords(sentence, stopwords)
  if (words.length === 0) return 0

  const tfScore = words.reduce((sum, w) => sum + (tf.get(w) || 0), 0) / words.length

  let positionBonus = 0
  const relPos = index / total
  if (relPos < 0.15) positionBonus = 0.4 
  else if (relPos > 0.85) positionBonus = 0.2

  const wordCount = sentence.split(' ').length
  const lengthBonus = wordCount >= 8 && wordCount <= 25 ? 0.1 : -0.1
  const hasNumbers = /\d/.test(sentence) ? 0.1 : 0

  return tfScore + positionBonus + lengthBonus + hasNumbers
}

function buildShortSummary(scored: Array<{ sentence: string; score: number; index: number }>): string {
  // En onemli 3 cumleyi butun halde al, kesme yapma
  const top = scored
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(s => {
      let txt = s.sentence
      if (!txt.endsWith('.') && !txt.endsWith('!') && !txt.endsWith('?')) txt += '.'
      return txt
    })

  return top.join(' ')
}

function generateQuestions(
  tf: Map<string, number>,
  scored: Array<{ sentence: string; score: number; index: number }>,
  lang: string
): { question: string, answer: string }[] {
  // En yuksek skorlu ve anlamli uzunluktaki cumleleri al
  const topSentences = scored
    .filter(s => s.sentence.split(' ').length > 10)
    .slice(0, 5)

  const questions: { question: string, answer: string }[] = []
  
  for (const s of topSentences) {
    let question = ''
    const txt = s.sentence.toLowerCase()
    
    if (lang === 'tr') {
      if (txt.includes('için') || txt.includes('nedeniyle')) question = 'Bu durumun temel sebebi veya amacı nedir?'
      else if (txt.includes('önemli') || txt.includes('kilit')) question = 'Bu konudaki en önemli vurgu nedir?'
      else question = 'Metindeki bu önemli gelişme neyi açıklamaktadır?'
    } else {
      if (txt.includes('because') || txt.includes('due to')) question = 'What is the main cause or reason mentioned here?'
      else if (txt.includes('important') || txt.includes('key')) question = 'What is the key point emphasized in this section?'
      else question = 'What insight does this part of the text provide?'
    }

    questions.push({
      question,
      answer: s.sentence
    })
  }

  return questions
}

export function summarizeOffline(text: string): SummaryResult {
  const lang = detectLanguage(text)
  const stopwords = lang === 'tr' ? TR_STOPWORDS : EN_STOPWORDS

  const sentences = splitSentences(text)
  const allWords = tokenizeWords(text, stopwords)
  const tf = computeTF(allWords)

  if (sentences.length === 0 || allWords.length < 5) {
    const fallback = text.slice(0, 250)
    return {
      shortSummary: fallback,
      bulletPoints: [fallback],
      keywords: [],
      questions: [],
      language: lang,
      method: 'offline',
    }
  }

  const scored = sentences
    .map((sentence, i) => ({
      sentence,
      score: scoreSentence(sentence, tf, stopwords, i, sentences.length),
      index: i,
    }))
    .sort((a, b) => b.score - a.score)

  const shortSummary = buildShortSummary(scored)

  // Bullet limitini 15'e cikar (eskiden 5'ti)
  const bulletCount = Math.min(15, Math.ceil(sentences.length * 0.5))
  const bulletPoints = scored
    .slice(0, bulletCount)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence)

  const questions = generateQuestions(tf, scored, lang)

  return { shortSummary, bulletPoints, keywords: [], questions, language: lang, method: 'offline' }
}
