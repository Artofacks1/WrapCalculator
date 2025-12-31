import React from 'react';
import Link from 'next/link';
import Section from '@/components/landing/Section';
import CTAButton from '@/components/landing/CTAButton';
import Navigation from '@/components/layout/Navigation';
import ComparisonTable from '@/components/landing/ComparisonTable';

/**
 * Landing page - Ultra-scan-friendly, conversion-focused
 * Clean structure with 8 sections following strict copy guidelines
 * 
 * Requirements:
 * - No long paragraphs (max 2 lines each)
 * - No section with more than 3 bullets
 * - Use outcomes over features
 * - Mobile-first responsive
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="home" />

      {/* SECTION 1 — HERO */}
      <Section className="bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-hero-heading text-gray-900 mb-6">
            Stop guessing wrap pricing.
          </h1>
          <p className="text-body-xl text-gray-700 mb-4">
            Quote wraps with confidence in under 60 seconds.
          </p>
          <p className="text-body-base text-gray-600 mb-8">
            Material estimates + real pricing math for wrap installers and shops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <CTAButton href="/signup">Quote your Project</CTAButton>
            <Link
              href="/pricing"
              className="text-body-base text-teal-600 hover:text-teal-700 font-semibold"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-body-sm text-gray-500">No credit card required.</p>
        </div>
      </Section>

      {/* SECTION 2 — WHAT IT DOES (3 bullets only) */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-8 text-center">
            WrapQuote helps you:
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-teal-600 font-bold text-sm">✓</span>
              </div>
              <p className="text-body-base text-gray-700">Estimate vinyl (sqft + linear feet)</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-teal-600 font-bold text-sm">✓</span>
              </div>
              <p className="text-body-base text-gray-700">Price jobs with labor, costs, and profit</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-teal-600 font-bold text-sm">✓</span>
              </div>
              <p className="text-body-base text-gray-700">Sanity-check your quote before you send it</p>
            </li>
          </ul>
        </div>
      </Section>

      {/* SECTION 3 — SCREENSHOT PLACEHOLDER */}
      <Section className="bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-16 md:p-24 flex items-center justify-center">
            <p className="text-body-base text-gray-500 text-center">App Screenshot</p>
          </div>
          <p className="text-body-sm text-gray-600 text-center mt-6 max-w-2xl mx-auto">
            Select the vehicle → choose the wrap → get material + pricing instantly.
          </p>
        </div>
      </Section>

      {/* SECTION 4 — BUILT FOR REAL WRAP JOBS */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-8 text-center">
            Built for real wrap jobs
          </h2>
          <ul className="space-y-3">
            <li className="text-body-base text-gray-700 text-center">Color change (solid vinyl installs)</li>
            <li className="text-body-base text-gray-700 text-center">Commercial print + install</li>
            <li className="text-body-base text-gray-700 text-center">Print-only or install-only quotes</li>
          </ul>
        </div>
      </Section>

      {/* SECTION 5 — WHY IT'S DIFFERENT (outcomes, not features) */}
      <Section className="bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-8 text-center">
            Why wrap pros use WrapQuote
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">→</span>
              </div>
              <p className="text-body-base text-gray-700">No under-ordering: waste + complexity built in</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">→</span>
              </div>
              <p className="text-body-base text-gray-700">No underpricing: labor, overhead, and profit shown clearly</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">→</span>
              </div>
              <p className="text-body-base text-gray-700">No second guessing: confidence check before you send</p>
            </li>
          </ul>
        </div>
      </Section>

      {/* SECTION 6 — COMPARISON TABLE */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-4 text-center">
            How WrapQuote compares
          </h2>
          <p className="text-body-base text-gray-600 mb-8 text-center">
            More capable than free calculators — without the complexity of full shop software.
          </p>
          <ComparisonTable />
          <p className="text-body-sm text-gray-500 text-center mt-6 max-w-2xl mx-auto">
            WrapQuote focuses on fast quoting + exports — not CRM, scheduling, or inventory.
          </p>
          <div className="text-center mt-8">
            <CTAButton href="/signup">Try the Calculator Free</CTAButton>
          </div>
        </div>
      </Section>

      {/* SECTION 7 — PRICING TEASER (very short) */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-12 text-center">
            Simple pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <h3 className="text-card-heading text-gray-900 mb-2">FREE</h3>
              <p className="text-body-base text-gray-700">Try the calculator</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-teal-600 p-6 text-center">
              <h3 className="text-card-heading text-gray-900 mb-2">PRO</h3>
              <p className="text-body-base text-gray-700">$29/mo: Save presets + export quotes</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <h3 className="text-card-heading text-gray-900 mb-2">SHOP</h3>
              <p className="text-body-base text-gray-700">$59/mo: Add logo + shop info</p>
            </div>
          </div>
          <div className="text-center">
            <CTAButton href="/pricing" variant="secondary">See Pricing</CTAButton>
          </div>
        </div>
      </Section>

      {/* SECTION 8 — FAQ (ONLY 3 questions) */}
      <Section className="bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-12 text-center">FAQ</h2>
          <dl className="space-y-8">
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                Are these exact measurements?
              </dt>
              <dd className="text-body-base text-gray-600">
                No—realistic estimates with adjustable waste.
              </dd>
            </div>
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                Does AI set my price?
              </dt>
              <dd className="text-body-base text-gray-600">
                No—AI only flags risk and what to double-check.
              </dd>
            </div>
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                Can I cancel anytime?
              </dt>
              <dd className="text-body-base text-gray-600">
                Yes. Manage billing in the portal.
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* SECTION 9 — FINAL CTA */}
      <Section className="bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-6">
            Quote wraps faster. Price them smarter.
          </h2>
          <CTAButton href="/signup" className="text-lg px-10 py-5">
            Quote your Project
          </CTAButton>
        </div>
      </Section>

      {/* FOOTER (tiny) */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-body-sm text-gray-400">
            Built for wrap installers and wrap shops.
          </p>
        </div>
      </footer>
    </div>
  );
}
