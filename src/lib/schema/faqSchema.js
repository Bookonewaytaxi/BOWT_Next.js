import { pruneEmpty } from './schemaUtils';

/**
 * Builds a Schema.org FAQPage node from a list of { question, answer } pairs.
 *
 * This is intentionally generic (not route-specific) so it can be reused
 * by both the existing Home page FAQ (in a future refactor, not part of
 * this module) and route pages, without duplicating FAQ schema logic.
 *
 * Route pages do not have real FAQ content yet — `routes.custom_faqs`
 * does not exist as a column (Module E — Dynamic FAQ Engine — is not built).
 * Calling this with an empty/undefined list safely returns null; nothing
 * is fabricated.
 */
export function buildFaqSchema(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  const mainEntity = faqs
    .filter((faq) => faq && faq.question && faq.answer)
    .map((faq) =>
      pruneEmpty({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })
    );

  if (mainEntity.length === 0) return null;

  return {
    '@type': 'FAQPage',
    mainEntity,
  };
}
