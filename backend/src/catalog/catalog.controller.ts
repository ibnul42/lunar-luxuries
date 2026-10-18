import { Controller, Get, Param, Query } from "@nestjs/common";

import { PageQuery, ProductListQuery } from "./catalog.dto";
import { CatalogService } from "./catalog.service";

/** Public, read-only. Drafts and hidden categories never leave this module. */
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("categories")
  categories() {
    return this.catalog.categories();
  }

  @Get("products")
  list(@Query() query: ProductListQuery) {
    return this.catalog.list(query);
  }

  @Get("products/:slug")
  detail(@Param("slug") slug: string) {
    return this.catalog.detail(slug);
  }

  @Get("products/:slug/reviews")
  reviews(@Param("slug") slug: string, @Query() query: PageQuery) {
    return this.catalog.reviews(slug, query.page);
  }

  @Get("products/:slug/related")
  related(@Param("slug") slug: string) {
    return this.catalog.related(slug);
  }
}
