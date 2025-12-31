// import React from 'react';

/**
 * Comparison Table Component
 * Shows how WrapQuote compares to free calculators and full shop software
 * Responsive: table on desktop, cards on mobile
 */
export default function ComparisonTable() {
  const features = [
    {
      name: 'Material estimate (sqft + linear feet)',
      freeCalculators: true,
      fullShopSoftware: true,
      wrapQuote: true,
    },
    {
      name: 'Accounts for waste + complexity',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
    },
    {
      name: 'Pricing math (labor, overhead, profit)',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
    },
    {
      name: 'Color Change + Commercial Print',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
    },
    {
      name: 'Print-only + Install-only modes',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
    },
    {
      name: 'Save presets + quote history',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
      wrapQuoteNote: '(Pro+)',
    },
    {
      name: 'Export professional quotes (PDF)',
      freeCalculators: false,
      fullShopSoftware: true,
      wrapQuote: true,
      wrapQuoteNote: '(Pro+)',
    },
    {
      name: 'Pricing confidence check',
      freeCalculators: false,
      fullShopSoftware: false,
      wrapQuote: true,
    },
  ];

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-4 px-4 text-small-heading text-gray-900"></th>
              <th className="text-center py-4 px-4 text-small-heading text-gray-900">
                Free Calculators
              </th>
              <th className="text-center py-4 px-4 text-small-heading text-gray-900">
                Full Shop Software
              </th>
              <th className="text-center py-4 px-4 text-small-heading text-gray-900 bg-teal-50">
                WrapQuote
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="py-4 px-4 text-body-base text-gray-700">
                  {feature.name}
                </td>
                <td className="py-4 px-4 text-center">
                  {feature.freeCalculators ? (
                    <span className="text-teal-600 font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-gray-400 text-lg">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  {feature.fullShopSoftware ? (
                    <span className="text-teal-600 font-bold text-lg">✓</span>
                  ) : (
                    <span className="text-gray-400 text-lg">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center bg-teal-50">
                  {feature.wrapQuote ? (
                    <span className="text-teal-600 font-bold text-lg">
                      ✓{feature.wrapQuoteNote && (
                        <span className="text-body-sm font-normal text-gray-600 ml-1">
                          {feature.wrapQuoteNote}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-lg">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {/* Free Calculators Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-card-heading text-gray-900 mb-4 text-center">
            Free Calculators
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start justify-between">
                <span className="text-body-sm text-gray-700 flex-1 pr-2">
                  {feature.name}
                </span>
                {feature.freeCalculators ? (
                  <span className="text-teal-600 font-bold flex-shrink-0">✓</span>
                ) : (
                  <span className="text-gray-400 flex-shrink-0">—</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Full Shop Software Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-card-heading text-gray-900 mb-4 text-center">
            Full Shop Software
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start justify-between">
                <span className="text-body-sm text-gray-700 flex-1 pr-2">
                  {feature.name}
                </span>
                {feature.fullShopSoftware ? (
                  <span className="text-teal-600 font-bold flex-shrink-0">✓</span>
                ) : (
                  <span className="text-gray-400 flex-shrink-0">—</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* WrapQuote Card */}
        <div className="bg-teal-50 rounded-xl border-2 border-teal-600 p-6">
          <h3 className="text-card-heading text-gray-900 mb-4 text-center">
            WrapQuote
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start justify-between">
                <span className="text-body-sm text-gray-700 flex-1 pr-2">
                  {feature.name}
                  {feature.wrapQuoteNote && (
                    <span className="text-body-sm text-gray-600 ml-1">
                      {feature.wrapQuoteNote}
                    </span>
                  )}
                </span>
                {feature.wrapQuote ? (
                  <span className="text-teal-600 font-bold flex-shrink-0">✓</span>
                ) : (
                  <span className="text-gray-400 flex-shrink-0">—</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

