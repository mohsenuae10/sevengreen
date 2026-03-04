import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

/**
 * A wrapper around react-router-dom's Link that automatically adds
 * the current language prefix to the path.
 * 
 * Usage: <LocalizedLink to="/products">Products</LocalizedLink>
 * Renders: <Link to="/ar/products">Products</Link> (if language is Arabic)
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ to, ...props }, ref) => {
    const { getLocalizedPath } = useLanguageCurrency();

    // Don't localize external links, admin paths, hash links, or sitemap paths
    const shouldLocalize = 
      typeof to === 'string' &&
      !to.startsWith('http') &&
      !to.startsWith('#') &&
      !to.startsWith('/admin') &&
      !to.startsWith('/invoice') &&
      !to.includes('sitemap') &&
      !to.match(/^\/(ar|en)(\/|$)/); // Already has language prefix

    const localizedTo = shouldLocalize ? getLocalizedPath(to) : to;

    return <Link ref={ref} to={localizedTo} {...props} />;
  }
);

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
