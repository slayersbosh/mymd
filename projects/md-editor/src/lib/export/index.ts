import { renderMarkdown } from '../markdown/parser';
import JSZip from 'jszip';

// Export to HTML (self-contained single file)
export async function exportToHtml(markdown: string, title: string = 'Document'): Promise<string> {
  const htmlContent = renderMarkdown(markdown);

  // Inline styles for self-contained HTML
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Noto Sans', 'Source Han Sans CN', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #0D0D0D;
        color: #E8E8E8;
        line-height: 1.8;
        padding: 40px;
        max-width: 900px;
        margin: 0 auto;
      }
      h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
      h2 { font-size: 22px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; }
      h3 { font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; }
      p { margin-bottom: 12px; }
      ul, ol { margin-left: 24px; margin-bottom: 12px; }
      blockquote {
        border-left: 3px solid #FF6B00;
        padding-left: 16px;
        margin: 16px 0;
        color: #888888;
      }
      a { color: #FF6B00; text-decoration: none; }
      a:hover { color: #FF8533; text-decoration: underline; }
      code {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        background: #1E1E1E;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 13px;
      }
      pre {
        background: #1E1E1E;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        margin: 16px 0;
      }
      pre code {
        background: none;
        padding: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      th, td {
        border: 1px solid #2D2D2D;
        padding: 8px 12px;
        text-align: left;
      }
      th { background: #1A1A1A; font-weight: 600; }
      img { max-width: 100%; border-radius: 6px; }
      hr { border: none; border-top: 1px solid #2D2D2D; margin: 24px 0; }
    </style>
  `;

  // Inline highlight.js theme
  const highlightStyles = `
    <style>
      .hljs { background: #1E1E1E; color: #E8E8E8; }
      .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #FF6B00; }
      .hljs-string, .hljs-attr { color: #00C853; }
      .hljs-number, .hljs-literal { color: #FFB300; }
      .hljs-comment { color: #888888; }
      .hljs-function, .hljs-title { color: #FF8533; }
      .hljs-params { color: #E8E8E8; }
      .hljs-type { color: #00C853; }
    </style>
  `;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  ${styles}
  ${highlightStyles}
</head>
<body>
  ${htmlContent}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</body>
</html>`;
}

// Export to PDF using browser print
export async function exportToPdf(markdown: string, title: string = 'Document'): Promise<void> {
  const html = await exportToHtml(markdown, title);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to render then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
}

// Export to plain text
export async function exportToText(markdown: string): Promise<string> {
  // Simple markdown to text conversion
  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove mermaid blocks
  text = text.replace(/```mermaid[\s\S]*?```/g, '');

  // Convert headers
  text = text.replace(/^#{6}\s+(.+)$/gm, '###### $1');
  text = text.replace(/^#{5}\s+(.+)$/gm, '##### $1');
  text = text.replace(/^#{4}\s+(.+)$/gm, '#### $1');
  text = text.replace(/^#{3}\s+(.+)$/gm, '### $1');
  text = text.replace(/^#{2}\s+(.+)$/gm, '## $1');
  text = text.replace(/^#{1}\s+(.+)$/gm, '# $1');

  // Convert bold
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');

  // Convert italic
  text = text.replace(/\*(.+?)\*/g, '$1');

  // Convert links
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  // Convert inline code
  text = text.replace(/`(.+?)`/g, '$1');

  // Convert blockquotes
  text = text.replace(/^>\s+(.+)$/gm, '> $1');

  // Remove markdown links
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  return text;
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download HTML file
export async function downloadHtml(markdown: string, title: string = 'document') {
  const html = await exportToHtml(markdown, title);
  downloadFile(html, `${title}.html`, 'text/html');
}

// Download as PDF (using print)
export async function downloadPdf(markdown: string, title: string = 'document') {
  await exportToPdf(markdown, title);
}

// Export to Word (.docx via HTML)
export async function exportToWord(markdown: string, title: string = 'Document'): Promise<void> {
  const htmlContent = renderMarkdown(markdown);

  const wordStyles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Noto Sans', 'Source Han Sans CN', 'Microsoft YaHei', sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000000;
        padding: 72pt;
      }
      h1 { font-size: 26pt; font-weight: bold; margin-bottom: 12pt; page-break-after: avoid; }
      h2 { font-size: 20pt; font-weight: bold; margin-top: 18pt; margin-bottom: 10pt; page-break-after: avoid; }
      h3 { font-size: 16pt; font-weight: bold; margin-top: 14pt; margin-bottom: 8pt; page-break-after: avoid; }
      h4 { font-size: 13pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
      p { margin-bottom: 10pt; }
      ul, ol { margin-left: 24pt; margin-bottom: 10pt; }
      li { margin-bottom: 4pt; }
      blockquote {
        border-left: 3pt solid #FF6B00;
        padding-left: 12pt;
        margin: 12pt 0;
        color: #666666;
        font-style: italic;
      }
      a { color: #FF6B00; text-decoration: none; }
      code {
        font-family: 'Consolas', 'Courier New', monospace;
        background: #F5F5F5;
        padding: 2pt 4pt;
        border-radius: 3pt;
        font-size: 10pt;
      }
      pre {
        background: #F5F5F5;
        border: 1pt solid #E0E0E0;
        border-radius: 4pt;
        padding: 12pt;
        margin: 12pt 0;
        page-break-inside: avoid;
      }
      pre code {
        background: none;
        padding: 0;
        font-size: 10pt;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12pt 0;
      }
      th, td {
        border: 1pt solid #CCCCCC;
        padding: 6pt 10pt;
        text-align: left;
      }
      th { background: #F0F0F0; font-weight: bold; }
      img { max-width: 100%; border-radius: 4pt; }
      hr { border: none; border-top: 1pt solid #CCCCCC; margin: 18pt 0; }
    </style>
  `;

  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  ${wordStyles}
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  downloadFile(wordHtml, `${title}.doc`, 'application/msword');
}

export async function downloadWord(markdown: string, title: string = 'document') {
  await exportToWord(markdown, title);
}

// Export to EPUB (basic structure)
export async function exportToEpub(markdown: string, title: string = 'Document', author: string = 'Unknown'): Promise<void> {
  // EPUB is a ZIP file with specific structure
  const content = renderMarkdown(markdown);

  // Extract first paragraph as description
  const descMatch = content.match(/<p>(.{1,200})<\/p>/);
  const description = descMatch ? descMatch[1] : 'A Markdown document';

  // Simple UUID-like ID
  const uuid = `uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // mimetype must be first and uncompressed
  const mimetype = `application/epub+zip`;

  // container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  // content.opf (package document)
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:identifier id="bookid">${uuid}</dc:identifier>
    <dc:language>zh-CN</dc:language>
    <dc:description>${escapeXml(description)}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="nav"/>
    <itemref idref="chapter1"/>
  </spine>
</package>`;

  // nav.xhtml (navigation document)
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc">
    <h1>${escapeXml(title)}</h1>
    <ol>
      <li><a href="chapter1.xhtml">Start Reading</a></li>
    </ol>
  </nav>
</body>
</html>`;

  // chapter1.xhtml
  const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${content}
</body>
</html>`;

  // style.css
  const styleCss = `
body {
  font-family: 'Noto Sans', 'Microsoft YaHei', sans-serif;
  font-size: 1em;
  line-height: 1.6;
  color: #333;
  padding: 1em;
  max-width: 40em;
  margin: 0 auto;
}
h1 { font-size: 1.8em; margin-bottom: 0.5em; }
h2 { font-size: 1.4em; margin-top: 1.2em; margin-bottom: 0.4em; }
h3 { font-size: 1.2em; margin-top: 1em; margin-bottom: 0.3em; }
p { margin-bottom: 0.8em; }
blockquote {
  border-left: 3px solid #FF6B00;
  padding-left: 1em;
  margin: 1em 0;
  color: #666;
}
code {
  font-family: 'Consolas', monospace;
  background: #f5f5f5;
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
pre {
  background: #f5f5f5;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.5em;
  text-align: left;
}
`;

  // Build the EPUB ZIP
  const zip = new JSZip();

  zip.file('mimetype', mimetype, { compression: 'STORE' });
  zip.file('META-INF/container.xml', containerXml);
  zip.file('OEBPS/content.opf', contentOpf);
  zip.file('OEBPS/nav.xhtml', navXhtml);
  zip.file('OEBPS/chapter1.xhtml', chapterXhtml);
  zip.file('OEBPS/style.css', styleCss);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip', compression: 'DEFLATE', compressionOptions: { level: 9 } });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}.epub`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadEpub(markdown: string, title: string = 'document', author: string = 'Unknown') {
  await exportToEpub(markdown, title, author);
}

// Helper to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}