// Front matter parsing for YAML metadata
// Supports: tags, title, author, date, and custom fields

interface FrontMatter {
  title?: string;
  author?: string;
  date?: string;
  tags: string[];
  custom: Record<string, string>;
  raw: string;
}

const FRONT_MATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n/;

export function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(FRONT_MATTER_REGEX);

  if (!match) {
    return {
      tags: [],
      custom: {},
      raw: '',
    };
  }

  const yamlContent = match[1];
  const result: FrontMatter = {
    tags: [],
    custom: {},
    raw: yamlContent,
  };

  const lines = yamlContent.split('\n');
  let currentKey = '';
  let currentValue = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Key-value pair
    const kvMatch = trimmedLine.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      // Save previous key-value if exists
      if (currentKey) {
        setValue(result, currentKey, currentValue.trim());
      }
      currentKey = kvMatch[1];
      currentValue = kvMatch[2];
    } else if (trimmedLine.startsWith('-') && !trimmedLine.startsWith('- ')) {
      // Array item continuation (indented)
      currentValue += '\n' + trimmedLine;
    } else if (trimmedLine === '') {
      // Empty line, save current
      if (currentKey) {
        setValue(result, currentKey, currentValue.trim());
        currentKey = '';
        currentValue = '';
      }
    }
  }

  // Save last key-value
  if (currentKey) {
    setValue(result, currentKey, currentValue.trim());
  }

  return result;
}

function setValue(result: FrontMatter, key: string, value: string) {
  switch (key.toLowerCase()) {
    case 'title':
      result.title = value;
      break;
    case 'author':
      result.author = value;
      break;
    case 'date':
      result.date = value;
      break;
    case 'tags':
      // Parse tags array
      result.tags = parseTagsArray(value);
      break;
    default:
      result.custom[key] = value;
  }
}

function parseTagsArray(value: string): string[] {
  // Handle single-line array: [tag1, tag2, tag3]
  if (value.startsWith('[')) {
    const inner = value.replace(/^\[|\]$/g, '');
    return inner.split(',').map((t) => t.trim()).filter(Boolean);
  }

  // Handle multi-line array
  const tags: string[] = [];
  const lines = value.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-')) {
      tags.push(trimmed.replace(/^-\s*/, '').trim());
    }
  }

  return tags;
}

// Check if content has front matter
export function hasFrontMatter(content: string): boolean {
  return FRONT_MATTER_REGEX.test(content);
}

// Add or update front matter
export function updateFrontMatter(
  content: string,
  updates: Partial<Omit<FrontMatter, 'raw' | 'custom'>> & Record<string, string>
): string {
  const existing = parseFrontMatter(content);
  const hasExisting = hasFrontMatter(content);

  // Build new front matter
  const newFrontMatter: string[] = [];

  if (updates.title) {
    newFrontMatter.push(`title: ${updates.title}`);
  } else if (existing.title) {
    newFrontMatter.push(`title: ${existing.title}`);
  }

  if (updates.author) {
    newFrontMatter.push(`author: ${updates.author}`);
  } else if (existing.author) {
    newFrontMatter.push(`author: ${existing.author}`);
  }

  if (updates.date) {
    newFrontMatter.push(`date: ${updates.date}`);
  } else if (existing.date) {
    newFrontMatter.push(`date: ${existing.date}`);
  }

  if (updates.tags && updates.tags.length > 0) {
    newFrontMatter.push(`tags:`);
    updates.tags.forEach((tag) => {
      newFrontMatter.push(`  - ${tag}`);
    });
  } else if (existing.tags.length > 0) {
    newFrontMatter.push(`tags:`);
    existing.tags.forEach((tag) => {
      newFrontMatter.push(`  - ${tag}`);
    });
  }

  // Add custom fields
  Object.entries(existing.custom).forEach(([key, value]) => {
    if (!newFrontMatter.some((line) => line.startsWith(`${key}:`))) {
      newFrontMatter.push(`${key}: ${value}`);
    }
  });

  // Add other custom fields from updates
  Object.entries(updates).forEach(([key, value]) => {
    if (!['title', 'author', 'date', 'tags', 'raw', 'custom'].includes(key)) {
      newFrontMatter.push(`${key}: ${value}`);
    }
  });

  const frontMatterBlock = `---\n${newFrontMatter.join('\n')}\n---`;

  if (hasExisting) {
    // Replace existing front matter
    return content.replace(FRONT_MATTER_REGEX, frontMatterBlock + '\n');
  } else {
    // Add new front matter at the beginning
    return frontMatterBlock + '\n' + content;
  }
}

// Extract body content without front matter
export function getBodyContent(content: string): string {
  return content.replace(FRONT_MATTER_REGEX, '');
}

// Tag autocomplete suggestions
export const TAG_SUGGESTIONS = [
  '笔记',
  '工作',
  '技术',
  '产品',
  '文档',
  '教程',
  '思考',
  '生活',
  '项目',
  'TODO',
  '重要',
  '草稿',
];