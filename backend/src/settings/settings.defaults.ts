/**
 * Every store setting, with its default. README §5 lists the keys; README §6
 * gives the defaults. `StoreSetting` rows override these one key at a time, so
 * a missing row is never an error.
 *
 * The two shipping amounts are PLACEHOLDER BDT (README §6 — the design's $8 /
 * $75 are USD and are not valid taka figures).
 */
export const CURRENCIES = ["BDT", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: Currency;
  timezone: string;
  /** Minor units. */
  flatRateCents: number;
  /** Minor units. An order at or above this ships free. */
  freeShippingThresholdCents: number;
  internationalShipping: boolean;
  payCards: boolean;
  payGoogle: boolean;
  payApple: boolean;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Lunar Luxuries",
  supportEmail: "hello@lunarluxuries.com",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  flatRateCents: 150_00,
  freeShippingThresholdCents: 5_000_00,
  internationalShipping: true,
  payCards: true,
  payGoogle: true,
  payApple: false,
};

export type SettingKey = keyof StoreSettings;
