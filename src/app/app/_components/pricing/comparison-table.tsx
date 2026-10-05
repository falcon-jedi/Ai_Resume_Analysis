import { IconMapper } from '@/app/_components/icons/IconMapper';
import React from 'react';
import type {
  ComparisonFeatureResponse,
  PricingPlanResponse,
} from '@/app/api/model/response/pricing';

interface ComparisonTableProps {
  plans: PricingPlanResponse[];
  comparison: ComparisonFeatureResponse[];
}

export function ComparisonTable({ plans, comparison }: ComparisonTableProps) {
  const columnCount = plans.length + 1;

  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="font-['Playfair_Display'] text-[32px] leading-[40px] font-semibold text-center mb-12 text-[#5b060c]">
        Feature Ledger
      </h2>
      <div className="sheet-bg sheet-shadow border border-[#ddc0bd] rounded-lg overflow-hidden">
        {/* Header Row */}
        <div
          className="grid p-6 bg-[#fff0ed] border-b-2 border-[#8a716f] font-['Hanken_Grotesk'] text-[14px] leading-[20px] tracking-[0.05em] font-semibold text-[#5b060c] tracking-wider uppercase"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          <div className="col-span-1">Feature</div>
          {plans.map((plan) => (
            <div key={plan.id} className="text-center">
              {plan.name}
            </div>
          ))}
        </div>

        {/* Comparison Ledger Rows */}
        <div className="divide-y divide-[#ddc0bd]/30">
          {comparison.map((row) => (
            <div
              key={row.id}
              className="grid p-6 hover:bg-[#fff0ed]/50 transition-colors items-center"
              style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
            >
              <div className="col-span-1 font-medium text-[#2b1611]">{row.title}</div>
              {plans.map((plan) => {
                const val =
                  (row.values && typeof row.values === 'object'
                    ? row.values[plan.slug]
                    : undefined) || '—';
                return (
                  <div
                    key={plan.id}
                    className="text-center text-[#564240] text-sm flex justify-center items-center"
                  >
                    {val === 'check' ? (
                      <IconMapper
                        name="check_circle"
                        className="text-[#5b060c] text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      />
                    ) : (
                      val
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
