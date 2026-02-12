/**
 * Core Web Vitals Optimization for SEO
 * 
 * Google's Core Web Vitals are critical ranking factors:
 * 1. LCP (Largest Contentful Paint) - Loading performance
 * 2. FID (First Input Delay) - Interactivity 
 * 3. CLS (Cumulative Layout Shift) - Visual stability
 */

// Performance metrics monitoring
export const initPerformanceMonitoring = () => {
  // Measure LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const largestEntry = entries[entries.length - 1] as any;
        const lcpValue = largestEntry.renderTime || largestEntry.loadTime;
        console.log('LCP:', lcpValue);
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            'lcp': lcpValue,
          });
        }
      });

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.warn('LCP observer not supported');
    }

    // Measure CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const anyEntry = entry as any;
          if (!anyEntry.hadRecentInput) {
            clsValue += anyEntry.value;
          }
        }
        console.log('CLS:', clsValue);
      });

      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer not supported');
    }

    // Measure FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const anyEntry = entry as any;
          console.log('FID:', anyEntry.processingDuration);
        });
      });

      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('FID observer not supported');
    }
  }
};

// Image optimization utilities
export const getOptimizedImageUrl = (imageUrl: string, width: number = 800): string => {
  if (!imageUrl) return '';
  
  // For Supabase Storage images, add width and quality parameters
  if (imageUrl.includes('supabase.co/storage')) {
    const url = new URL(imageUrl);
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', '85');
    return url.toString();
  }
  
  return imageUrl;
};

// Lazy loading image utility
export const createLazyImageProps = (src: string, alt: string) => ({
  src,
  alt,
  loading: 'lazy' as const,
  decoding: 'async' as const,
  fetchPriority: 'low' as const,
});

// Critical resource preloading
export const preloadCriticalResources = () => {
  if (typeof document !== 'undefined') {
    // Preload fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
};

// Script optimization for better metrics
export const deferNonCriticalScripts = () => {
  const scripts = document.querySelectorAll('script:not([defer]):not([async])');
  scripts.forEach((element) => {
    const script = element as HTMLScriptElement;
    if (script.src && !script.src.includes('google-analytics') && !script.src.includes('gtag')) {
      script.defer = true;
    }
  });
};

declare global {
  interface Window {
    gtag?: Function;
  }
}
