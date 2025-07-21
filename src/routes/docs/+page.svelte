<script lang="ts">
	import { marked } from 'marked';
	import { Accordion, AccordionItem, Card, Heading, Hr, P } from 'flowbite-svelte';
	import EntitiesList from '$lib/components/properties/EntitiesList.svelte';

	let { docPages } = $props();

	const entities = [
		{
			'Property Name': "Aaron's",
			Street: '422 SE 10th Ave',
			City: 'Hillsboro',
			State: 'OR',
			ZipCode: '97123'
		},
		{},
		{
			'Broker Name': 'David Tabata',
			'Broker Title': 'Broker of Record',
			'Company Street': '111 SW 5th Ave., Ste. 1950',
			'Company City': 'Portland',
			'Company State': 'OR',
			'Company ZipCode': '97204',
			'Broker Phone': '(503) 200-2000',
			'Broker License': '201224889',
			'Firm License': '200709023',
			'Broker Email': 'David.Tabata@marcusmillichap.com'
		},
		{
			Brokerage: 'Marcus & Millichap'
		},
		{},
		{},
		{
			ListingPrice: '$2,000,000',
			'Cap Rate': '7.5%',
			PricePerSF: '$192.88',
			DownPayment: '100% / $2,000,000',
			NOI: '$149,919',
			CapRate: '7.50%',
			RentPerSF: '$1.20 NNN',
			LeaseType: 'Absolute Net',
			Guarantor: 'Corporate Guarantee',
			LeaseExpiration: '12/31/2032',
			GrossSF: '10,369 SF',
			RentableSF: '10,369 SF',
			LotSize: '0.55 Acres (23,958 SF)',
			Occupancy: '100%',
			YearBuilt: '1965',
			APN: 'R323536',
			Zoning: 'Station Community Commercial - Downtown (SCC-DT)'
		},
		{
			TenantName: "Aaron's",
			PropertyAddress: '422 SE 10th Ave, Hillsboro, OR 97123',
			City: 'Hillsboro',
			State: 'OR',
			ZipCode: '97123',
			County: 'Washington County',
			MetroArea: 'Portland Metro Area',
			Population: '107,000',
			CitySizeRankInState: '5th largest city in Oregon',
			DistanceToPortland: '+/- 17 miles',
			Intersection: 'SW 10th Avenue & SE Oak Street',
			TrafficCount: '45,000 vehicles daily',
			StreetProximity: '1 block from SE Baseline Street',
			NearbyInstitutions: 'Portland Community College, OHSU Health Hillsboro Medical Center',
			LeaseStartDate: '2012',
			LeaseType: 'Absolute NNN',
			LeaseTerm: '20 years',
			LeaseAssignmentDate: 'October 29, 2018',
			TenantCompany: "The Aaron's Company, Inc.",
			RentIncreases: '10% fixed every 5 years',
			BuildingSize: '10,369 SF',
			OnSiteParkingSpaces: 20,
			AdditionalParkingSpaces: 16,
			ParkingAgreement: 'Cross-easement with adjacent Dunes Motel',
			FoundingYear: '1955',
			Headquarters: 'Atlanta, Georgia',
			Brands: ["Aaron's", 'BrandsMart U.S.A.', 'BrandsMart Leasing', 'Woodhaven'],
			NumberOfLocations: 'Approximately 1,210 locations in 47 states and Canada',
			ECommercePresence: 'Yes',
			RecentSale: 'Sold to IQVentures in late 2024',
			NewOwner: 'IQVentures',
			NewOwnerExpertise: 'Consumer and business financing, proprietary technology',
			CorporateLeaseGuarantee: 'Yes',
			YearsRemainingOnLease: 'Just under 8 years',
			BelowMarketRent: 'Yes',
			CornerLocation: 'Yes',
			OwnerUserOpportunity: 'Possible - tenant actively marketing property for sub-lease',
			Website: 'www.iqventures.com'
		},
		{},
		{},
		{
			Brokerage: 'Marcus & Millichap'
		},
		{},
		{},
		{},
		{},
		{
			OfferingPrice: '$2,000,000',
			CapitalizationRate: '7.50%',
			PricePerSF: '$192.88',
			LandPricePerSF: '$83.48',
			YearBuilt: '1965',
			GrossLeasableArea: '10,369 SF',
			OwnershipType: 'Fee Simple',
			LotSize: '0.55 acres',
			Tenant: "The Aaron's Company, Inc.",
			RentIncreases: '10% every 5 years',
			Guarantor: 'Corporate',
			LeaseType: 'Absolute NNN',
			LeaseCommencement: 'January 1, 2012',
			LeaseExpiration: 'December 31, 2032',
			RenewalOptions: 'Three 5-year options',
			OriginalLeaseTerm: '20 years',
			RemainingLeaseTermYears: '7.9 years',
			LandlordResponsibility: 'None',
			TenantResponsibility: 'Roof & Structure',
			CurrentAnnualRent: '$149,919',
			CurrentMonthlyRent: '$12,493.25',
			CurrentRentPerSF: '$14.46'
		},
		{},
		{
			MetroName: 'Portland-Vancouver',
			GeographyDescription:
				'Located near the confluence of the Columbia and Willamette rivers, stretches across Oregon and Washington',
			OregonCounties: ['Multnomah', 'Clackamas', 'Columbia', 'Washington', 'Yamhill'],
			WashingtonCounties: ['Clark', 'Skamania'],
			GeographicFeatures: ['Mount Hood', 'Cascade Range', 'Oregon Coast Range'],
			MetroPopulation: 'Approximately 2.5 million',
			CityPopulation: 'Over 650,000 in Portland',
			LargestCity: 'Portland',
			LargestCounty: 'Multnomah County',
			KeyIndustries: [
				'Footwear and apparel companies',
				'Software providers',
				'Advanced manufacturing companies'
			],
			EmploymentTrend: 'Steadily growing employment base',
			MetroHighlights: {
				HouseholdGrowth:
					'Positive household growth recorded in 22 of the last 23 years (except 2020)',
				AdvancedManufacturing:
					'Presence of Intel, Microchip Technology, and Lam Research attracting semiconductor and electronics manufacturers',
				LowerBusinessCosts:
					'Among lowest on West Coast; no state income tax in Washington and no sales tax in Oregon'
			},
			Image1: 'img-10.jpeg',
			Image2: 'img-11.jpeg'
		},
		{
			'Economy Overview':
				"The metro's economy has shifted from primarily exporting timber and raw materials to a high focus on outdoor apparel, clean tech, electronics manufacturing and software.",
			'Major Headquarters': ['Nike', 'Daimler', 'Columbia Sportswear'],
			'Research Sites': ['Intel', 'IBM'],
			'Major Employers': [
				'Providence Health',
				'Intel',
				'Oregon Health & Science University',
				'Nike',
				'Legacy Health',
				'Kaiser Permanente',
				'Fred Meyer Stores',
				'Portland State University',
				'PeaceHealth',
				'Lam Research'
			],
			'Employment 2023': {
				Manufacturing: '16%',
				ProfessionalAndBusinessServices: '16%',
				Government: 'Not specified',
				LeisureAndHospitality: 'Not specified',
				FinancialActivities: '6%',
				OtherServices: '3%'
			},
			Manufacturing: '10%',
			'Professional Services': '16%',
			Government: '12%',
			'Leisure Hospitality': '9%',
			'Financial Activities': '6%',
			Utilites: '19%',
			Construction: '6%',
			'Health and Education': '15%',
			Information: '2%',
			'Other Services': '3%'
		},
		{
			'Population Growth Next Five Years': 'Nearly 110,000 people',
			'Household Formation Next Five Years': 'Over 40,000 households',
			'Household Growth By End Of 2028': 'More than 4.0%',
			'Bachelor Degree Or Higher': 'Approximately 39%',
			'Graduate Or Professional Degree': 'Nearly 15%',
			'Demographic Image': 'img-21.jpeg',
			'Population By Age Image': 'img-22.jpeg',
			'Parks And Outdoor Space': 'More than 37,000 acres of parks',
			'Notable Outdoor Locations': [
				'Hoyt Arboretum',
				'Portland Japanese Garden',
				'International Rose Test Garden'
			],
			'Sports Teams': {
				Basketball: 'Portland Trail Blazers (NBA)',
				'Soccer MLS': 'Portland Timbers (MLS)',
				Hockey: 'Portland Winterhawks (WHL)',
				'Soccer NWSL': 'Portland Thorns FC (NWSL)',
				'Ultimate Frisbee': 'Portland Nitro (UFA)'
			},
			'Major Colleges And Universities': [
				'University of Portland',
				'Portland State University',
				'Lewis & Clark College',
				'Reed College',
				'Mt. Hood Community College',
				'Clackamas Community College'
			],
			'Nearby Major Universities': ['University of Oregon', 'Oregon State University'],
			'Arts And Entertainment Venues': [
				'Portland Japanese Garden',
				'Oregon Zoo',
				'Portland Art Museum',
				'Oregon Historical Society',
				'World Forestry Center Discovery Museum',
				"Portland Children's Museum",
				"Portland's Centers for the Arts"
			],
			'Cultural Scene Highlights': 'Culinary, fashion, and arts scenes draw strong engagement',
			'Data Sources': [
				'Marcus & Millichap Research Services',
				'RLS',
				'Bureau of Economic Analysis',
				'Experian',
				'Fortune',
				"Moody's Analytics",
				'U.S. Census Bureau'
			]
		},
		{
			'Population 2028 Projection 1 Mile': '22,311',
			'Population 2028 Projection 3 Miles': '80,027',
			'Population 2028 Projection 5 Miles': '158,056',
			'Population 2023 Estimate 1 Mile': '21,093',
			'Population 2023 Estimate 3 Miles': '76,135',
			'Population 2023 Estimate 5 Miles': '148,751',
			'Population 2020 Census 1 Mile': '20,831',
			'Population 2020 Census 3 Miles': '75,962',
			'Population 2020 Census 5 Miles': '147,214',
			'Population 2010 Census 1 Mile': '20,473',
			'Population 2010 Census 3 Miles': '71,012',
			'Population 2010 Census 5 Miles': '128,931',

			'Household Income Average 1 Mile': '$84,521',
			'Household Income Average 3 Miles': '$117,278',
			'Household Income Average 5 Miles': '$111,269',
			'Household Income Median 1 Mile': '$66,901',
			'Household Income Median 3 Miles': '$92,569',
			'Household Income Median 5 Miles': '$87,088',
			'Household Income Per Capita 1 Mile': '$29,348',
			'Household Income Per Capita 3 Miles': '$42,801',
			'Household Income Per Capita 5 Miles': '$41,811',

			'Households 2028 Projection 1 Mile': '7,625',
			'Households 2028 Projection 3 Miles': '29,103',
			'Households 2028 Projection 5 Miles': '59,284',
			'Households 2023 Estimate 1 Mile': '7,189',
			'Households 2023 Estimate 3 Miles': '27,634',
			'Households 2023 Estimate 5 Miles': '55,678',
			'Households 2020 Census 1 Mile': '6,924',
			'Households 2020 Census 3 Miles': '26,737',
			'Households 2020 Census 5 Miles': '53,452',
			'Households 2010 Census 1 Mile': '6,536',
			'Households 2010 Census 3 Miles': '24,421',
			'Households 2010 Census 5 Miles': '45,068',

			'Housing Median Home Value 1 Mile': '$315,621',
			'Housing Median Home Value 3 Miles': '$421,624',
			'Housing Median Home Value 5 Miles': '$402,763',

			'Employment 2023 Daytime Population 1 Mile': '22,196',
			'Employment 2023 Daytime Population 3 Miles': '77,828',
			'Employment 2023 Daytime Population 5 Miles': '155,327',
			'Employment 2023 Unemployment Rate 1 Mile': '5.20%',
			'Employment 2023 Unemployment Rate 3 Miles': '3.82%',
			'Employment 2023 Unemployment Rate 5 Miles': '3.69%',
			'Employment Average Travel Time 1 Mile': '28 minutes',
			'Employment Average Travel Time 3 Miles': '26 minutes',
			'Employment Average Travel Time 5 Miles': '26 minutes',

			'Educational Attainment High School Graduate 1 Mile': '24.18%',
			'Educational Attainment High School Graduate 3 Miles': '20.81%',
			'Educational Attainment High School Graduate 5 Miles': '20.66%',
			'Educational Attainment Some College 1 Mile': '23.18%',
			'Educational Attainment Some College 3 Miles': '21.81%',
			'Educational Attainment Some College 5 Miles': '22.21%',
			'Educational Attainment Associate Degree 1 Mile': '7.02%',
			'Educational Attainment Associate Degree 3 Miles': '8.34%',
			'Educational Attainment Associate Degree 5 Miles': '9.24%',
			'Educational Attainment Bachelor Degree 1 Mile': '16.15%',
			'Educational Attainment Bachelor Degree 3 Miles': '22.27%',
			'Educational Attainment Bachelor Degree 5 Miles': '22.31%',
			'Educational Attainment Graduate Degree 1 Mile': '7.75%',
			'Educational Attainment Graduate Degree 3 Miles': '15.32%',
			'Educational Attainment Graduate Degree 5 Miles': '14.99%'
		},
		{
			'Major Employer 1': 'Giraffe Holding Inc-Gymboree',
			'Employees 1': '2,428',
			'Major Employer 2': 'Tuality Healthcare-OHSU',
			'Employees 2': '1,100',
			'Major Employer 3': 'County of Washington-Washington County',
			'Employees 3': '1,050',
			'Major Employer 4': 'Ultra Clean Technology Systems',
			'Employees 4': '947',
			'Major Employer 5': 'Tuality Healthcare Fundation Inc-Tuality Healthcare',
			'Employees 5': '800',
			'Major Employer 6': 'Qorvo Us Inc',
			'Employees 6': '723',
			'Major Employer 7': 'Hirequest Inc',
			'Employees 7': '678',
			'Major Employer 8': 'Utb Enterprises LLC-McDonalds',
			'Employees 8': '650',
			'Major Employer 9': 'Oracle America Inc-Oracle',
			'Employees 9': '600',
			'Major Employer 10': 'Morgan Industrial Inc-Omega Morgan Machinery Moving',
			'Employees 10': '600',
			'Major Employer 11': 'Fei Company',
			'Employees 11': '569',
			'Major Employer 12': 'Willamette Dental MGT Corp',
			'Employees 12': '500',
			'Major Employer 13': 'Asml Us LLC-Asml',
			'Employees 13': '462',
			'Major Employer 14': 'City of Hillsboro',
			'Employees 14': '450',
			'Major Employer 15': 'Pfu America Inc',
			'Employees 15': '440',
			'Major Employer 16': 'Fred Meyer Inc-Kroger',
			'Employees 16': '408',
			'Major Employer 17': 'Qorvo Inc',
			'Employees 17': '400',
			'Major Employer 18': 'Asml Us LLC-Asml',
			'Employees 18': '396',
			'Major Employer 19': 'Apple American Group LLC-Applebees',
			'Employees 19': '392',
			'Major Employer 20': 'Tuality Medical Eqp & Sup',
			'Employees 20': '385',
			'Major Employer 21': 'Epson Portland Inc',
			'Employees 21': '350',
			'Major Employer 22': 'Sunpower Corporation',
			'Employees 22': '350',
			'Major Employer 23': 'Asml Us LLC',
			'Employees 23': '341',
			'Major Employer 24': 'Utb Enterprises LLC-McDonalds',
			'Employees 24': '325',
			'Major Employer 25': 'Utb Enterprises LLC-McDonalds',
			'Employees 25': '325'
		}
	];
</script>

<!-- <P>
	PropTech Integrations' AI is analyzing each page of the document and extracting key information.
</P> -->

{#each docPages as page}
	<div class="grid grid-cols-4 gap-4 my-4">
		<div class="col-span-2">
			<img src="/sample_document1/{page['index']}.jpg" alt="page from document" />
			<P>Page {JSON.stringify(page['index'])}</P>
		</div>
		<div class="col-span-2">
			<Heading tag="h3" class="mb-8" customSize="text-md font-bold  md:text-lg lg:text-xl">
				Artificial Intelligence is Indentifying Key Data
			</Heading>

			{#if entities && entities[page.index]}
				<EntitiesList entities={entities[page.index]} />
			{:else}
				<P>No entities found for this page</P>
			{/if}
			<Accordion flush>
				<AccordionItem>
					<span slot="header">Raw Scanned Text</span>
					<P>{@html marked(page.markdown)}</P>
				</AccordionItem>
			</Accordion>
			<!-- <P>{@html marked(page.markdown)}</P> -->
		</div>
	</div>
	<Hr />
{/each}
