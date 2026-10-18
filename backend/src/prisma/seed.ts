/**
 * Development seed — README §6. Run with `npm run db:seed` (it builds first,
 * so no TypeScript runner is needed) or implicitly by `prisma migrate reset`.
 *
 * It REPLACES the catalogue, carts, wishlists, reviews and orders, and upserts
 * the demo accounts. Refuses to run with NODE_ENV=production.
 *
 * PRICES ARE PLACEHOLDERS. README §6: the design's figures are USD and are not
 * valid BDT amounts. The ৳ figures below are rough round numbers so the store
 * looks plausible in development — someone with market knowledge must set the
 * real prices, shipping rate and free-shipping threshold before launch.
 */
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

import { PrismaClient, type Prisma } from "../generated/prisma/client";
import { DEFAULT_SETTINGS } from "../settings/settings.defaults";

config({ path: [".env.local", ".env"], quiet: true });

if (process.env["NODE_ENV"] === "production") {
  console.error("Refusing to seed with NODE_ENV=production.");
  process.exit(1);
}

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  console.error("DATABASE_URL is not set — see backend/.env.example.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** Taka → poisha. Every amount below is written in whole taka for legibility. */
const tk = (taka: number): number => Math.round(taka * 100);

const ADMIN = {
  email: "admin@lunarluxuries.com",
  name: "Store Admin",
  password: "lunar-admin-2026",
};
/** The design's signed-in customer, "Jordan Avery". */
const DEMO_CUSTOMER = {
  email: "jordan@example.com",
  name: "Jordan Avery",
  password: "lunar-demo-2026",
};

const CATEGORIES: {
  slug: string;
  name: string;
  description: string;
  status?: "ACTIVE" | "HIDDEN";
  children: string[];
}[] = [
  {
    slug: "jewelry",
    name: "Jewelry",
    description: "Fine chains, hoops and rings made to be worn every day.",
    children: ["Necklaces", "Earrings", "Rings", "Bracelets"],
  },
  {
    slug: "home-living",
    name: "Home & Living",
    description: "Stoneware, linen and light for a slower home.",
    children: ["Candles", "Tableware", "Textiles", "Decor"],
  },
  {
    slug: "beauty",
    name: "Beauty",
    description: "Botanical oils and balms, small-batch and gentle.",
    children: ["Skincare", "Fragrance", "Bath & Body"],
  },
  {
    slug: "apparel",
    name: "Apparel",
    description: "Natural fibres cut for ease.",
    children: ["Outerwear", "Knitwear", "Loungewear"],
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Leather, cashmere and the finishing pieces.",
    children: ["Bags", "Scarves", "Sunglasses"],
  },
  {
    slug: "gifts",
    name: "Gifts",
    description: "Ready-wrapped sets and the cards to go with them.",
    // Hidden in the Admin Categories design, so it starts hidden here too.
    status: "HIDDEN",
    children: ["Gift Sets", "Cards", "Wrapping"],
  },
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

interface SeedVariant {
  color?: string;
  colorHex?: string;
  size?: string;
  stock: number;
}

interface SeedProduct {
  name: string;
  /** A subcategory name, or a top-level slug. */
  category: string;
  price: number;
  compareAt?: number;
  status?: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";
  featured?: boolean;
  newArrival?: boolean;
  colorLabel?: string;
  description: string;
  variants: SeedVariant[];
  specs?: [string, string][];
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Hand-Poured Soy Candle",
    category: "Candles",
    price: 3800,
    featured: true,
    description:
      "Poured by hand in small batches from natural soy wax, with a cotton wick and a quiet blend of cedar, fig and smoke. Around 50 hours of slow, even burn.",
    variants: [{ stock: 84 }],
    specs: [
      ["Wax", "100% soy"],
      ["Burn time", "Approx. 50 hours"],
      ["Vessel", "Reusable stoneware"],
    ],
  },
  {
    name: "Gold-Plated Hoop Earrings",
    category: "Earrings",
    price: 5400,
    featured: true,
    description:
      "Lightweight hoops in 18k gold plate over sterling silver, sized to wear from morning to evening without a second thought.",
    variants: [{ stock: 12 }],
    specs: [
      ["Material", "18k gold plate on sterling silver"],
      ["Diameter", "24mm"],
    ],
  },
  {
    name: "Linen Throw Blanket",
    category: "Textiles",
    price: 8200,
    featured: true,
    status: "OUT_OF_STOCK",
    description:
      "Stonewashed European linen, softened until it drapes like a well-loved shirt. Generous enough for two on the sofa.",
    variants: [{ stock: 0 }],
    specs: [
      ["Material", "100% European linen"],
      ["Size", "130 × 180cm"],
    ],
  },
  {
    name: "Ceramic Pour-Over Set",
    category: "Tableware",
    price: 6500,
    compareAt: 8200,
    featured: true,
    colorLabel: "Glaze",
    description:
      "A dripper and carafe thrown in glazed stoneware, made to slow the morning down. The ribbed cone keeps the bloom even; the carafe holds the heat long after the last pour.",
    // The fully specified PDP fixture (README §6): 3 glazes × 3 sizes.
    variants: (
      [
        ["Sand", "#e8d9bd"],
        ["Terracotta", "#c67139"],
        ["Sage", "#7a8a5e"],
      ] as const
    ).flatMap(([color, colorHex]) =>
      ["20oz", "32oz", "48oz"].map((size) => ({
        color,
        colorHex,
        size,
        stock: size === "32oz" ? 6 : 2,
      })),
    ),
    specs: [
      ["Material", "Glazed stoneware"],
      ["Capacity", "32oz carafe"],
      ["Dimensions", '5.5" x 5.5" x 9"'],
      ["Weight", "2.1 lb"],
      ["Care", "Hand wash recommended"],
      ["Origin", "Made in Portugal"],
    ],
  },
  {
    name: "Sculpted Brass Vase",
    category: "Decor",
    price: 7000,
    newArrival: true,
    description:
      "Cast brass with a hand-rubbed finish that darkens gently with age. Holds a single stem or a loose armful.",
    variants: [{ stock: 18 }],
  },
  {
    name: "Cashmere Wrap Scarf",
    category: "Scarves",
    price: 11500,
    newArrival: true,
    colorLabel: "Colour",
    description:
      "Woven from Mongolian cashmere and left unbrushed for a fine, dry hand. Long enough to wrap twice.",
    variants: [
      { color: "Oat", colorHex: "#e3d6c0", stock: 3 },
      { color: "Rust", colorHex: "#a5552a", stock: 3 },
    ],
  },
  {
    name: "Botanical Bath Oil",
    category: "Bath & Body",
    price: 4600,
    newArrival: true,
    description:
      "Cold-pressed oils with lavender, chamomile and a little vetiver. A capful turns a bath into an evening.",
    variants: [{ stock: 44 }],
  },
  {
    name: "Woven Leather Tote",
    category: "Bags",
    price: 14200,
    newArrival: true,
    description:
      "Vegetable-tanned leather, hand-woven and unlined, with a soft structure that holds its shape without stiffness.",
    variants: [{ stock: 20 }],
  },
  {
    name: "Stoneware Mug Pair",
    category: "Tableware",
    price: 4600,
    description:
      "Two generous mugs in a speckled glaze, each one slightly different from the other.",
    variants: [{ stock: 40 }],
  },
  {
    name: "Fine Chain Necklace",
    category: "Necklaces",
    price: 6200,
    status: "DRAFT",
    description:
      "A barely-there chain in gold vermeil, made for layering or wearing alone.",
    variants: [{ stock: 0 }],
  },
  {
    name: "Wool Knit Throw Pillow",
    category: "Textiles",
    price: 5000,
    description:
      "Chunky hand-knit wool over a feather insert. Adds texture to any corner.",
    variants: [{ stock: 25 }],
  },
  {
    name: "Linen Loungewear Set",
    category: "Loungewear",
    price: 10500,
    description:
      "A relaxed shirt and drawstring trouser in washed linen, for long weekends at home.",
    variants: ["S", "M", "L"].map((size) => ({ size, stock: 5 })),
  },
];

/** The Ceramic Pour-Over Set's design reviews, newest first. */
const FEATURED_REVIEWS: [string, number, string, string][] = [
  [
    "Elena R.",
    5,
    "2026-07-14",
    "This has replaced our drip machine entirely. The glaze is gorgeous in person and it pours evenly every time.",
  ],
  [
    "Marcus T.",
    5,
    "2026-06-22",
    "Heavier and sturdier than I expected — feels like it will last decades. Shipping was fast too.",
  ],
  [
    "Priya N.",
    4,
    "2026-06-09",
    "Beautiful set. Only wish the dripper basket were slightly wider for coarser grinds.",
  ],
  [
    "Sam O.",
    5,
    "2026-05-17",
    "Bought this as a housewarming gift and ended up ordering a second for myself.",
  ],
];

/** Pads the fixture out to the design's histogram: 98/18/6/2/2 = 126. */
const RATING_COUNTS: Record<number, number> = {
  5: 98,
  4: 18,
  3: 6,
  2: 2,
  1: 2,
};
const FILLER_BODIES: Record<number, string[]> = {
  5: [
    "Lovely to use every morning.",
    "Exactly as pictured, beautifully made.",
    "Makes a better cup than my old machine.",
    "A real pleasure to own.",
  ],
  4: ["Very nice, a little heavier than I expected.", "Great set, slow pour."],
  3: ["Pretty, but the carafe lid sits loosely."],
  2: ["Arrived with a small chip; replacement was quick."],
  1: ["Not for me — too slow for a busy morning."],
};
const FILLER_NAMES = ["Alex", "Rumana", "Chris", "Tanvir", "Mia", "Farhan"];

/** Customers from the Admin Customers design (Jordan is `DEMO_CUSTOMER`). */
const CUSTOMERS = [
  ["Priya Nair", "priya@example.com", "2025-03-04"],
  ["Marcus Lee", "marcus@example.com", "2024-11-12"],
  ["Sofia Reyes", "sofia@example.com", "2026-07-02"],
  ["Tom Baker", "tom@example.com", "2025-02-18"],
  ["Elena Cho", "elena@example.com", "2024-09-25"],
  ["Owen Clarke", "owen@example.com", "2026-06-11"],
  ["Nina Patel", "nina@example.com", "2025-04-08"],
] as const;

/** Deterministic, so every reseed produces the same orders. */
function makeRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2 ** 31;
    return state / 2 ** 31;
  };
}

async function reset(): Promise<void> {
  // Children before parents; users are upserted, not deleted.
  await prisma.auditLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeSetting.deleteMany();
}

async function seedUsers() {
  const upsert = async (
    email: string,
    name: string,
    role: "CUSTOMER" | "ADMIN",
    password: string | null,
    createdAt?: Date,
  ) => {
    const passwordHash = password
      ? await argon2.hash(password, { type: argon2.argon2id })
      : null;
    return prisma.user.upsert({
      where: { email },
      update: { name, role, passwordHash },
      create: { email, name, role, passwordHash, createdAt },
    });
  };

  const admin = await upsert(ADMIN.email, ADMIN.name, "ADMIN", ADMIN.password);
  const jordan = await upsert(
    DEMO_CUSTOMER.email,
    DEMO_CUSTOMER.name,
    "CUSTOMER",
    DEMO_CUSTOMER.password,
    new Date("2025-01-15"),
  );
  // The rest exist for the admin screens; nobody signs in as them.
  const others = await Promise.all(
    CUSTOMERS.map(([name, email, joined]) =>
      upsert(email, name, "CUSTOMER", null, new Date(joined)),
    ),
  );

  return { admin, jordan, customers: [jordan, ...others] };
}

async function seedCategories(): Promise<Map<string, string>> {
  /** Both top-level slugs and child names resolve to an id. */
  const ids = new Map<string, string>();

  for (const [index, category] of CATEGORIES.entries()) {
    const parent = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        status: category.status ?? "ACTIVE",
        sortOrder: index,
      },
    });
    ids.set(category.slug, parent.id);

    for (const [childIndex, name] of category.children.entries()) {
      const child = await prisma.category.create({
        data: {
          slug: slugify(name),
          name,
          sortOrder: childIndex,
          parentId: parent.id,
        },
      });
      ids.set(name, child.id);
    }
  }

  return ids;
}

async function seedProducts(categoryIds: Map<string, string>) {
  const created = [];

  for (const [index, product] of PRODUCTS.entries()) {
    const slug = slugify(product.name);
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Unknown category ${product.category}`);

    const row = await prisma.product.create({
      data: {
        slug,
        name: product.name,
        description: product.description,
        categoryId,
        status: product.status ?? "ACTIVE",
        basePriceCents: tk(product.price),
        compareAtPriceCents: product.compareAt ? tk(product.compareAt) : null,
        isFeatured: product.featured ?? false,
        isNewArrival: product.newArrival ?? false,
        colorLabel: product.colorLabel ?? null,
        // Older products first, so "newest" sorts the new arrivals to the top.
        createdAt: new Date(
          Date.now() - (PRODUCTS.length - index) * 86_400_000 * 7,
        ),
        variants: {
          create: product.variants.map((variant, variantIndex) => ({
            sku: [
              slug.slice(0, 18),
              variant.color && slugify(variant.color),
              variant.size && slugify(variant.size),
            ]
              .filter(Boolean)
              .join("-")
              .toUpperCase(),
            color: variant.color ?? null,
            colorHex: variant.colorHex ?? null,
            size: variant.size ?? null,
            priceCents: tk(product.price),
            stockQty: variant.stock,
            sortOrder: variantIndex,
          })),
        },
        specs: {
          create: (product.specs ?? []).map(([label, value], sortOrder) => ({
            label,
            value,
            sortOrder,
          })),
        },
      },
      include: { variants: true },
    });
    created.push(row);
  }

  return created;
}

async function seedReviews(productId: string): Promise<void> {
  const rows: Prisma.ReviewCreateManyInput[] = FEATURED_REVIEWS.map(
    ([authorName, rating, date, body]) => ({
      productId,
      authorName,
      rating,
      body,
      status: "PUBLISHED",
      createdAt: new Date(date),
    }),
  );

  // Already counted: the four design reviews above.
  const remaining = { ...RATING_COUNTS, 5: 95, 4: 17 };
  let day = 0;
  for (const [ratingKey, count] of Object.entries(remaining)) {
    const rating = Number(ratingKey);
    const bodies = FILLER_BODIES[rating] ?? ["Good."];
    for (let i = 0; i < count; i += 1) {
      day += 1;
      rows.push({
        productId,
        authorName: `${FILLER_NAMES[i % FILLER_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}.`,
        rating,
        body: bodies[i % bodies.length],
        status: "PUBLISHED",
        // Older than the design reviews, so those lead the list.
        createdAt: new Date(Date.parse("2026-05-01") - day * 86_400_000),
      });
    }
  }

  await prisma.review.createMany({ data: rows });
}

const SAMPLE_ADDRESS = {
  firstName: "Jordan",
  lastName: "Avery",
  line1: "House 12, Road 4",
  line2: "Dhanmondi",
  city: "Dhaka",
  state: "Dhaka Division",
  postalCode: "1205",
  country: "Bangladesh",
  phone: "+880 1711-000000",
};

async function seedOrders(
  customers: { id: string; name: string; email: string }[],
  products: Awaited<ReturnType<typeof seedProducts>>,
): Promise<void> {
  const random = makeRandom(48_291);
  const sellable = products.filter((product) => product.status !== "DRAFT");
  const { flatRateCents, freeShippingThresholdCents } = DEFAULT_SETTINGS;

  // 60 orders over the last 60 days, so the dashboard has a current and a
  // previous 30-day period to compare. The newest eight reuse the design's
  // order numbers and statuses.
  const DESIGN_STATUSES = [
    "SHIPPED",
    "PROCESSING",
    "DELIVERED",
    "DELIVERED",
    "REFUNDED",
    "DELIVERED",
    "SHIPPED",
    "PROCESSING",
  ] as const;
  const COUNT = 60;

  for (let i = 0; i < COUNT; i += 1) {
    const number = String(48_291 - i);
    const customer = customers[i % customers.length];
    const placedAt = new Date(
      Date.now() - (i * 60 * 86_400_000) / COUNT - random() * 36e5 * 8,
    );
    const ageDays = (Date.now() - placedAt.getTime()) / 86_400_000;

    const status =
      DESIGN_STATUSES[i] ??
      (ageDays > 7
        ? random() < 0.08
          ? "REFUNDED"
          : "DELIVERED"
        : random() < 0.5
          ? "SHIPPED"
          : "PROCESSING");

    const lineCount = 1 + Math.floor(random() * 3);
    const lines = Array.from({ length: lineCount }, () => {
      const product = sellable[Math.floor(random() * sellable.length)];
      const variant =
        product.variants[Math.floor(random() * product.variants.length)];
      return { product, variant, qty: 1 + Math.floor(random() * 2) };
    });
    // One line per variant, as a real cart would produce.
    const unique = [
      ...new Map(lines.map((line) => [line.variant.id, line])).values(),
    ];

    const subtotalCents = unique.reduce(
      (sum, line) => sum + line.variant.priceCents * line.qty,
      0,
    );
    const shippingCents =
      subtotalCents >= freeShippingThresholdCents ? 0 : flatRateCents;
    const [firstName, ...rest] = customer.name.split(" ");

    // Never in the future: the newest orders were placed hours ago.
    const after = (days: number) =>
      new Date(Math.min(placedAt.getTime() + days * 86_400_000, Date.now()));
    const shippedAt = status === "PROCESSING" ? null : after(1);
    const deliveredAt =
      status === "DELIVERED" || status === "REFUNDED" ? after(4) : null;

    await prisma.order.create({
      data: {
        number,
        userId: customer.id,
        email: customer.email,
        customerName: customer.name,
        status,
        subtotalCents,
        shippingCents,
        taxCents: 0,
        totalCents: subtotalCents + shippingCents,
        currency: DEFAULT_SETTINGS.currency,
        shippingAddress: {
          ...SAMPLE_ADDRESS,
          firstName: firstName ?? customer.name,
          lastName: rest.join(" "),
        },
        paymentMethod: "Cash on delivery",
        placedAt,
        items: {
          create: unique.map(({ product, variant, qty }) => ({
            variantId: variant.id,
            nameSnapshot: product.name,
            variantSnapshot:
              [variant.color, variant.size].filter(Boolean).join(" · ") || null,
            productSlug: product.slug,
            unitPriceCents: variant.priceCents,
            qty,
          })),
        },
        shipment: shippedAt
          ? {
              create: {
                carrier: "Pathao Courier",
                trackingNumber: `PC${number}BD`,
                shippedAt,
                deliveredAt,
              },
            }
          : undefined,
      },
    });
  }
}

async function main(): Promise<void> {
  await reset();

  const { jordan, customers } = await seedUsers();
  const categoryIds = await seedCategories();
  const products = await seedProducts(categoryIds);

  const pourOver = products.find((p) => p.slug === "ceramic-pour-over-set")!;
  await seedReviews(pourOver.id);

  await prisma.storeSetting.createMany({
    data: Object.entries(
      DEFAULT_SETTINGS as unknown as Record<string, Prisma.InputJsonValue>,
    ).map(([key, value]) => ({ key, value })),
  });

  await prisma.address.createMany({
    data: [
      { ...SAMPLE_ADDRESS, userId: jordan.id, label: "Home", isDefault: true },
      {
        ...SAMPLE_ADDRESS,
        userId: jordan.id,
        label: "Work",
        line1: "Level 7, 32 Gulshan Avenue",
        line2: "Gulshan 1",
        postalCode: "1212",
      },
    ],
  });

  await prisma.wishlistItem.createMany({
    data: products
      .filter((p) => p.isNewArrival)
      .slice(0, 3)
      .map((p) => ({ userId: jordan.id, productId: p.id })),
  });

  await seedOrders(customers, products);

  console.log(
    [
      "Seeded.",
      `  Admin:    ${ADMIN.email} / ${ADMIN.password}  → http://localhost:3000/admin/login`,
      `  Customer: ${DEMO_CUSTOMER.email} / ${DEMO_CUSTOMER.password}`,
      "  Prices are PLACEHOLDER BDT — see README §6.",
    ].join("\n"),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
