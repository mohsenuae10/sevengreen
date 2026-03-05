import { forwardRef } from 'react';
import Link from 'next/link';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

interface LocalizedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
  prefetch?: boolean;
}

/**
 * A wrapper around next/link that automatically adds
 * the current language prefix to the path.
 *
 * Usage: <LocalizedLink to="/products">Products</LocalizedLink>
 * Renders: <Link href="/ar/products">Products</Link> (if language is Arabic)
 */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ to, replace, prefetch, children, ...props }, ref) => {
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

    return (
      <Link href={localizedTo} replace={replace} prefetch={prefetch} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
