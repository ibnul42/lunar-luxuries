"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import { Dialog } from "@/components/ui/dialog";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Tabs } from "@/components/ui/tabs";

/** The stateful primitives, wired to local state so they can be exercised. */
export function InteractiveDemos() {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("32oz");
  const [glaze, setGlaze] = useState("sand");
  const [tab, setTab] = useState("description");
  const [segment, setSegment] = useState("general");
  const [dialog, setDialog] = useState<"center" | "sheet" | null>(null);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end gap-10">
        <div className="space-y-3">
          <p className="text-[13px] font-semibold">Quantity stepper</p>
          <QuantityStepper
            value={qty}
            onChange={setQty}
            max={5}
            label="Quantity"
          />
          <QuantityStepper
            value={qty}
            onChange={setQty}
            max={5}
            label="Quantity (small)"
            size="sm"
          />
        </div>
        <ChoiceGroup
          legend="Size"
          name="size"
          value={size}
          onChange={setSize}
          choices={[
            { value: "20oz", label: "20oz" },
            { value: "32oz", label: "32oz" },
            { value: "48oz", label: "48oz", disabled: true },
          ]}
        />
        <ChoiceGroup
          legend={`Glaze — ${glaze}`}
          name="glaze"
          variant="swatch"
          value={glaze}
          onChange={setGlaze}
          choices={[
            { value: "sand", label: "Sand", color: "#e8d9bd" },
            { value: "terracotta", label: "Terracotta", color: "#c67139" },
            { value: "sage", label: "Sage", color: "#7a8a5e" },
          ]}
        />
      </div>

      <Tabs
        label="Underline tabs"
        value={tab}
        onChange={setTab}
        tabs={[
          {
            id: "description",
            label: "Description",
            content: <p>Underline variant — product page.</p>,
          },
          {
            id: "details",
            label: "Details",
            content: <p>Arrow keys move between tabs.</p>,
          },
          {
            id: "reviews",
            label: "Reviews (126)",
            content: <p>Home / End jump to the ends.</p>,
          },
        ]}
      />

      <Tabs
        label="Segmented tabs"
        variant="segmented"
        value={segment}
        onChange={setSegment}
        tabs={[
          {
            id: "general",
            label: "General",
            content: <p>Segmented variant — admin settings.</p>,
          },
          {
            id: "shipping",
            label: "Shipping",
            content: <p>Shipping panel.</p>,
          },
          { id: "payment", label: "Payment", content: <p>Payment panel.</p> },
        ]}
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setDialog("center")}>
          Open dialog
        </Button>
        <Button variant="secondary" onClick={() => setDialog("sheet")}>
          Open sheet
        </Button>
      </div>
      <Dialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        variant={dialog ?? "center"}
        title={dialog === "sheet" ? "Sheet" : "Dialog"}
        description="Native <dialog> — focus trap, Escape and backdrop click for free."
      >
        <p className="text-[15px] text-muted">Content goes here.</p>
      </Dialog>
    </div>
  );
}
