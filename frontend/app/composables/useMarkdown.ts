import { marked } from 'marked'
import DOMPurify from 'dompurify'

export function useMarkdown () {
  // Configure marked pour le rendu
  marked.setOptions({
    breaks: true, // Convertir les sauts de ligne en <br>
    gfm: true // GitHub Flavored Markdown
  })

  function renderMarkdown (content: string): string {
    if (!content) { return '' }
    const rawHtml = marked.parse(content) as string
    return DOMPurify.sanitize(rawHtml)
  }

  return {
    renderMarkdown
  }
}
