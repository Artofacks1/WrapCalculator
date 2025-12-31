// import React from 'react';
import Section from '@/components/landing/Section';
import CTAButton from '@/components/landing/CTAButton';
import Navigation from '@/components/layout/Navigation';

/**
 * Pricing page - Simple, clear pricing structure
 * Focuses on conversion with minimal friction
 * 
 * Requirements:
 * - Short plan cards (no long feature lists)
 * - Only 3 FAQ questions
 * - Mobile-first responsive
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="pricing" />

      {/* HEADER */}
      <Section>
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-hero-heading text-gray-900 mb-4">
            Simple plans for wrap pros.
          </h1>
          <p className="text-body-xl text-gray-700">
            Start free. Upgrade when you want presets and exports.
          </p>
        </div>
      </Section>

      {/* PRICING CARDS (short) */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* FREE Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <h3 className="text-section-heading text-gray-900 mb-2">FREE</h3>
              <div className="text-4xl font-bold text-gray-900 mb-8">$0</div>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Calculator access</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">3 confidence checks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-300 mr-3">✗</span>
                  <span className="text-body-base text-gray-500">No saves or exports</span>
                </li>
              </ul>
            </div>

            {/* PRO Plan */}
            <div className="bg-white rounded-xl border-2 border-teal-600 p-8 text-center relative">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-teal-600 text-white text-body-sm font-semibold rounded-full">
                  Popular
                </span>
              </div>
              <h3 className="text-section-heading text-gray-900 mb-2">PRO</h3>
              <div className="text-4xl font-bold text-teal-600 mb-2">$29</div>
              <p className="text-body-sm text-gray-600 mb-8">per month</p>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Save presets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Save quotes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Export PDFs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Unlimited confidence checks</span>
                </li>
              </ul>
              <CTAButton href="/calculator" className="w-full">Start Pro</CTAButton>
            </div>

            {/* SHOP Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <h3 className="text-section-heading text-gray-900 mb-2">SHOP</h3>
              <div className="text-4xl font-bold text-teal-600 mb-2">$59</div>
              <p className="text-body-sm text-gray-600 mb-8">per month</p>
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Add logo + shop info</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-3">✓</span>
                  <span className="text-body-base text-gray-700">Built for shop owners</span>
                </li>
              </ul>
              <CTAButton href="/calculator" className="w-full">Start Shop</CTAButton>
            </div>
          </div>
        </div>
      </Section>

      {/* PRICING FAQ (ONLY 3) */}
      <Section className="bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-12 text-center">Pricing FAQ</h2>
          <dl className="space-y-8">
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                Can I cancel anytime?
              </dt>
              <dd className="text-body-base text-gray-600">Yes.</dd>
            </div>
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                Do you offer yearly?
              </dt>
              <dd className="text-body-base text-gray-600">Coming soon.</dd>
            </div>
            <div>
              <dt className="text-small-heading text-gray-900 mb-2">
                What&apos;s the difference between Pro and Shop?
              </dt>
              <dd className="text-body-base text-gray-600">Shop adds branded exports.</dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="bg-gradient-to-br from-teal-50 via-blue-50 to-white">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-section-heading text-gray-900 mb-6">
            Try it free in minutes.
          </h2>
          <CTAButton href="/signup" className="text-lg px-10 py-5">
            Quote your Project
          </CTAButton>
        </div>
      </Section>

      {/* FOOTER */}
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
