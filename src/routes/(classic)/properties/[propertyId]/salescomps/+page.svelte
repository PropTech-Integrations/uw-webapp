<script lang="ts">
	import MarketSizeCard from '$lib/components/cards/statistics/MarketSizeCard.svelte';
	import Riskcard from '$lib/components/cards/statistics/riskcard.svelte';
	import TitleTextCard from '$lib/components/cards/statistics/TitleTextCard.svelte';
	
	import StatCard from '$lib/components/cards/statistics/StatCard.svelte';
	import StatCardHorizontal from '$lib/components/cards/statistics/StatCardHorizontal.svelte';
	import KeyValueTable from '$lib/components/tables/KeyValueTable.svelte';
	// import GoogleMapCard from '$lib/components/MapBox.svelte';
	import { Button, Card, CardPlaceholder, Heading, P, Toggle } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';
	import Sidebar from '$lib/components/properties/sidebar/Sidebar.svelte';

	export let data: { id: string };
	$: console.log(data);

	let vCard = false;
	// let imageUrl = 'https://pti-demo-web-assets.s3.us-west-2.amazonaws.com/images/aarons.png';
	let imageUrl = 'https://pti-demo-web-assets.s3.us-west-2.amazonaws.com/images/aaronmap.png'
	const city_data = [
		{
			key: 'State',
			val: 'Oregon'
		},
		{
			key: 'County',
			val: 'Washington County'
		},
		{
			key: 'Metro Area',
			val: 'Portland-Vancouver-Hillsboro Metro Area'
		},
		{
			key: 'City',
			val: 'Hillsboro'
		},
		{
			key: 'Zip Codes',
			val: '97124 97123'
		},
		{
			key: 'Cost of Living',
			val: '28.1% higher'
		},
		{
			key: 'Time zone',
			val: 'Pacific Standard Time (PST)'
		},
		{
			key: 'Elevation',
			val: '33 ft above sea level'
		}
	];
</script>
<!-- <div class="flex h-full">
	<Sidebar  /> -->
<section
	class="w-full space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6  dark:bg-gray-900 dark:text-gray-100shadow-md"
>
<Heading tag="h2" class="mb-8 text-2xl font-extrabold  md:text-3xl lg:text-4xl">
	Market Analysis
</Heading>

<div class="grid grid-cols-2 gap-4">
	<Card img={imageUrl} reverse={vCard} class="max-w-full">
		<Heading tag="h4" class="mb-4 text-md font-extrabold  md:text-lg lg:text-xl">
			Hillsboro, OR
		</Heading>
		<P class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">
			Hillsboro, Oregon is a vibrant city located in the northwestern edge of the state. From its
			scenic parks and trails to its thriving cultural scene, Hillsboro has something for everyone.
		</P>
		<Button>
			Read more <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
		</Button>
	</Card>
	<Card class="max-w-full">
		<KeyValueTable title="City Statistics" data={city_data} />
	</Card>
	<!-- <Toggle bind:checked={vCard} class="italic dark:text-gray-500">Reverse</Toggle> -->
</div>

<div class="grid grid-cols-5 gap-4">
	<StatCard label="MANUFACTURING" val="10%" />
	<StatCard label="BUSINESS SERVICES" val="16%" />
	<StatCard label="GOVERNMENT" val="12%" />
	<StatCard label="HOSPITALITY" val="9%" />
	<StatCard label="FINANCIAL ACTIVITIES" val="6%" />

	<StatCard label="UTILITIES" val="19%" />
	<StatCard label="CONSTRUCTION" val="6%" />
	<StatCard label="EDUCATION AND HEALTH SERVICES" val="15%" />
	<StatCard label="INFORMATION" val="2%" />
	<StatCard label="OTHER SERVICES" val="3%" />
</div>
</section>


<!-- <MarketSizeCard />
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 h-1/6">
	<TitleTextCard
		title="Need a help in Claim?"
		text="Go to this step by step guideline process on how to certify for your weekly benefits:"
		linkText="See Our Guidelines"
		href="/"
	/>
	<TitleTextCard
		title="Population Snapshot"
		text="Explore current and projected 1-, 3-, and 5-mile population counts to gauge consumer density around the site."
		linkText="View Census Tables"
		href="/demographics/population"
	/>

	<TitleTextCard
		title="Household Income Profile"
		text="See median and average household income levels, plus 5-year growth forecasts, to assess purchasing power in the trade area."
		linkText="Download Income Report"
		href="/demographics/household-income"
	/>

	<TitleTextCard
		title="Daytime Population Growth"
		text="Compare resident vs. daytime worker counts to understand lunch-time and commuter traffic that drives retail sales."
		linkText="See Workforce Flow"
		href="/demographics/daytime-population"
	/>

	<TitleTextCard
		title="Top Employers Nearby"
		text="Review the largest public and private employers within a 3-mile radius, including headcounts and industry sectors."
		linkText="Open Employer List"
		href="/market/top-employers"
	/>

	<TitleTextCard
		title="Regional Highway Access"
		text="Visualize primary and secondary highways, average daily traffic (ADT), and distance to key interchanges servicing the property."
		linkText="View Traffic Map"
		href="/market/highways"
	/>

	<TitleTextCard
		title="University & College Nodes"
		text="Identify major higher-education campuses, enrollment figures, and their impact on seasonal retail demand."
		linkText="Browse Campus Data"
		href="/market/universities"
	/>

	<TitleTextCard
		title="Tourism & Visitor Anchors"
		text="Highlight hotels, convention centers, sports venues, and attractions that generate out-of-area footfall."
		linkText="See Visitor Stats"
		href="/market/tourism-nodes"
	/>
</div>

 -->
