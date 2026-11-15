import { isPlaceholder, site } from "@/config/site";
import { getContent } from "@/content";

const { serviceNames } = getContent("en").common;

/** GeneralContractor structured data, built only from site config. Placeholder values are left out. */
export function BusinessJsonLd() {
  const real = (value: string) => (!value || isPlaceholder(value) ? undefined : value);
  const data = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: site.name,
    legalName: real(site.legalName),
    url: site.url,
    image: `${site.url}/og.png`,
    logo: `${site.url}/apple-icon.png`,
    telephone: isPlaceholder(site.phone.display) ? undefined : site.phone.e164,
    email: real(site.email),
    areaServed: real(site.serviceArea),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: Object.values(serviceNames).map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
    hasMap: site.mapUrl || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: real(site.address.street),
      addressLocality: real(site.address.locality),
      addressRegion: real(site.address.region),
      postalCode: real(site.address.postalCode),
      addressCountry: site.address.country,
    },
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify drops undefined keys; escape "<" so no value can close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
