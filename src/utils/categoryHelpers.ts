/**
 * Utility functions for category-specific content and logic
 */

/**
 * Get care type text based on category name
 */
export const getCareType = (category?: string): string => {
  if (!category) return '';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('شعر') || categoryLower.includes('hair')) {
    return 'بالشعر';
  }
  
  if (categoryLower.includes('بشرة') || categoryLower.includes('skin')) {
    return 'بالبشرة';
  }
  
  if (categoryLower.includes('جسم') || categoryLower.includes('body')) {
    return 'بالجسم';
  }
  
  return '';
};

/**
 * Check if category is hair care
 */
export const isHairCare = (category?: string): boolean => {
  if (!category) return false;
  const categoryLower = category.toLowerCase();
  return categoryLower.includes('شعر') || categoryLower.includes('hair');
};

/**
 * Check if category is skin care
 */
export const isSkinCare = (category?: string): boolean => {
  if (!category) return false;
  const categoryLower = category.toLowerCase();
  return categoryLower.includes('بشرة') || categoryLower.includes('skin');
};

/**
 * Check if category is body care
 */
export const isBodyCare = (category?: string): boolean => {
  if (!category) return false;
  const categoryLower = category.toLowerCase();
  return categoryLower.includes('جسم') || categoryLower.includes('body');
};
