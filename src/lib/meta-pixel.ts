/**
 * Meta Pixel (Facebook Pixel) - Helper Utilities
 * Pixel ID: 1488889372900835
 *
 * Provides type-safe wrapper functions for Meta Pixel standard e-commerce events.
 * All functions are safe to call server-side (SSR) — they no-op when `window` is unavailable.
 *
 * @see https://developers.facebook.com/docs/meta-pixel/reference
 */

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: (...args: unknown[]) => void;
  }
}

/** Guard: returns true only in a browser where fbq has been initialised */
const isFbqReady = (): boolean =>
  typeof window !== 'undefined' && typeof window.fbq === 'function';

/* ------------------------------------------------------------------ */
/*  Standard Events                                                    */
/* ------------------------------------------------------------------ */

/**
 * Track a page view.
 * Called automatically by the base pixel snippet on every page load,
 * but can be called manually for SPA route changes.
 */
export const trackPageView = (): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'PageView');
};

/**
 * ViewContent — fired when a user views a product detail page.
 */
export const trackViewContent = (params: {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'ViewContent', params);
};

/**
 * AddToCart — fired when a user adds a product to the cart.
 */
export const trackAddToCart = (params: {
  content_name: string;
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  num_items?: number;
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'AddToCart', params);
};

/**
 * InitiateCheckout — fired when the checkout process starts.
 */
export const trackInitiateCheckout = (params: {
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  num_items: number;
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'InitiateCheckout', params);
};

/**
 * Purchase — fired on the order-success page after payment is confirmed.
 */
export const trackPurchase = (params: {
  content_ids: string[];
  content_type: 'product';
  value: number;
  currency: string;
  num_items: number;
  order_id?: string;
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'Purchase', params);
};

/**
 * Search — fired when a user performs a search.
 */
export const trackSearch = (params: {
  search_string: string;
  content_ids?: string[];
  content_type?: 'product';
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'Search', params);
};

/**
 * Contact — fired when a user submits a contact / lead form.
 */
export const trackContact = (): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'Contact');
};

/**
 * CompleteRegistration — fired on newsletter signup or account creation.
 */
export const trackCompleteRegistration = (params?: {
  content_name?: string;
  status?: boolean;
}): void => {
  if (!isFbqReady()) return;
  window.fbq('track', 'CompleteRegistration', params ?? {});
};
