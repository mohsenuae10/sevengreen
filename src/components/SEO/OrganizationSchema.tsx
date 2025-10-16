import { Helmet } from 'react-helmet-async';

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
  name = 'Seven Green | سفن جرين',
  logo = 'https://storage.googleapis.com/gpt-engineer-file-uploads/FTkS9Pg7ErS94PYn0Zsid605WOf2/uploads/1760543849788-IMG_1206.jpeg',
  url = 'https://sevengreenstore.com',
  email,
  phone,
  facebook,
  instagram,
}: OrganizationSchemaProps = {}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
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
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};
