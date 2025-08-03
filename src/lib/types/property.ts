export interface Property {
  id: string;
  address?: string;
  assetType?: string;
  city?: string;
  country?: string;
  name?: string;
  state?: string;
  zip?: string;
  createdAt?: string;
  thumbnailUrl?: string;
}

export interface CompsComparisonRow {
  label: string;
  salePrice: string;
  units: number | string;
  rsf: string;
  ybYr: string;
  perUnit: string;
  perSf: string;
  cap: string;
  grm: string;
  avgUnitSf: number | string;
}

/** One row of the op‐statement */
export interface OperatingRow {
  label: string;
  current: string;
  perUnitCurrent: string;
  perSfCurrent: string;
  proforma: string;
  perUnitProforma: string;
  perSfProforma: string;
} 