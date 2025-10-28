import Script from "next/script";

interface SeoJsonLdProps {
  id: string;
  data: unknown;
}

export default function SeoJsonLd({ id, data }: SeoJsonLdProps) {
  const json = JSON.stringify(data);
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
