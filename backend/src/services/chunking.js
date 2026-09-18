const DEFAULT_MAX_CHARS = 1800;
const DEFAULT_OVERLAP = 250;

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitIntoParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitLongText(text, maxChars) {
  const words = text.split(/\s+/);
  const parts = [];

  let current = "";

  for (const word of words) {
    const candidate = current
      ? `${current} ${word}`
      : word;

    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) {
        parts.push(current);
      }

      current = word;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

export function chunkText(
  text,
  maxChars = DEFAULT_MAX_CHARS,
  overlap = DEFAULT_OVERLAP
) {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return [];
  }

  const paragraphs = splitIntoParagraphs(cleaned);
  const chunks = [];

  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      const longParts = splitLongText(paragraph, maxChars);

      for (let i = 0; i < longParts.length; i++) {
        const part = longParts[i];

        if (i === 0) {
          chunks.push(part);
        } else {
          const previous = longParts[i - 1];

          const previousWords = previous.split(/\s+/);

          const overlapWords = previousWords.slice(
            Math.max(0, previousWords.length - Math.ceil(overlap / 8))
          );

          const overlapped = `${overlapWords.join(" ")} ${part}`.trim();

          chunks.push(overlapped);
        }
      }

      continue;
    }

    const candidate = current
      ? `${current}\n\n${paragraph}`
      : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) {
        chunks.push(current);
      }

      const words = current.split(/\s+/);

      const overlapWords = words.slice(
        Math.max(0, words.length - Math.ceil(overlap / 8))
      );

      current = `${overlapWords.join(" ")} ${paragraph}`.trim();

      if (current.length > maxChars) {
        const parts = splitLongText(current, maxChars);

        chunks.push(...parts.slice(0, -1));
        current = parts[parts.length - 1];
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.map((content, index) => ({
    index,
    content: content.trim(),
  }));
}

export function chunkPages(pages) {
  const allChunks = [];

  for (const page of pages) {
    const chunks = chunkText(page.text);

    for (const chunk of chunks) {
      allChunks.push({
        pageNumber: page.pageNumber,
        chunkIndex: chunk.index,
        content: chunk.content,
      });
    }
  }

  return allChunks;
}