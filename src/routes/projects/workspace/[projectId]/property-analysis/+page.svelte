<script lang="ts">
	import Sidebar from '$lib/components/properties/sidebar/Sidebar.svelte';
	import PropertyHeader from '$lib/components/properties/PropertyHeader.svelte';
	import PropertyInfo from '$lib/components/properties/PropertyInfo.svelte';
	import MetricsPanel from '$lib/components/properties/MetricsPanel.svelte';
	import AcquisitionSale from '$lib/components/properties/AcquisitionSale.svelte';
	import CompsComparison from '$lib/components/properties/CompsComparison.svelte';
	import type { CompsComparisonRow } from '$lib/types/property';
	import LoanInfo from '$lib/components/properties/LoanInfo.svelte';
	import RentRollTotals from '$lib/components/properties/RentRollTotals.svelte';
	import OperatingStatement from '$lib/components/properties/OperatingStatement.svelte';
	import type { OperatingRow } from '$lib/types/property';
	import SpeedometerCard from '$lib/components/SpeedometerCard/index.svelte';
	import KeyValueTable from '$lib/components/tables/KeyValueTable.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';

	// Mock data shape
	interface PropertyInfoData {
		price: string;
		units: number;
		unitMix: string[];
		pricePerUnit: string;
		pricePerSF: string;
		ybYr: string;
		buildingSize: string;
		bedrooms: number;
	}

	interface MetricsData {
		cap: { current: string; proforma: string };
		grm: { current: string; proforma: string };
		coc: { current: string; proforma: string };
		upside: string;
		irr: { current: string; target: string };
		equityMultiple: { current: string; target: string };
		roe: { current: string; target: string };
		roi: string;
		priceEstimate: {
			low: string;
			mid: string;
			high: string;
		};
	}

	interface DecisionCriterion {
		label: string;
		current: string;
		target: string;
	}

	interface AcquisitionData {
		holdTerm: string;
		exitCap: string;
		workingCapital: string;
		acquisitionDate: string;
		totalCashToClose: string;
		totalAcquisitionCosts: string;
		decisionCriteria: DecisionCriterion[];
	}

	interface Property {
		id: string;
		address: string;
		statusTags: string[];
		info: PropertyInfoData;
		metrics: MetricsData;
		acquisition: AcquisitionData;
	}

	// Example static fetch
	const property: Property = {
		id: "1",
		address: '9404 West Rd, Houston, TX 77064, USA',
		statusTags: [],
		info: {
			price: '$858,139,130',
			units: 280,
			unitMix: ['138× 1+1', '8× 2+1', '110× 2+2', '24× 3+2'],
			pricePerUnit: '$3.06M',
			pricePerSF: '$2,892.4',
			ybYr: '2005/2022',
			buildingSize: '296,688 SF',
			bedrooms: 446
		},
		metrics: {
			cap: { current: '0.29%', proforma: '0.55%' },
			grm: { current: '177.01', proforma: '170.38' },
			coc: { current: '0.06%', proforma: '0.47%' },
			upside: '3.89%',
			irr: { current: '-5.33%', target: '10.00%' },
			equityMultiple: { current: '0.59×', target: '1.50×' },
			roe: { current: '0.1%', target: '4.77%' },
			roi: '4.64%',
			priceEstimate: {
				low: '$815,232,174',
				mid: '$858,139,130',
				high: '$901,046,087'
			}
		},
		acquisition: {
			holdTerm: '10 years',
			exitCap: '1.55%',
			workingCapital: '$0',
			acquisitionDate: 'Jul 18, 2025',
			totalCashToClose: '$830.41M',
			totalAcquisitionCosts: '$858.14M',
			decisionCriteria: [
				{ label: 'IRR', current: '-5.33%', target: '10.00%' },
				{ label: 'Equity Multiple', current: '0.59×', target: '1.50×' },
				{ label: 'Avg. Cash on Cash', current: '0.47%', target: '5.00%' },
				{ label: 'Min. Purchase Cap Rate', current: '0.29%', target: '1.90%' },
				{ label: 'Proforma Cap Rate', current: '0.55%', target: '3.00%' }
			]
		}
	};

	// mock data for this particular property
	const rows: CompsComparisonRow[] = [
		{
			label: 'Averages',
			salePrice: '$665M',
			units: 230,
			rsf: '180,930',
			ybYr: '2019/--',
			perUnit: '$2,891,304',
			perSf: '$3,675.45',
			cap: '--',
			grm: '--',
			avgUnitSf: 787
		},
		{
			label: 'Subject',
			salePrice: '--',
			units: 280,
			rsf: '--',
			ybYr: '2005/2022',
			perUnit: '--',
			perSf: '--',
			cap: '--',
			grm: '--',
			avgUnitSf: '--'
		}
	];

	// 1) loan info
	const loanData = {
		loanAmount: '$27,727,061',
		downPayment: '$830,412,069',
		ltv: '3.23%',
		dcr: '1.25',
		loanTerm: '10 years',
		interestOnlyPeriod: '--',
		amortization: '30 years',
		interestRate: '6%',
		interestRateSpread: '--'
	};

	// 2) rent roll totals
	const rentRollData = {
		units: 280,
		sf: 296_688,
		currentRent: '$404,005',
		rentPerSf: 1.36,
		twelveMoRent: '$4,848,061',
		proformaRent: '$419,727',
		proformaRentPerSf: '$1.41',
		twelveMoProformaRent: '$5,036,724'
	};

	// 3) operating statement rows
	const operatingRows: OperatingRow[] = [
		{
			label: 'Gross Operating Income',
			current: '$4,432,790',
			perUnitCurrent: '$15,831',
			perSfCurrent: '$14.94',
			proforma: '$4,605,293',
			perUnitProforma: '$16,447',
			perSfProforma: '$15.52'
		},
		{
			label: 'Total operating expenses',
			current: '$1,939,224',
			perUnitCurrent: '$6,926',
			perSfCurrent: '$6.54',
			proforma: '$0',
			perUnitProforma: '$0',
			perSfProforma: '$0.00'
		},
		{
			label: 'Net Operating Income',
			current: '$2,493,566',
			perUnitCurrent: '$8,906',
			perSfCurrent: '$8.40',
			proforma: '$4,605,293',
			perUnitProforma: '$16,447',
			perSfProforma: '$15.52'
		}
	];

	console.log('property', property);
	// reuse units & sf for the table header
	const { units, sf } = rentRollData;

	let offering_data = [
		{
			key: 'Price',
			val: '$2,000,000'
		},
		{
			key: 'Capitalization Rate',
			val: '7.50%'
		},
		{
			key: 'Price/SF',
			val: '$192.88'
		},
		{
			key: 'Land Price/SF',
			val: '$83.48'
		}
	];

	let property_description_data = [
		{
			key: 'Year Built',
			val: '1965'
		},
		{
			key: 'Gross Leasable Area',
			val: '10,369 SF'
		},
		{
			key: 'Type of Ownership',
			val: 'Fee Simple'
		},
		{
			key: 'Lot Size',
			val: '0.55 acres'
		}
	];

	let lease_summary_data = [
		{
			key: 'Tenant',
			val: 'The Aaron’s Company, Inc.'
		},
		{
			key: 'Rent Increases',
			val: '10% every 5 years'
		},
		{
			key: 'Guarantor',
			val: 'Corporate'
		},
		{
			key: 'Lease Type',
			val: 'Absolute NNN'
		},
		{
			key: 'Lease Commencement',
			val: 'January 1, 2012'
		},
		{
			key: 'Lease Expiration',
			val: 'December 31, 2032'
		},
		{
			key: 'Renewal Options',
			val: 'Three 5-year options'
		},
		{
			key: 'Lease Term',
			val: '20 years'
		},
		{
			key: 'Term Remaining on Lease (Yrs)',
			val: '7.9 years'
		},
		{
			key: 'Landlord Responsibility',
			val: 'None'
		},
		{
			key: 'Tenant Responsibility',
			val: 'Roof & Structure'
		}
	];
</script>

<main class="flex-1 overflow-auto p-6">
	<div>
		<nav class="text-xs text-gray-500">
			Properties / {property.address} /
			<span class="font-medium text-gray-700">Market Summary</span>
		</nav>
		<h1 class="mt-1 text-2xl font-bold">Market Summary</h1>
	</div>

	<div class="my-6 flex items-center justify-center space-x-4">
		<SpeedometerCard
			title="Market"
			value={75}
			description="Evaluates the market's growth potential and stability, including factors like population trends, job growth, rental rates, and economics."
			buttonText="Review"
			buttonLink="/review"
		/>
		<SpeedometerCard
			title="Sponsor"
			value={55}
			description="Assesses the sponsor's track record, operational involvement, experience in asset class, vertical integration, and consistency in meeting projections."
			buttonText="Review"
			buttonLink="/review"
		/>
		<SpeedometerCard
			title="Alignment"
			value={45}
			description="Examines investor alignment through preferred returns, fee structures, waterfall and distribution methods for sponsor-investor dynamics."
			buttonText="Review"
			buttonLink="/review"
		/>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<KeyValueTable title="The Offering" data={offering_data} />
		<KeyValueTable title="Property Description" data={property_description_data} />
		<KeyValueTable title="Lease Summary" data={lease_summary_data} />

		<BarChart />
	</div>
</main>
