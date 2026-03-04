import {
  Sparkles,
  Droplet,
  Heart,
  Flower2,
  User,
  Gift,
  Leaf,
  Sun,
  Moon,
  Star,
  Zap,
  Cloud,
  ShoppingBag,
  Package,
  Scissors,
  Palette,
  type LucideIcon,
} from 'lucide-react';

/**
 * Curated icon map for category icons.
 * Only imports the icons that are used in the admin panel's iconOptions,
 * instead of importing the entire lucide-react library (~1000+ icons).
 */
export const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Droplet,
  Heart,
  Flower2,
  User,
  Gift,
  Leaf,
  Sun,
  Moon,
  Star,
  Zap,
  Cloud,
  ShoppingBag,
  Package,
  Scissors,
  Palette,
};

/** Default fallback icon */
export const DefaultIcon = Sparkles;
