import React from 'react';

/**
 * Each city's description comes from ONE shared row in `city_profiles`
 * (see CityContentService.js) — reused across every route that touches
 * that city, never duplicated per-route.
 */
export default function CityInfoSection({ fromCity, toCity, fromCityProfile, toCityProfile }) {
  const hasFrom = Boolean(fromCityProfile?.description);
  const hasTo = Boolean(toCityProfile?.description);

  if (!hasFrom && !hasTo) return null;

  return (
    <section id="city-info" aria-labelledby="city-info-heading" className="scroll-mt-24">
      <h2 id="city-info-heading" className="text-2xl font-bold mb-6 text-slate-900">
        About {fromCity} &amp; {toCity}
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {hasFrom && (
          <article aria-labelledby="about-pickup-heading" className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 id="about-pickup-heading" className="font-bold text-lg mb-2 text-slate-900">
              About {fromCity}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{fromCityProfile.description}</p>
          </article>
        )}
        {hasTo && (
          <article aria-labelledby="about-destination-heading" className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 id="about-destination-heading" className="font-bold text-lg mb-2 text-slate-900">
              About {toCity}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{toCityProfile.description}</p>
          </article>
        )}
      </div>
    </section>
  );
}
