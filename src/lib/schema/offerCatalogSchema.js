import { pruneEmpty } from './schemaUtils';
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';

/**
 * Maps each vehicle constant (name/capacity — reused from the SAME constants
 * file VehiclePriceTable.jsx already uses) to the matching price field already
 * present on the route object (normalized by RouteService: suv_6_price,
 * suv_7_price, premium_suv_price, sedan_price).
 *
 * No vehicle name or capacity is re-hardcoded here.
 */
const PRICE_FIELD_BY_TYPE_KEY = {
  sedan: 'sedan_price',
  suv6: 'suv_6_price',
  suv7: 'suv_7_price',
  crysta: 'premium_suv_price',
};

/**
 * Builds a Schema.org OfferCatalog listing every vehicle that has a real,
 * positive price on this route. Vehicles with no price (0/null/undefined)
 * are skipped — never rendered with a fabricated price.
 */
export function buildOfferCatalogSchema(route) {
  if (!route) return null;

  const items = VEHICLE_TYPES_CONSTANTS.map((vehicle) => {
    const priceField = PRICE_FIELD_BY_TYPE_KEY[vehicle.type_key];
    const price = Number(route[priceField]);

    if (!priceField || isNaN(price) || price <= 0) return null;

    return pruneEmpty({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: vehicle.name,
        description: vehicle.description,
      },
      price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    });
  }).filter(Boolean);

  if (items.length === 0) return null;

  return {
    '@type': 'OfferCatalog',
    name: 'Vehicle Options',
    itemListElement: items,
  };
}
