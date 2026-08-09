/**
 * Shared low-level helpers for all schema modules.
 * Kept in one place so no builder file re-implements pruning/validation logic.
 */

/**
 * Recursively removes null/undefined/empty-string/empty-array/empty-object
 * values so JSON-LD never renders an empty property.
 */
export function pruneEmpty(value) {
  if (Array.isArray(value)) {
    const cleaned = value.map(pruneEmpty).filter((v) => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (value && typeof value === 'object') {
    const result = {};
    Object.entries(value).forEach(([key, v]) => {
      const cleaned = pruneEmpty(v);
      if (cleaned !== undefined) result[key] = cleaned;
    });
    return Object.keys(result).length > 0 ? result : undefined;
  }

  if (value === null || value === undefined || value === '') return undefined;
  return value;
}

/**
 * Validates that a schema node is a JSON-serializable object with the
 * minimum required Schema.org keys before it is ever rendered.
 */
export function isValidSchema(schema) {
  if (!schema || typeof schema !== 'object') return false;
  if (!schema['@type']) return false;
  try {
    JSON.stringify(schema);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes the per-node "@context" key — used when multiple schema nodes
 * are combined into a single "@graph" array under one shared "@context".
 */
export function stripContext(schema) {
  if (!schema) return schema;
  const { '@context': _omit, ...rest } = schema;
  return rest;
}
