import Head from 'next/head';

interface ImageSchemaProps {
  imageUrl: string;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  contentUrl?: string;
}

export const ImageSchema = ({
  imageUrl,
  name,
  description,
  width = 1200,
  height = 630,
  contentUrl,
}: ImageSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: imageUrl,
    name: name,
    ...(description && { description: description }),
    ...(contentUrl && { contentUrl: contentUrl }),
    width: width,
    height: height,
    encodingFormat: 'image/jpeg',
  };

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
  );
};
