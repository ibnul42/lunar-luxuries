export const SITE = {
  name: "Lunar Luxuries",
  tagline: "Considered goods for a slower home",
  description:
    "Jewelry, home & living, beauty, apparel, accessories and gifts — chosen for how they wear, not how loudly they arrive.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** The NestJS API, `/api` prefix included (backend/src/main.ts). */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  supportEmail: "hello@lunarluxuries.com",
  foundedYear: 2019,
  /**
   * PLACEHOLDER — copied from the design, which lists a Portland address and a
   * fictional 555 number. Replace with the real studio before launch (README §7).
   */
  studio: {
    address: ["148 Foundry Lane", "Portland, OR 97209"],
    phone: "(503) 555-0148",
    /** E.164, for the `tel:` link. */
    phoneHref: "+15035550148",
    hours: ["Mon–Fri, 9am–5pm", "Weekends by appointment"],
  },
  currency: "BDT",
  locale: "en-BD",
} as const;

export const CATEGORIES = [
  { slug: "jewelry", name: "Jewelry" },
  { slug: "home-living", name: "Home & Living" },
  { slug: "beauty", name: "Beauty" },
  { slug: "apparel", name: "Apparel" },
  { slug: "accessories", name: "Accessories" },
  { slug: "gifts", name: "Gifts" },
] as const;

export const PRIMARY_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?filter=new", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAV = [
  {
    heading: "Shop",
    links: CATEGORIES.map((c) => ({
      href: `/shop?category=${c.slug}`,
      label: c.name,
    })),
  },
  {
    heading: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-returns", label: "Shipping & Returns" },
      { href: "/orders/track", label: "Track an order" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
] as const;
