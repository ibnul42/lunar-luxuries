import { Controller, Get } from "@nestjs/common";

import { type PublicSettings, SettingsService } from "./settings.service";

@Controller("store")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** What the storefront shows — store name, shipping thresholds. */
  @Get()
  get(): Promise<PublicSettings> {
    return this.settings.getPublic();
  }
}
