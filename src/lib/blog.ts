import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
}

/**
 * Get all blog post filenames/slugs
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return [];
  }
  const fileNames = fs.readdirSync(BLOG_DIRECTORY);
  return fileNames
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

/**
 * Get all blog posts metadata sorted by date (newest first)
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return [];
  }

  const fileNames = fs.readdirSync(BLOG_DIRECTORY);
  const posts = fileNames
    .filter((file) => file.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(BLOG_DIRECTORY, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled Post',
        date: data.date || '',
        excerpt: data.excerpt || '',
      };
    });

  // Sort posts by date descending (newest first)
  return posts.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
}

/**
 * Get a single blog post by slug with rendered HTML content
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(BLOG_DIRECTORY, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Dynamic import for remark and remark-html (pure ESM modules)
  const { remark } = await import('remark');
  const { default: html } = await import('remark-html');

  const processedContent = await remark().use(html, { sanitize: false }).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || 'Untitled Post',
    date: data.date || '',
    excerpt: data.excerpt || '',
    contentHtml,
  };
}
