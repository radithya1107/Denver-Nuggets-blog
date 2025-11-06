"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { computeTCO } from "@/lib/formulas";
import { defaults, schema } from "@/lib/validation";

type FormState = z.infer<typeof schema>;

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-xl border border-gray-200/70 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {subtext ? <div className="mt-1 text-xs text-gray-500">{subtext}</div> : null}
    </div>
  );
}

function NumberInput(props: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  helper?: string;
  suffix?: string;
}) {
  const { label, value, onChange, step = 1, min = 0, helper, suffix } = props;
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-gray-900"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="text-xs text-gray-600">{suffix}</span> : null}
      </div>
      {helper ? <span className="mt-1 block text-xs text-gray-500">{helper}</span> : null}
    </label>
  );
}

function ToggleAdvanced({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
      aria-expanded={open}
    >
      {open ? "Hide Advanced" : "Show Advanced"}
    </button>
  );
}

export default function Page() {
  const [form, setForm] = useState<FormState>(defaults);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const parsed = useMemo(() => schema.safeParse(form), [form]);

  const results = useMemo(() => {
    if (!parsed.success) return null;
    return computeTCO({
      years: form.years,
      annualMileage: form.annualMileage,
      evPrice: form.evPrice,
      evIncentive: form.evIncentive,
      gasPrice: form.gasPrice,
      cEV: form.cEV,
      cGas: form.cGas,
      maintDeltaPerYear: form.maintDeltaPerYear,
      resalePctEV: form.resalePctEV,
      resalePctGas: form.resalePctGas,
    });
  }, [parsed, form]);

  // badge
  const diffBadge =
    results &&
    (results.diffTCO < 0 ? (
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        EV saves {formatCurrency(Math.abs(results.diffTCO))}
      </span>
    ) : results && results.diffTCO > 0 ? (
      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
        EV costs {formatCurrency(Math.abs(results.diffTCO))} more
      </span>
    ) : (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">Break-even</span>
    ));

  return (
    <main className="container mx-auto max-w-6xl p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">EV vs Gas — Total Cost of Ownership</h1>
        <p className="mt-2 text-sm text-slate-600">
          Model key variables to compare ownership outcomes over your selected period.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[360px_1fr]">
        <div className="card-soft p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">⚙️</span>
            <h2 className="text-lg font-semibold">Core Inputs</h2>
          </div>
          <div className="mt-4 grid gap-4">
            <NumberInput
              label="Annual mileage"
              value={form.annualMileage}
              onChange={(v) => setForm({ ...form, annualMileage: v })}
              step={100}
              min={0}
              suffix="km / year"
            />
            <NumberInput
              label="EV price (before incentive)"
              value={form.evPrice}
              onChange={(v) => setForm({ ...form, evPrice: v })}
              step={1000}
              min={0}
              suffix="currency"
            />
            <NumberInput
              label="Gas price"
              value={form.gasPrice}
              onChange={(v) => setForm({ ...form, gasPrice: v })}
              step={1000}
              min={0}
              suffix="currency"
            />
            <NumberInput
              label="EV incentive / subsidy"
              value={form.evIncentive}
              onChange={(v) => setForm({ ...form, evIncentive: v })}
              step={500}
              min={0}
              helper="Applied once to EV upfront cost"
              suffix="currency"
            />
            <NumberInput
              label="EV energy cost per km"
              value={form.cEV}
              onChange={(v) => setForm({ ...form, cEV: v })}
              step={0.1}
              min={0}
              suffix="currency/km"
            />
            <NumberInput
              label="Gas energy cost per km"
              value={form.cGas}
              onChange={(v) => setForm({ ...form, cGas: v })}
              step={0.1}
              min={0}
              suffix="currency/km"
            />
            <NumberInput
              label="Annual maintenance delta (EV − Gas)"
              value={form.maintDeltaPerYear}
              onChange={(v) => setForm({ ...form, maintDeltaPerYear: v })}
              step={500}
              helper="Negative means EV is cheaper per year"
              suffix="currency/year"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <ToggleAdvanced open={showAdvanced} onToggle={() => setShowAdvanced((s) => !s)} />
          </div>

          {showAdvanced && (
            <div className="mt-4 grid gap-4">
              <NumberInput
                label="EV resale at 5 years"
                value={form.resalePctEV}
                onChange={(v) => setForm({ ...form, resalePctEV: v })}
                step={1}
                min={0}
                suffix="% of EV price"
              />
              <NumberInput
                label="Gas resale at 5 years"
                value={form.resalePctGas}
                onChange={(v) => setForm({ ...form, resalePctGas: v })}
                step={1}
                min={0}
                suffix="% of Gas price"
              />
              <NumberInput
                label="Ownership period"
                value={form.years}
                onChange={(v) => setForm({ ...form, years: v })}
                step={1}
                min={1}
                suffix="years"
              />
            </div>
          )}

          {!parsed.success && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-rose-700">
              {parsed.error.issues.map((i, idx) => (
                <li key={idx}>{i.path.join(".")}: {i.message}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-6">
          <div className="card-soft p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Summary</h2>
              <div className="text-sm text-slate-700">{diffBadge}</div>
            </div>
            {results ? (
              <>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Stat label="5-Year TCO (EV)" value={formatCurrency(results.tcoEV)} subtext="After incentive & resale" />
                  <Stat label="5-Year TCO (Gas)" value={formatCurrency(results.tcoGas)} subtext="After resale" />
                  <Stat label="Difference (EV − Gas)" value={formatCurrency(results.diffTCO)} subtext={results.kmTotal.toLocaleString() + " km total"} />
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Cost/km — EV: <span className="font-medium">{formatCurrency(results.cpkEV)}</span> · Gas: <span className="font-medium">{formatCurrency(results.cpkGas)}</span>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Fix the input errors to see results.</p>
            )}
          </div>

          {results && (
            <div className="card-soft p-6">
              <h3 className="text-sm font-semibold text-slate-800">Cost Difference Over Time</h3>
              <BarChart years={form.years} ev={results.tcoEV} gas={results.tcoGas} />
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-slate-800">Show cost breakdown</summary>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <BreakdownCard
                    title="EV"
                    items={[["Upfront (after incentive)", results.upfrontEV],["Energy (total)", results.energyEV],["Maint. delta (total)", results.maintDelta],["Resale (5y)", -results.resaleEV]]}
                    total={results.tcoEV}
                  />
                  <BreakdownCard
                    title="Gas"
                    items={[["Upfront", results.upfrontGas],["Energy (total)", results.energyGas],["Maint. baseline", 0],["Resale (5y)", -results.resaleGas]]}
                    total={results.tcoGas}
                  />
                </div>
              </details>
            </div>
          )}

          <p className="text-xs text-slate-500">
            Notes: Maintenance delta is EV annual maintenance minus Gas annual maintenance (can be negative). Energy cost per km already incorporates unit price × consumption.
          </p>
        </div>
      </div>
    </main>
  );
}

function BreakdownCard({
  title,
  items,
  total,
}: {
  title: string;
  items: Array<[string, number]>;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200/70 p-4">
      <div className="text-sm font-semibold">{title} breakdown</div>
      <ul className="mt-3 space-y-2">
        {items.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{k}</span>
            <span className="font-medium">{formatCurrency(v)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t pt-3 text-sm">
        <span className="text-gray-600">Total</span>
        <span className="float-right font-semibold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

function BarChart({ years, ev, gas }: { years: number; ev: number; gas: number }) {
  const max = Math.max(ev, gas) || 1;
  const bars = Array.from({ length: years }, (_, i) => i + 1);
  return (
    <div className="mt-4">
      <div className="h-52 w-full rounded-lg border border-slate-200 p-3">
        <div className="flex h-full items-end gap-2">
          {bars.map((y) => {
            const evH = (ev / max) * 100;
            const gasH = (gas / max) * 100;
            return (
              <div key={y} className="flex w-full max-w-[18px] flex-col items-center gap-1">
                <div className="flex w-full items-end gap-1">
                  <div className="h-full w-1/2 rounded-sm bg-emerald-500" style={{ height: `${evH}%` }} />
                  <div className="h-full w-1/2 rounded-sm bg-indigo-500" style={{ height: `${gasH}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">{y}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> EV</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-indigo-500" /> Gas</span>
      </div>
    </div>
  );
}

function formatCurrency(n: number) {
  // Currency-agnostic formatting. Change locale/currency if desired.
  // Using compact formatting for large values improves readability.
  try {
    const fmt = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    });
    return fmt.format(isFinite(n) ? Math.round(n) : 0);
  } catch {
    return String(Math.round(n));
  }
}

