import { Card, CardBody } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatPrice } from "@/lib/utils";

/**
 * Dashboard skeleton. Tiles render the shape described in README §3; the
 * numbers are placeholders until the orders tables exist.
 */
// Placeholder figures, in poisha, kept internally consistent:
// 128_487_200 / 184 orders = 698_300 exactly.
const TILES = [
  { label: "Revenue (30d)", value: formatPrice(128_487_200), delta: "+12.4%" },
  { label: "Orders (30d)", value: "184", delta: "+8.1%" },
  { label: "New customers", value: "63", delta: "+2.9%" },
  { label: "Average order value", value: formatPrice(698_300), delta: "−1.2%" },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="kicker text-accent-700">Overview</p>
        <h1 className="font-display text-h2">Dashboard</h1>
      </header>

      <div className="grid gap-gutter sm:grid-cols-2 xl:grid-cols-4">
        {TILES.map((tile) => (
          <Card key={tile.label} elevation="panel">
            <CardBody className="space-y-2">
              <p className="text-[13px] font-semibold text-muted">
                {tile.label}
              </p>
              <p className="font-display text-3xl">{tile.value}</p>
              <p className="text-[13px] text-sage-700">
                {tile.delta} vs. previous period
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card elevation="panel">
        <CardBody className="space-y-4">
          <h2 className="font-display text-xl">Recent orders</h2>
          <p className="text-sm text-muted">
            Placeholder — wired up in Phase 1 alongside the Order model.
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusPill status="PROCESSING" />
            <StatusPill status="SHIPPED" />
            <StatusPill status="DELIVERED" />
            <StatusPill status="REFUNDED" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
