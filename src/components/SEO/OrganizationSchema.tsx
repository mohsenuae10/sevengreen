import Head from 'next/head';

interface OrganizationSchemaProps {
  name?: string;
  logo?: string;
  url?: string;
  email?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
}

export const OrganizationSchema = ({
  name = 'لمسة بيوتي',
  logo = 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/uploads/1760543849788-IMG_1206.jpeg',
  url = 'https://lamsetbeauty.com',
  email,
  phone,
  facebook,
  instagram,
}: OrganizationSchemaProps = {}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    alternateName: 'Lamset Beauty',
    url,
    logo,
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    sameAs: [
      facebook,
      instagram,
    ].filter(Boolean),
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </Head>
  );
};
