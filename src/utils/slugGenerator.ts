/**
 * Generates SEO-friendly Arabic slugs for products
 * Keeps only 3-5 Arabic keywords, removes English and special characters
 */

const arabicStopWords = [
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'بـ', 'لـ', 'هو', 'هي',
  'هم', 'هن', 'أن', 'إن', 'كان', 'ليس', 'قد', 'لم', 'لن', 'ما',
  'لا', 'نعم', 'هذا', 'ذلك', 'هذه', 'تلك', 'هنا', 'هناك',
  'و', 'أو', 'لكن', 'ثم', 'إذا', 'بل', 'الذي', 'التي', 'اللذان',
];

export function generateProductSlug(productName: string, category?: string): string {
  // Remove English characters and numbers
  let cleaned = productName.replace(/[a-zA-Z0-9]/g, ' ');
  
  // Remove special characters except Arabic and hyphens
  cleaned = cleaned.replace(/[^\u0600-\u06FF\s-]/g, ' ');
  
  // Split into words
  let words = cleaned
    .split(/\s+/)
    .filter(word => word.length > 1)
    .filter(word => !arabicStopWords.includes(word));
  
  // Take first 3-5 meaningful words
  const mainWords = words.slice(0, 5);
  
  // If we have category and less than 3 words, add category
  if (category && mainWords.length < 3) {
    const categoryWords = category
      .split(/\s+/)
      .filter(word => word.length > 1)
      .filter(word => !arabicStopWords.includes(word));
    
    mainWords.push(...categoryWords.slice(0, 1));
  }
  
  // Join with hyphens
  const slug = mainWords
    .join('-')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return slug || 'منتج';
}

/**
 * Examples:
 * "EQqualberry Bakuchiol Plumping Serum 30ml - سيروم باكوتشيول منعم و ممتلئ للبشرة 30 مل"
 * => "سيروم-باكوتشيول-منعم"
 * 
 * "Natural Shampoo Bar with 12 Herbs - بار شامبو طبيعي بـ 12 عشبة"
 * => "بار-شامبو-طبيعي-عشبة"
 * 
 * "Vitamin C Serum for Face - سيروم فيتامين سي للوجه"
 * => "سيروم-فيتامين-وجه"
 */