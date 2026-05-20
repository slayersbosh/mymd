import MarkdownIt from 'markdown-it';
import { highlightCode } from './highlight';
import { isMermaidCode } from './mermaid';

// Create markdown-it instance with configuration
export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  void options; void env; void self; // suppress unused warnings
  const token = tokens[idx];
  const lang = token.tag; // e.g., "javascript", "mermaid"
  const code = token.content;

  // Check if it's a mermaid diagram
  if (lang === 'mermaid' || (lang === '' && isMermaidCode(code))) {
    // Render as mermaid chart container
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
    return `<div class="mermaid-container" data-mermaid-id="${id}"><pre class="mermaid-source" style="display:none;">${escapeHtml(code)}</pre><div class="mermaid-render" id="${id}" data-mermaid-code="${escapeHtml(code)}"></div></div>`;
  }

  // Regular code block with syntax highlighting
  const highlighted = highlightCode(code.trim(), lang);

  return `<pre class="code-block" data-lang="${lang}"><code class="hljs language-${lang}">${highlighted}</code><button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.querySelector('code').textContent)">复制</button></pre>`;
};

// Custom renderer for inline code
md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
  void options; void env; void self; // suppress unused warnings
  const token = tokens[idx];
  return `<code class="inline-code">${escapeHtml(token.content)}</code>`;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Render markdown to HTML
export function renderMarkdown(content: string): string {
  return md.render(content);
}

// Parse and return tokens (for outline generation)
export function parseMarkdown(content: string) {
  return md.parse(content, {});
}

// Extract headings for outline
export function extractHeadings(content: string): { level: number; text: string; line: number }[] {
  const headings: { level: number; text: string; line: number }[] = [];
  const lines = content.split('\n');
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: lineNum,
      });
    }
  }

  return headings;
}