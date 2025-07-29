// src/routes/properties/summary/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { propertyId } = params;
  return { propertyId };
};