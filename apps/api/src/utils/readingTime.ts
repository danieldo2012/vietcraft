export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  // Strip HTML tags if any
  const cleanText = content.replace(/<[^>]*>/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
};
