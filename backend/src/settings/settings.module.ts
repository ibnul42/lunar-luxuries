import { Global, Module } from "@nestjs/common";

import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

/** Global: cart, orders and admin all read the shipping settings. */
@Global()
@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
