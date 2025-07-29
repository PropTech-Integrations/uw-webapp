// src/routes/properties/summary/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { propertyId } = params;
  // now slug === "c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de"
  return { propertyId };
};