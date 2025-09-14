/** ────────────────────────────────────────────────────────────────────────────
 *  Types the model will see in tool JSON (great for reliability & few-shot)
 *  Replace fields or add more as your data sources evolve.
 *  ────────────────────────────────────────────────────────────────────────────
 */
export type DemographicsRing = {
	miles: number;
	population: number | null;
	medianAge: number | null;
	medianHouseholdIncome: number | null;
	households: number | null;
	medianGrossRent: number | null;
	ownerOccRate: number | null; // 0–1
	eduAttainmentPctBA: number | null; // % age 25+ with BA or higher (0–1)
	raceEthnicity?: {
		white: number | null;
		black: number | null;
		asian: number | null;
		hispanic: number | null;
		other: number | null; // 0–1 shares
	};
};

export type DemographicsResult = {
	address: string;
	geocoded: { lat: number; lon: number } | null;
	rings: DemographicsRing[];
	asOf: string; // ISO date
	sources: string[]; // e.g., ["US Census ACS 5-year 2023"]
};

export type JobsODFlow = {
	origin: { geoId: string; name: string };
	destination: { geoId: string; name: string };
	jobs: number;
};

export type JobsIndustryMix = { naics2: string; name: string; jobsShare: number }; // 0–1
export type JobsCommuteSummary = {
	inflowJobs: number;
	outflowWorkers: number;
	jobToWorkerRatio: number | null;
	medianCommuteMinutes: number | null;
};

export type JobsAndCommutingResult = {
	anchor: { address?: string; geoId?: string; name?: string };
	summary: JobsCommuteSummary;
	topFlowsIn: JobsODFlow[]; // top origins of inbound workers
	topFlowsOut: JobsODFlow[]; // top destinations where residents work
	industryMix: JobsIndustryMix[];
	asOf: string;
	sources: string[]; // e.g., ["LEHD LODES 2021", "ACS 2023"]
};

export type EconomyResult = {
	anchor: {
		address?: string;
		geoId?: string;
		name?: string;
		msa?: string;
		county?: string;
		state?: string;
	};
	unemploymentRate: number | null; // 0–1
	unemploymentYoYChangePts: number | null;
	payrollJobsYoY: number | null; // % change, -1..+1
	gdpPerCapita: number | null; // e.g., USD
	medianHHIncome: number | null; // USD
	cpiYoY: number | null; // % change, -1..+1 (national or regional CPI-U)
	buildingPermitsYoY: number | null; // optional
	asOf: string;
	sources: string[]; // ["BLS LAUS 2024-12", "BEA 2023", "ACS 2023", ...]
};