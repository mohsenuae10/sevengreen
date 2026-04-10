import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="content-language" content="ar-SA" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#996B99" />

        {/* Preconnect */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://kvieobbwmlbddqpbdovg.supabase.co" />
        <link rel="dns-prefetch" href="https://ae01.alicdn.com" />
        <link rel="preconnect" href="https://kvieobbwmlbddqpbdovg.supabase.co" />
        <link rel="preconnect" href="https://ae01.alicdn.com" />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="https://storage.googleapis.com/gpt-engineer-file-uploads/oHKXQgR7MBTw5OJUYf06sps7opn2/uploads/1764179952599-IMG_4355.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="author" href="/humans.txt" />

        {/* Google Verification */}
        <meta name="google-site-verification" content="google13c13082d06c9359" />

        {/* GA4 – Replace G-XXXXXXXXXX with your real Measurement ID */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1488889372900835');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1488889372900835&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Global JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'لمسة بيوتي',
              alternateName: 'Lamset Beauty',
              url: 'https://lamsetbeauty.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://lamsetbeauty.com/products?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: 'ar-SA',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'لمسة بيوتي',
              image: 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/social-images/social-1760543856406-d145a275-c3fb-4f7c-b8e7-6a240c841ffc.jpeg',
              description: 'لمسة بيوتي - متجرك المتخصص في منتجات الجمال والعناية الفاخرة.',
              currenciesAccepted: 'SAR',
              paymentAccepted: 'Credit Card, Apple Pay, Visa, Mastercard',
              priceRange: '$$',
              url: 'https://lamsetbeauty.com',
              address: { '@type': 'PostalAddress', addressCountry: 'SA' },
              geo: { '@type': 'GeoCoordinates', latitude: '24.774265', longitude: '46.738586' },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                opens: '00:00',
                closes: '23:59',
              },
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
