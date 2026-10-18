import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import {
  CURRENCIES,
  DEFAULT_SETTINGS,
  type SettingKey,
  type StoreSettings,
} from "./settings.defaults";

/** Rejects a stored value of the wrong type, so a bad row falls back to the default. */
function accepts(key: SettingKey, value: unknown): boolean {
  const fallback = DEFAULT_SETTINGS[key];
  if (key === "currency") {
    return CURRENCIES.includes(value as StoreSettings["currency"]);
  }
  if (typeof fallback === "number") {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
  }
  return typeof value === typeof fallback;
}

/** The subset of settings the storefront may see. */
export type PublicSettings = Pick<
  StoreSettings,
  | "storeName"
  | "supportEmail"
  | "currency"
  | "flatRateCents"
  | "freeShippingThresholdCents"
  | "internationalShipping"
>;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<StoreSettings> {
    const rows = await this.prisma.storeSetting.findMany();
    const settings: StoreSettings = { ...DEFAULT_SETTINGS };

    for (const { key, value } of rows) {
      if (key in DEFAULT_SETTINGS && accepts(key as SettingKey, value)) {
        // Narrowed by `accepts` — the value matches the default's type.
        (settings as unknown as Record<string, unknown>)[key] = value;
      }
    }

    return settings;
  }

  async getPublic(): Promise<PublicSettings> {
    const all = await this.getAll();
    return {
      storeName: all.storeName,
      supportEmail: all.supportEmail,
      currency: all.currency,
      flatRateCents: all.flatRateCents,
      freeShippingThresholdCents: all.freeShippingThresholdCents,
      internationalShipping: all.internationalShipping,
    };
  }

  /** Upserts only the keys given; returns the full, merged settings. */
  async update(patch: Partial<StoreSettings>): Promise<StoreSettings> {
    const entries = Object.entries(patch).filter(
      ([key, value]) => value !== undefined && key in DEFAULT_SETTINGS,
    );

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.storeSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );

    return this.getAll();
  }

  /** Flat rate below the threshold, free at or above it. */
  shippingFor(subtotalCents: number, settings: StoreSettings): number {
    if (subtotalCents === 0) return 0;
    return subtotalCents >= settings.freeShippingThresholdCents
      ? 0
      : settings.flatRateCents;
  }
}
