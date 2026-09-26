export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Normalize accented characters (like Vietnamese diacritics)
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Collapse whitespace and replace by -
    .replace(/-+/g, '-'); // Collapse dashes
};
