/**
 * Router compatibility layer — drop-in replacement for react-router-dom hooks
 * so existing view components work with Next.js without massive refactoring.
 *
 * Usage:
 *   // Replace:
 *   import { useNavigate, useParams, Link } from 'react-router-dom';
 *   // With:
 *   import { useNavigate, useParams, Link } from '@/hooks/useNextRouter';
 */
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';

// ── useNavigate ─────────────────────────────────────────────
export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (to === -1) router.back();
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router],
  );
}

// ── useParams ───────────────────────────────────────────────
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const router = useRouter();
  // Flatten arrays (Next.js catch-all gives string[])
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(router.query)) {
    if (typeof v === 'string') params[k] = v;
    else if (Array.isArray(v) && v.length) params[k] = v[0];
  }
  return params as T;
}

// ── useLocation ─────────────────────────────────────────────
export function useLocation() {
  const router = useRouter();
  return {
    pathname: router.asPath.split('?')[0],
    search: router.asPath.includes('?') ? `?${router.asPath.split('?')[1]?.split('#')[0] || ''}` : '',
    hash: router.asPath.includes('#') ? `#${router.asPath.split('#')[1] || ''}` : '',
    state: null as any,
  };
}

// ── useSearchParams ─────────────────────────────────────────
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void] {
  const router = useRouter();
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  );
  const setSearchParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      const path = router.asPath.split('?')[0];
      router.replace(qs ? `${path}?${qs}` : path, undefined, { shallow: true });
    },
    [router],
  );
  return [searchParams, setSearchParams];
}

// ── Link (react-router-dom compatible) ──────────────────────
interface CompatLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
  children?: React.ReactNode;
}

export function Link({ to, replace, children, ...rest }: CompatLinkProps) {
  return (
    <NextLink href={to} replace={replace} {...rest}>
      {children}
    </NextLink>
  );
}

// ── NavLink (simplified compat) ─────────────────────────────
interface NavLinkProps extends Omit<CompatLinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean }) => string);
}
export function NavLink({ to, className, children, ...rest }: NavLinkProps) {
  const router = useRouter();
  const isActive = router.asPath.startsWith(to);
  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : className;
  return (
    <NextLink href={to} className={resolvedClass} {...rest}>
      {children}
    </NextLink>
  );
}

// ── Navigate (redirect component) ───────────────────────────
interface NavigateProps {
  to: string;
  replace?: boolean;
}
export function Navigate({ to, replace: shouldReplace = true }: NavigateProps) {
  const router = useRouter();
  if (typeof window !== 'undefined') {
    if (shouldReplace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }
  return null;
}
