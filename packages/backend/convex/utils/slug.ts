/**
 * Generate a URL-safe slug from a title string
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, "-")
      // Remove special characters except hyphens
      .replace(/[^\w\-]+/g, "")
      // Replace multiple consecutive hyphens with single hyphen
      .replace(/\-\-+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Limit length to 100 characters
      .substring(0, 100)
  );
}

/**
 * Generate a unique slug by appending a random suffix if needed
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): string {
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists
  while (existingSlugs.includes(slug)) {
    // Append random 4-character suffix
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${baseSlug}-${suffix}`;
    counter++;

    // Safety limit to avoid infinite loops
    if (counter > 100) {
      // Use timestamp as last resort
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}
