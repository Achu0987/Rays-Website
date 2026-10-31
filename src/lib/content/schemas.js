/**
 * Content model contract (docs/CONTENT_WRITING.md "CMS content schemas").
 * JSDoc typedefs stand in for TypeScript types; a CMS adapter (Sanity or Payload,
 * pending approval) must return objects in these shapes.
 */

/** Factual control labels; only VERIFIED content may render as final copy. */
export const VERIFICATION_STATUS = Object.freeze({
  VERIFIED: "verified",
  NEEDS_CONFIRMATION: "needs-ray-confirmation",
  EDITORIAL_DRAFT: "editorial-draft",
  FUTURE_POSSIBILITY: "future-possibility",
});

/** Publishing workflow; Draft and Fact-check needed are never published automatically. */
export const APPROVAL_STATUS = Object.freeze({
  DRAFT: "draft",
  FACT_CHECK_NEEDED: "fact-check-needed",
  LEGAL_RIGHTS_REVIEW: "legal-rights-review",
  APPROVED: "approved",
  PUBLISHED: "published",
});

/**
 * @typedef {Object} Person
 * @property {string} canonicalName
 * @property {string} preferredName
 * @property {string} bioShort
 * @property {string} bioLong
 * @property {MediaAsset} [portrait]
 * @property {{label: string, url: string}[]} socials
 * @property {string[]} sameAs
 * @property {string} updatedAt ISO date
 */

/**
 * @typedef {Object} TimelineEvent
 * @property {string} title
 * @property {string} date ISO date, truncated to datePrecision
 * @property {"day"|"month"|"year"|"approximate"} datePrecision
 * @property {string} [location]
 * @property {string} description
 * @property {MediaAsset[]} images
 * @property {string} verificationStatus one of VERIFICATION_STATUS
 * @property {string} [sourceNotes]
 * @property {"public"|"hidden"} visibility
 */

/**
 * @typedef {Object} Venture
 * @property {string} name
 * @property {string} slug
 * @property {string} role
 * @property {string} [launchDate]
 * @property {string} status
 * @property {string} sector
 * @property {string} description
 * @property {string[]} verifiedLinks
 * @property {MediaAsset} [logo]
 * @property {MediaAsset[]} media
 * @property {string} [proof]
 * @property {boolean} featured
 */

/**
 * @typedef {Object} Article
 * @property {string} title
 * @property {string} slug
 * @property {string} dek
 * @property {unknown} body sanitized rich text
 * @property {string} topic
 * @property {string[]} tags
 * @property {MediaAsset} [cover]
 * @property {string} author
 * @property {string} publishedAt
 * @property {string} [updatedAt]
 * @property {{title?: string, description?: string}} [seo]
 */

/**
 * @typedef {Object} Experience
 * @property {"boxing"|"travel"|"writing"} type
 * @property {string} title
 * @property {string} [location]
 * @property {{start?: string, end?: string}} [dates]
 * @property {string} story
 * @property {MediaAsset[]} media
 * @property {string[]} relatedContent slugs
 */

/**
 * @typedef {Object} Media
 * @property {"video"|"audio"|"article"|"talk"} format
 * @property {string} title
 * @property {string} date
 * @property {string} provider
 * @property {string} [embedUrl]
 * @property {string} [transcript]
 * @property {string} rights
 */

/**
 * @typedef {Object} Quote
 * @property {string} text
 * @property {string} source
 * @property {string} approvalStatus one of APPROVAL_STATUS
 */

/**
 * @typedef {Object} MediaAsset
 * @property {string} src
 * @property {string} alt
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} rights provenance / licence note
 */
