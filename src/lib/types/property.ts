export interface Property {
  id: string;
  address: string;
  thumbnailUrl?: string;
  statusTags: string[];
  stats?: string[];
  cap?: string;
  grm?: string;
  date: string;
  isDraft?: boolean;
  onFinishDraft?: () => void;
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