/**
 * headScriptInjector.js
 *
 * Safely injects admin-pasted raw HTML/script snippets (Google Search Console
 * meta tag, GTM/Analytics script, Google Ads script, custom pixels, etc.)
 * into <head>, at runtime, without ever needing a code deploy.
 *
 * Why this exists:
 * - Browsers do NOT execute <script> tags that are inserted via innerHTML.
 *   So we parse the pasted snippet, then manually re-create each <script>
 *   node with document.createElement('script') and copy its attributes/text
 *   over, which DOES execute.
 * - Every injected node is tagged with a `data-injected-by` attribute so we
 *   can find and remove the previous version before injecting a new one
 *   (prevents duplicate GTM/Ads scripts stacking up on every save/reload).
 */

const ALLOWED_TAGS = new Set(['SCRIPT', 'META', 'LINK', 'NOSCRIPT', 'STYLE']);

/**
 * Removes any previously injected nodes for a given slot id.
 */
export function removeInjectedNodes(slotId) {
  document
    .querySelectorAll(`[data-injected-by="${slotId}"]`)
    .forEach((node) => node.remove());
}

/**
 * Parses a raw HTML string and injects each top-level tag into <head>.
 * Safe to call with empty/undefined input (no-op).
 *
 * @param {string} slotId - unique id for this injection slot (e.g. 'gsc-verification')
 * @param {string} rawHtml - the raw pasted snippet (meta tag, <script> block, etc.)
 */
export function injectRawHtml(slotId, rawHtml) {
  // Always clear out the previous version of this slot first.
  removeInjectedNodes(slotId);

  if (!rawHtml || !rawHtml.trim()) {
    return;
  }

  // <template> parses HTML without executing scripts or loading resources,
  // so this is a safe way to turn the string into real DOM nodes first.
  const template = document.createElement('template');
  template.innerHTML = rawHtml.trim();

  const nodes = Array.from(template.content.childNodes).filter(
    (node) => node.nodeType === Node.ELEMENT_NODE
  );

  nodes.forEach((node) => {
    const tagName = node.tagName;

    if (!ALLOWED_TAGS.has(tagName)) {
      // Ignore unexpected/disallowed tags rather than silently injecting
      // something unpredictable into <head>.
      console.warn(`[headScriptInjector] Ignored disallowed tag <${tagName.toLowerCase()}> in slot "${slotId}"`);
      return;
    }

    let elToAppend;

    if (tagName === 'SCRIPT') {
      // Must recreate the element for the browser to actually execute it.
      const script = document.createElement('script');
      Array.from(node.attributes).forEach((attr) => {
        script.setAttribute(attr.name, attr.value);
      });
      if (node.textContent) {
        script.textContent = node.textContent;
      }
      elToAppend = script;
    } else {
      // meta/link/noscript/style can be cloned directly.
      elToAppend = node.cloneNode(true);
    }

    elToAppend.setAttribute('data-injected-by', slotId);
    document.head.appendChild(elToAppend);
  });
}
