import DOMPurify from "isomorphic-dompurify";

export function sanitizeMessage(content: string): string {
  return DOMPurify.sanitize(content.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
