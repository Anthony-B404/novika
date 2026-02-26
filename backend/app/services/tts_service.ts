import env from '#start/env'
import type { ServerResponse } from 'node:http'

const INWORLD_TTS_URL = 'https://api.inworld.ai/tts/v1/voice:stream'

export default class TtsService {
  private apiKey: string

  constructor() {
    this.apiKey = env.get('INWORLD_API_KEY')
  }

  /**
   * Strip markdown formatting from text, keeping only plain text.
   */
  stripMarkdown(text: string): string {
    return (
      text
        // Unescape backslash-escaped markdown characters (\### → ###, \- → -, etc.)
        .replace(/\\([#*_\-\[\]()>~`!|])/g, '$1')
        // Remove code blocks (```...```)
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code (`...`)
        .replace(/`([^`]+)`/g, '$1')
        // Remove images ![alt](url)
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove links [text](url) → keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove headers (# ## ### etc.)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold **text** or __text__
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        // Remove italic *text* or _text_
        .replace(/(\*|_)(.*?)\1/g, '$2')
        // Remove strikethrough ~~text~~
        .replace(/~~(.*?)~~/g, '$1')
        // Remove blockquotes (> ...)
        .replace(/^>\s+/gm, '')
        // Remove unordered list markers (- * +)
        .replace(/^[\s]*[-*+]\s+/gm, '')
        // Remove ordered list markers (1. 2. etc.)
        .replace(/^[\s]*\d+\.\s+/gm, '')
        // Remove horizontal rules (--- *** ___)
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, '')
        // Collapse multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    )
  }

  /**
   * Split text into chunks that fit within the Inworld character limit.
   * Uses a multi-level splitting strategy to preserve natural speech flow:
   * 1. Paragraph boundaries (double newlines)
   * 2. French-aware sentence boundaries (handles abbreviations, guillemets, ellipsis)
   * 3. Comma/semicolon/colon boundaries
   * 4. Word boundaries (final fallback)
   */
  splitIntoChunks(text: string, maxChars = 1900): string[] {
    if (text.length <= maxChars) {
      return [text]
    }

    // Level 1: Split on paragraph boundaries
    const paragraphs = text.split(/\n\n+/)
    const chunks: string[] = []

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim()
      if (!trimmed) continue
      this.addTextToChunks(trimmed, chunks, maxChars)
    }

    return chunks
  }

  /**
   * Add text to chunks array, splitting on sentence boundaries if needed.
   */
  private addTextToChunks(text: string, chunks: string[], maxChars: number): void {
    if (!text) return

    // If the last chunk can absorb this text, merge them
    if (chunks.length > 0) {
      const merged = `${chunks[chunks.length - 1]} ${text}`
      if (merged.length <= maxChars) {
        chunks[chunks.length - 1] = merged
        return
      }
    }

    if (text.length <= maxChars) {
      chunks.push(text)
      return
    }

    // Level 2: Split on sentence boundaries (French-aware)
    const sentences = this.splitIntoSentences(text)
    if (sentences.length > 1) {
      for (const sentence of sentences) {
        this.addTextToChunks(sentence, chunks, maxChars)
      }
      return
    }

    // Level 3: Split on comma/semicolon/colon boundaries
    const clauses = text.split(/(?<=[,;:])\s+/)
    if (clauses.length > 1) {
      for (const clause of clauses) {
        this.addTextToChunks(clause, chunks, maxChars)
      }
      return
    }

    // Level 4: Word boundary fallback
    this.splitOnWordBoundary(text, chunks, maxChars)
  }

  /**
   * Split text into sentences using French-aware rules.
   * Avoids splitting on common abbreviations (M., Dr., etc.) and decimal numbers.
   */
  private splitIntoSentences(text: string): string[] {
    // Match sentence-ending punctuation: . ! ? » …
    // But NOT abbreviations like M. Dr. etc. or decimals like 1.5
    // Strategy: split on punctuation followed by whitespace and an uppercase letter or quote
    const sentenceEndPattern =
      /(?<!\b(?:M|Dr|Pr|Me|Mme|Mlle|Jr|Sr|St|etc|vol|fig|p|ch|art|no|réf|cf|approx|env|min|max|ex))(?<!\d)([.!?…»])\s+(?=[A-ZÀ-ÖØ-Þ«"\d-])/g

    const sentences: string[] = []
    let lastIndex = 0

    for (const match of text.matchAll(sentenceEndPattern)) {
      const endIndex = match.index! + match[0].indexOf(match[1]) + match[1].length
      sentences.push(text.slice(lastIndex, endIndex).trim())
      lastIndex = endIndex
      // Skip the whitespace
      while (lastIndex < text.length && /\s/.test(text[lastIndex])) {
        lastIndex++
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).trim()
      if (remaining) sentences.push(remaining)
    }

    return sentences.length > 0 ? sentences : [text]
  }

  /**
   * Split text on word boundaries as a last resort.
   */
  private splitOnWordBoundary(text: string, chunks: string[], maxChars: number): void {
    const words = text.split(/\s+/)
    let current = ''

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (candidate.length > maxChars) {
        if (current) chunks.push(current)
        // If a single word exceeds maxChars, push it as-is (shouldn't happen)
        current = word
      } else {
        current = candidate
      }
    }

    if (current) {
      chunks.push(current)
    }
  }

  /**
   * Stream a single text chunk from Inworld directly to the HTTP response.
   * Audio bytes are written as they arrive to keep the connection alive
   * and avoid timeout gaps between chunks.
   * Returns false if the client disconnected mid-stream.
   */
  private async streamChunkToResponse(
    text: string,
    res: ServerResponse,
    voiceId: string
  ): Promise<boolean> {
    const response = await fetch(INWORLD_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.apiKey}`,
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        audio_config: {
          audio_encoding: 'MP3',
          speaking_rate: 1.25,
        },
        temperature: 1.15,
        model_id: 'inworld-tts-1.5-mini',
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      throw new Error(`Inworld TTS API error (${response.status}): ${errorBody}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let jsonBuffer = ''
    let totalAudioBytes = 0

    while (true) {
      if (res.destroyed) {
        console.log('[TTS]   Client disconnected, cancelling Inworld stream')
        await reader.cancel()
        return false
      }

      const { value, done } = await reader.read()
      if (done) break

      jsonBuffer += decoder.decode(value, { stream: true })

      // Process complete lines
      const lines = jsonBuffer.split('\n')
      jsonBuffer = lines.pop()! // Keep incomplete last line

      for (const line of lines) {
        if (res.destroyed) {
          await reader.cancel()
          return false
        }
        const audio = this.extractAudioFromLine(line)
        if (audio) {
          totalAudioBytes += audio.length
          res.write(audio)
        }
      }
    }

    // Process remaining buffer
    if (jsonBuffer.trim() && !res.destroyed) {
      const audio = this.extractAudioFromLine(jsonBuffer)
      if (audio) {
        totalAudioBytes += audio.length
        res.write(audio)
      }
    }

    console.log(`[TTS]   → Inworld returned ${totalAudioBytes} audio bytes`)
    return true
  }

  /**
   * Parse a JSON line and extract decoded audio bytes.
   */
  private extractAudioFromLine(line: string): Buffer | null {
    const trimmed = line.trim()
    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed)
      const audioData = parsed.result?.audioContent || parsed.audioContent || parsed.audio
      if (audioData) {
        return Buffer.from(audioData, 'base64')
      }
    } catch {
      // Skip non-JSON lines
    }

    return null
  }

  /**
   * Stream TTS audio directly to the HTTP response.
   * Processes text chunks sequentially so audio plays in order.
   * If a single chunk fails, logs the error and continues with remaining chunks.
   * Returns the total number of characters sent to Inworld for billing.
   */
  async streamSpeech(
    text: string,
    res: ServerResponse,
    voiceId = 'Alain'
  ): Promise<{ totalChars: number }> {
    const chunks = this.splitIntoChunks(text)
    let totalChars = 0

    console.log(`[TTS] ${chunks.length} chunk(s), total ${text.length} chars`)

    for (let i = 0; i < chunks.length; i++) {
      if (res.destroyed) {
        console.log(`[TTS] Client disconnected, stopping at chunk ${i + 1}/${chunks.length}`)
        break
      }

      try {
        // Collapse newlines to spaces for clean TTS input
        const cleanChunk = chunks[i].replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim()
        if (!cleanChunk) continue
        console.log(`[TTS] Chunk ${i + 1}/${chunks.length}: ${cleanChunk.length} chars — "${cleanChunk.slice(0, 60)}..."`)
        const clientConnected = await this.streamChunkToResponse(cleanChunk, res, voiceId)
        totalChars += cleanChunk.length
        console.log(`[TTS] Chunk ${i + 1}/${chunks.length}: done`)
        if (!clientConnected) {
          console.log(`[TTS] Client disconnected during chunk ${i + 1}, stopping`)
          break
        }
      } catch (error) {
        console.error(`[TTS] Chunk ${i + 1}/${chunks.length} FAILED:`, error)
        // Continue with remaining chunks — don't let one failure kill the stream
      }
    }

    console.log(`[TTS] All chunks processed, ${totalChars} chars billed`)
    return { totalChars }
  }
}
