// src/creChat.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

/** ────────────────────────────────────────────────────────────────────────────
 *  Tools: let the model call these with arguments it decides on.
 *  Keep descriptions concise but specific so the model knows when to use them.
 *  ────────────────────────────────────────────────────────────────────────────
 */
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
	// Existing calc tools (optional, keep if you use them)
	{
		type: 'function',
		function: {
			name: 'calc_cap_rate',
			description: 'Calculate capitalization rate given NOI and purchase price.',
			parameters: {
				type: 'object',
				properties: { noi: { type: 'number' }, price: { type: 'number' } },
				required: ['noi', 'price']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'calc_dscr',
			description: 'Debt Service Coverage Ratio = NOI / annual_debt_service.',
			parameters: {
				type: 'object',
				properties: { noi: { type: 'number' }, annual_debt_service: { type: 'number' } },
				required: ['noi', 'annual_debt_service']
			}
		}
	},

	// NEW: Demographics within rings of an address
	{
		type: 'function',
		function: {
			name: 'get_demographics_within_radius',
			description:
				'Demographic stats for concentric rings around an address (e.g., 1/3/5 miles): population, median age, income, rent, tenure, education, race/ethnicity share.',
			parameters: {
				type: 'object',
				properties: {
					address: { type: 'string', description: 'Street, city, state or full address.' },
					rings_miles: {
						type: 'array',
						items: { type: 'number' },
						description: 'Ring radii in miles, e.g., [1,3,5]'
					},
					year: { type: 'integer', description: 'ACS 5-year end year (e.g., 2023). Optional.' }
				},
				required: ['address', 'rings_miles']
			}
		}
	},

	// NEW: Jobs and commuting flows around a place
	{
		type: 'function',
		function: {
			name: 'get_jobs_and_commuting_flows',
			description:
				'Work ↔ home flows and industry mix around an address or geo. Returns inflow/outflow, job-worker balance, top OD flows, NAICS mix, commute time.',
			parameters: {
				type: 'object',
				properties: {
					address: { type: 'string', description: 'Street, city, state or full address. Optional if geoId provided.' },
					geoId: { type: 'string', description: 'Census tract/block group/county/CBSA. Optional if address provided.' },
					radius_miles: {
						type: 'number',
						description: 'Optional search radius for clustering flows.'
					},
					year: { type: 'integer', description: 'LODES/ACS reference year if supported. Optional.' }
				}
			}
		}
	},

	// NEW: Economy snapshot (labor, GDP, CPI, income)
	{
		type: 'function',
		function: {
			name: 'get_economy_snapshot',
			description:
				'Local macro snapshot around a location: unemployment, payroll jobs YoY, GDP per capita, median HH income, CPI YoY, permits if available.',
			parameters: {
				type: 'object',
				properties: {
					address: { type: 'string', description: 'Street, city, state or full address. Optional if geoId provided.' },
					geoId: { type: 'string', description: 'County/CBSA/state FIPS/CBSA code. Optional if address provided.' },
					prefer_msa: { type: 'boolean', description: 'Prefer CBSA if resolvable from address.' }
				}
			}
		}
	}
];

/** ────────────────────────────────────────────────────────────────────────────
 *  Tool Implementations (stubs): replace internals with your real services.
 *  Keep return shapes stable to avoid breaking prompts/clients.
 *  ────────────────────────────────────────────────────────────────────────────
 */
async function getDemographicsWithinRadius(
	address: string,
	rings_miles: number[],
	year?: number
): Promise<DemographicsResult> {
	// TODO: Geocode -> build rings -> intersect with Census geos -> aggregate ACS
	// Replace with your Lambda or service. Below is deterministic placeholder.
	const now = new Date().toISOString();
	const fake = (m: number) => ({
		miles: m,
		population: Math.max(500, Math.round(5000 * m + 3000 * Math.random())),
		medianAge: +(30 + 5 * Math.random()).toFixed(1),
		medianHouseholdIncome: Math.round(50000 + 25000 * Math.random()),
		households: Math.round(0.4 * (5000 * m)),
		medianGrossRent: Math.round(1200 + 400 * Math.random()),
		ownerOccRate: +(0.45 + 0.3 * Math.random()).toFixed(2),
		eduAttainmentPctBA: +(0.2 + 0.4 * Math.random()).toFixed(2),
		raceEthnicity: {
			white: +(0.3 + 0.5 * Math.random()).toFixed(2),
			black: +(0.05 + 0.15 * Math.random()).toFixed(2),
			asian: +(0.05 + 0.15 * Math.random()).toFixed(2),
			hispanic: +(0.1 + 0.25 * Math.random()).toFixed(2),
			other: +(0.05 + 0.15 * Math.random()).toFixed(2)
		}
	});

	return {
		address,
		geocoded: { lat: 0, lon: 0 }, // replace with real geocode
		rings: rings_miles.map(fake),
		asOf: now,
		sources: [`US Census ACS ${year ?? 2023} (aggregated)`]
	};
}

async function getJobsAndCommutingFlows(args: {
	address?: string;
	geoId?: string;
	radius_miles?: number;
	year?: number;
}): Promise<JobsAndCommutingResult> {
	const { address, geoId, radius_miles, year } = args;
	const now = new Date().toISOString();
	const inflow = 15000 + Math.round(5000 * Math.random());
	const outflow = 12000 + Math.round(4000 * Math.random());
	return {
		anchor: { address, geoId, name: 'Sample Area' },
		summary: {
			inflowJobs: inflow,
			outflowWorkers: outflow,
			jobToWorkerRatio: +(inflow / Math.max(1, outflow)).toFixed(2),
			medianCommuteMinutes: +(22 + 8 * Math.random()).toFixed(1)
		},
		topFlowsIn: [
			{
				origin: { geoId: '06037', name: 'Los Angeles County' },
				destination: { geoId: '06059', name: 'Orange County' },
				jobs: 3200
			},
			{
				origin: { geoId: '06059', name: 'Orange County' },
				destination: { geoId: '06059', name: 'Orange County' },
				jobs: 2900
			}
		],
		topFlowsOut: [
			{
				origin: { geoId: '06059', name: 'Orange County' },
				destination: { geoId: '06037', name: 'Los Angeles County' },
				jobs: 2700
			},
			{
				origin: { geoId: '06059', name: 'Orange County' },
				destination: { geoId: '06073', name: 'San Diego County' },
				jobs: 1800
			}
		],
		industryMix: [
			{ naics2: '44-45', name: 'Retail Trade', jobsShare: 0.16 },
			{ naics2: '62', name: 'Health Care & Social Assist.', jobsShare: 0.18 },
			{ naics2: '72', name: 'Accommodation & Food', jobsShare: 0.11 },
			{ naics2: '54', name: 'Professional Services', jobsShare: 0.12 }
		],
		asOf: now,
		sources: [`LEHD LODES ${year ?? 2021}`, `ACS ${year ?? 2023}`]
	};
}

async function getEconomySnapshot(args: {
	address?: string;
	geoId?: string;
	prefer_msa?: boolean;
}): Promise<EconomyResult> {
	const { address, geoId, prefer_msa } = args;
	const now = new Date().toISOString();
	return {
		anchor: {
			address,
			geoId,
			name: 'Sample Area',
			msa: prefer_msa ? 'Sample CBSA' : undefined,
			county: 'Sample County',
			state: 'CA'
		},
		unemploymentRate: +(0.035 + 0.03 * Math.random()).toFixed(3),
		unemploymentYoYChangePts: +(-0.4 + 0.8 * Math.random()).toFixed(2),
		payrollJobsYoY: +(-0.02 + 0.06 * Math.random()).toFixed(3),
		gdpPerCapita: Math.round(65000 + 15000 * Math.random()),
		medianHHIncome: Math.round(80000 + 20000 * Math.random()),
		cpiYoY: +(0.015 + 0.03 * Math.random()).toFixed(3),
		buildingPermitsYoY: +(-0.2 + 0.4 * Math.random()).toFixed(3),
		asOf: now,
		sources: ['BLS LAUS/SAE latest', 'BEA CAINC/GDP latest', 'ACS latest', 'BLS CPI-U']
	};
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Tool call router
 *  ────────────────────────────────────────────────────────────────────────────
 */
async function handleToolCall(name: string, args: any) {
	switch (name) {
		case 'calc_cap_rate': {
			const { noi, price } = args;
			const capRate = price ? noi / price : null;
			return { capRate, capRatePct: capRate == null ? null : +(capRate * 100).toFixed(2) };
		}
		case 'calc_dscr': {
			const { noi, annual_debt_service } = args;
			const dscr = annual_debt_service ? noi / annual_debt_service : null;
			return { dscr: dscr == null ? null : +dscr.toFixed(2) };
		}
		case 'get_demographics_within_radius': {
			const { address, rings_miles, year } = args;
			return await getDemographicsWithinRadius(address, rings_miles, year);
		}
		case 'get_jobs_and_commuting_flows': {
			return await getJobsAndCommutingFlows(args);
		}
		case 'get_economy_snapshot': {
			return await getEconomySnapshot(args);
		}
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Minimal moderation stub (toggle on real Moderations API if desired)
 *  ────────────────────────────────────────────────────────────────────────────
 */
async function passesModeration(_text: string) {
	return true;
}

/** ────────────────────────────────────────────────────────────────────────────
 *  Prompt: teach the model when to call which tool
 *  ────────────────────────────────────────────────────────────────────────────
 */
const SYSTEM_PROMPT = `
You are a senior Commercial Real Estate (CRE) analyst.

When a user asks about a location or market:
- If they want *people* and *household* info within 1/3/5 miles, call get_demographics_within_radius.
- If they want *jobs*, *commuting*, or *industry mix*, call get_jobs_and_commuting_flows.
- If they want *macro indicators* (unemployment, GDP per capita, CPI, income), call get_economy_snapshot.
- Combine tools when needed (e.g., demographics + economy).
- Always return units, define metrics, and provide short interpretation.
- Include "Not financial/legal advice." at the end when giving investment views.
`;

/** ────────────────────────────────────────────────────────────────────────────
 *  Chat entrypoint (unchanged pattern)
 *  ────────────────────────────────────────────────────────────────────────────
 */
export async function creChat(
	userMessage: string,
	history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
) {
	if (!(await passesModeration(userMessage))) {
		return 'Sorry—your message didn’t pass safety checks.';
	}

	let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{ role: 'system', content: SYSTEM_PROMPT },
		...history,
		{ role: 'user', content: userMessage }
	];

    console.log("Messages: ", messages);

	let completion = await openai.chat.completions.create({
		model: 'gpt-4o', // or your preferred model (e.g., gpt-5)
		messages,
		tools,
		tool_choice: 'auto'
	});


    console.log("Tools Completion: ", JSON.stringify(completion, null, 2));
	const toolCalls = completion.choices[0].message.tool_calls ?? [];
	if (toolCalls.length) {
		const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
		for (const call of toolCalls) {
			if (call.type !== 'function') continue;
			const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
			const result = await handleToolCall(call.function.name, args);
			toolMessages.push({
				role: 'tool',
				tool_call_id: call.id,
				content: JSON.stringify(result)
			});
		}


        console.log("completion.choices[0].message: ", JSON.stringify(completion.choices[0].message, null, 2));
        console.log("================================================")
        console.log("Tool Messages: ", JSON.stringify(toolMessages, null, 2));
		messages.push(completion.choices[0].message, ...toolMessages);

        console.log("Messages: ", JSON.stringify(messages, null, 2));

		completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages
		});
	}

	return completion.choices[0].message.content;
}

async function main() {
	// // 1) Demographics rings
    // const res = await creChat("Give me 1/3/5-mile demographics around 198 NE Combs Flat Rd, Prineville OR.");
    // console.log(res);

	// // 2) Jobs & commuting
	// const res = await creChat("Where do workers come from and what industries dominate near 350 5th Ave, NYC?");
	// console.log(res);

	// // 3) Economy snapshot
	// const res = await creChat("What does the local economy look like around 30301 (Atlanta)?");
	// console.log(res);

	// 4) Combined ask
	const res = await creChat("For 123 Main St, Austin TX—1/3/5-mile demographics, top job flows, and unemployment trend.");
	console.log(res);
}

main();