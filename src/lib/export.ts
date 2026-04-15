// ── Export utilities for Scaled ──
// Pure functions — no external dependencies.

/**
 * Convert TipTap HTML content to clean Markdown.
 * Handles: headings h1-h3, bold, italic, underline, links, images,
 * unordered/ordered lists, task lists, code blocks, blockquotes,
 * tables, and horizontal rules.
 */
export function exportAsMarkdown(title: string, content: string): string {
  let md = content;

  // --- Block-level elements (order matters) ---

  // Code blocks: <pre><code ...>...</code></pre>
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, code: string) => {
      const lang =
        _m.match(/class="[^"]*language-(\w+)/)?.[1] ?? "";
      const decoded = decodeHtmlEntities(code.trim());
      return `\n\`\`\`${lang}\n${decoded}\n\`\`\`\n`;
    }
  );

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner: string) => {
    const text = stripTags(inner).trim();
    return "\n" + text.split("\n").map((l) => `> ${l}`).join("\n") + "\n";
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, tableHtml: string) => {
    const rows: string[][] = [];
    const rowMatches = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) ?? [];
    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellMatches = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) ?? [];
      for (const cell of cellMatches) {
        const text = stripTags(cell.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/i, "$1")).trim();
        cells.push(text);
      }
      rows.push(cells);
    }
    if (rows.length === 0) return "";

    const colCount = Math.max(...rows.map((r) => r.length));
    const pad = (arr: string[]) => {
      while (arr.length < colCount) arr.push("");
      return arr;
    };

    const lines: string[] = [];
    const header = pad(rows[0]);
    lines.push("| " + header.join(" | ") + " |");
    lines.push("| " + header.map(() => "---").join(" | ") + " |");
    for (let i = 1; i < rows.length; i++) {
      lines.push("| " + pad(rows[i]).join(" | ") + " |");
    }
    return "\n" + lines.join("\n") + "\n";
  });

  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_m, t: string) => `\n# ${stripTags(t).trim()}\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, t: string) => `\n## ${stripTags(t).trim()}\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_m, t: string) => `\n### ${stripTags(t).trim()}\n`);

  // Task lists (must come before generic lists)
  md = md.replace(
    /<ul[^>]*data-type="taskList"[^>]*>([\s\S]*?)<\/ul>/gi,
    (_m, inner: string) => {
      return (
        "\n" +
        (inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [])
          .map((li) => {
            const checked = /data-checked="true"/i.test(li);
            const text = stripTags(li).trim();
            return `- [${checked ? "x" : " "}] ${text}`;
          })
          .join("\n") +
        "\n"
      );
    }
  );

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, inner: string) => {
    let idx = 0;
    return (
      "\n" +
      (inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [])
        .map((li) => {
          idx++;
          return `${idx}. ${stripTags(li).trim()}`;
        })
        .join("\n") +
      "\n"
    );
  });

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner: string) => {
    return (
      "\n" +
      (inner.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [])
        .map((li) => `- ${stripTags(li).trim()}`)
        .join("\n") +
      "\n"
    );
  });

  // --- Inline elements ---

  // Images (before links so ![...](...) isn't mangled)
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Bold
  md = md.replace(/<(strong|b)(?:\s[^>]*)?>(.+?)<\/\1>/gi, "**$2**");

  // Italic
  md = md.replace(/<(em|i)(?:\s[^>]*)?>(.+?)<\/\1>/gi, "*$2*");

  // Underline — Markdown doesn't have native underline, use HTML passthrough
  md = md.replace(/<u(?:\s[^>]*)?>(.+?)<\/u>/gi, "<u>$1</u>");

  // Inline code
  md = md.replace(/<code(?:\s[^>]*)?>(.+?)<\/code>/gi, "`$1`");

  // Paragraphs and line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");

  // Strip any remaining tags
  md = stripTags(md);

  // Decode HTML entities
  md = decodeHtmlEntities(md);

  // Collapse excessive blank lines
  md = md.replace(/\n{3,}/g, "\n\n").trim();

  // Prepend title
  return `# ${title}\n\n${md}\n`;
}

/**
 * Wrap HTML content in a complete standalone document
 * with dark-theme styling that matches the Scaled app.
 */
export function exportAsHTML(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg-primary: #09090b;
    --bg-secondary: #131316;
    --text-primary: #ececef;
    --text-secondary: #a0a0a8;
    --text-muted: #56565e;
    --border-color: #232328;
    --card-bg: #141417;
    --code-bg: #111114;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    font-weight: 300;
    line-height: 1.7;
    padding: 3rem 1.5rem;
    max-width: 720px;
    margin: 0 auto;
    -webkit-font-smoothing: antialiased;
  }
  h1 {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 300;
    font-style: italic;
    font-size: 2.4rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }
  h2 { font-size: 1.5rem; font-weight: 400; margin: 2rem 0 0.75rem; }
  h3 { font-size: 1.17rem; font-weight: 400; margin: 1.5rem 0 0.5rem; }
  p { margin-bottom: 1rem; color: var(--text-secondary); }
  a { color: #10b981; text-decoration: none; }
  a:hover { text-decoration: underline; }
  strong { font-weight: 500; color: var(--text-primary); }
  em { font-style: italic; }
  u { text-decoration: underline; }
  blockquote {
    border-left: 3px solid #10b981;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
  }
  pre {
    background: var(--code-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.85rem;
    line-height: 1.6;
  }
  code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.85em;
    background: var(--code-bg);
    padding: 0.15em 0.4em;
    border-radius: 4px;
  }
  pre code { background: none; padding: 0; }
  ul, ol { padding-left: 1.5rem; margin: 0.75rem 0; color: var(--text-secondary); }
  li { margin-bottom: 0.35rem; }
  li[data-checked="true"] { text-decoration: line-through; color: var(--text-muted); }
  hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 2rem 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  th, td {
    border: 1px solid var(--border-color);
    padding: 0.5rem 0.75rem;
    text-align: left;
    color: var(--text-secondary);
  }
  th {
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-weight: 400;
  }
  img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${content}
</body>
</html>`;
}

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(
  filename: string,
  content: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Copy text to the clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers / Tauri webview edge-cases
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

// ── Helpers ──

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
