/**
 * Vercel Edge Middleware for SEO Prerendering
 * 
 * Detects search engine bots and social media crawlers,
 * then redirects them to Prerender.io for pre-rendered HTML.
 * 
 * Setup:
 * 1. Sign up at https://prerender.io (free tier: 250 pages/month)
 * 2. Add PRERENDER_TOKEN to Vercel Environment Variables
 * 3. Deploy
 * 
 * This middleware uses the standard Web API (works with Vercel Edge without Next.js)
 */

const BOT_AGENTS = [
  'googlebot',
  'yahoo',
  'bingbot',
  'baiduspider',
  'yandex',
  'yeti',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'embedly',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkshare',
  'redditbot',
  'applebot',
  'whatsapp',
  'flipboard',
  'tumblr',
  'discordbot',
  'qwantify',
  'pinterestbot',
  'telegrambot',
  'chrome-lighthouse',
  'google page speed',
];

export default async function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const url = new URL(request.url);
  
  // Skip admin, API, and static asset routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/assets') ||
    url.pathname.match(/\.(js|css|xml|json|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|html)$/i)
  ) {
    return;
  }

  // Redirect root / to /ar/ (default language)
  if (url.pathname === '/' || url.pathname === '') {
    return Response.redirect(new URL('/ar/', url.origin), 302);
  }

  // Redirect legacy paths without language prefix to /ar/...
  const hasLangPrefix = /^\/(ar|en)(\/|$)/.test(url.pathname);
  const isSpecialPath = url.pathname.startsWith('/admin') || 
                        url.pathname.startsWith('/invoice/') ||
                        url.pathname.startsWith('/sitemap');
  
  if (!hasLangPrefix && !isSpecialPath) {
    return Response.redirect(new URL(`/ar${url.pathname}${url.search}`, url.origin), 301);
  }

  // Check if the request is from a bot
  const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot));
  
  if (isBot) {
    // @ts-ignore - process.env is available in Vercel Edge Runtime
    const prerenderToken: string | undefined = (globalThis as any).process?.env?.PRERENDER_TOKEN || undefined;
    
    if (prerenderToken) {
      try {
        // Fetch pre-rendered version from Prerender.io
        const prerenderUrl = `https://service.prerender.io/${request.url}`;
        const prerenderResponse = await fetch(prerenderUrl, {
          headers: {
            'X-Prerender-Token': prerenderToken,
          },
          redirect: 'follow',
        });
        
        if (prerenderResponse.ok) {
          const html = await prerenderResponse.text();
          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=86400',
              'X-Prerendered': 'true',
            },
          });
        }
      } catch (e) {
        // If prerender fails, fall through to normal SPA
        console.error('Prerender failed:', e);
      }
    }
  }
  
  // Fall through to normal SPA handling
  return;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|json|txt|js|css|woff|woff2|html)$).*)',
  ],
};
