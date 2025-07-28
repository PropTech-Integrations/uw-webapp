<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import KeyValueTable from '../../tables/KeyValueTable.svelte';

	let name = "Aaron's";
	let address = '422 SE 10th Ave, Hillsboro, OR 97123';
	let units = 1; // Default number of units
	let imageUrl = 'https://pti-demo-web-assets.s3.us-west-2.amazonaws.com/images/aarons.png'; // Default placeholder image
	let imageAlt = 'Exterior view of the commercial property'; // Default alt text

	let financial_data = [
		{
			key: 'Listing Price',
			val: '$2,000,000'
		},
		{
			key: 'Down Payment',
			val: '100% / $2,000,000'
		},
		{
			key: 'NOI',
			val: '$149,919'
		},
		{
			key: 'Cap Rate',
			val: '7.50%'
		},
		{
			key: 'Price/SF',
			val: '$192.88'
		},
		{
			key: 'Rent/SF',
			val: '$1.20 NNN'
		}
	];

	let operational_data = [
		{
			key: 'Lease Type',
			val: 'Absolute Net'
		},
		{
			key: 'Guarantor',
			val: 'Corporate Guarantee'
		},
		{
			key: 'Lease Expiration',
			val: '12/31/2032'
		},
		{
			key: 'Gross SF',
			val: '10,369 SF'
		},
		{
			key: 'Rentable SF',
			val: '10,369 SF'
		},
		{
			key: 'Lot Size',
			val: '0.55 Acres (23,958 SF)'
		},
		{
			key: 'Occupancy',
			val: '100%'
		},
		{
			key: 'Year Built',
			val: '1965'
		},
		{
			key: 'APN',
			val: 'R323536'
		},
		{
			key: 'Zoning',
			val: 'Station Community Commercial - Downtown (SCC-DT)'
		}
	];
</script>

<Card class="max-w-full">
	<!-- <div class="rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-gray-800"> -->
	<h2 class="mb-4 text-3xl font-bold text-gray-900 md:mb-6 dark:text-white">
		{name}
	</h2>

	<button
		type="button"
		color="primary"
		id="editProjectButton"
		data-modal-target="editProjectModal"
		data-modal-toggle="editProjectModal"
		class="inline-flex w-full items-center justify-center rounded-lg mb-8 max-w-xs bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
	>
		<svg
			class="-ms-0.5 me-1.5 h-4 w-4"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				fill-rule="evenodd"
				d="M5 8a4 4 0 1 1 7.8 1.3l-2.5 2.5A4 4 0 0 1 5 8Zm4 5H7a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h2.2a3 3 0 0 1-.1-1.6l.6-3.4a3 3 0 0 1 .9-1.5L9 13Zm9-5a3 3 0 0 0-2 .9l-6 6a1 1 0 0 0-.3.5L9 18.8a1 1 0 0 0 1.2 1.2l3.4-.7c.2 0 .3-.1.5-.3l6-6a3 3 0 0 0-2-5Z"
				clip-rule="evenodd"
			/>
		</svg>
		Edit
	</button>
	<div class="grid gap-4 sm:grid-cols-2 sm:gap-8 2xl:gap-60">
		<dl>
			<dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Address</dt>
			<dd class="mb-4 text-gray-500 sm:mb-5 dark:text-gray-400">{address}</dd>
			<dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Description</dt>
			<dd class="mb-4 text-gray-500 sm:mb-5 dark:text-gray-400">
				The subject property is a freestanding Aaron’s store located at the signalized corner of SW
				10th Avenue & SE Oak Street in the heart of Hillsboro, Oregon. Hillsboro is the county seat
				of Washington County, with a reported 107,000 residents, making it the 5th largest city in
				Oregon. Hillsboro is located +/- 17 miles West of downtown Portland.
			</dd>
			<dd class="mb-4 text-gray-500 sm:mb-5 dark:text-gray-400">
				This Property is ideally positioned nestled between a dense residential subdivision and a
				mix of retail businesses. The Property is 1 block off of SE Baseline Street, a main conduit
				through Beaverton/Hillsboro and 2 blocks away from Portland Community College and OHSU
				Health Hillsboro Medical Center. Reported daily traffic count at this signalized
				intersection in excess of 45,000/vehicles.
			</dd>
			<dd class="mb-4 text-gray-500 sm:mb-5 dark:text-gray-400">
				In 2012, an established Aaron’s franchisee signed a 20 year absolute NNN lease with 10%
				fixed rent increases every 5 years. The lease was then assigned to The Aaron’s Company, Inc.
				October 29, 2018. The building is equipped with +/-10,369 sq. ft. of retail showroom space
				and on-site parking of 20 spaces with a cross easement agreement with the adjacent Dunes
				Motel for Aaron’s customers to have access to another 16 spaces.
			</dd>
			<dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">
				Project priority
			</dt>
			<dd class="mb-4 sm:mb-5">
				<span
					class="me-2 inline-flex items-center rounded-sm bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-300"
				>
					<svg
						class="me-1 h-4 w-4"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M8.6 3.2a1 1 0 0 0-1.6 1 3.5 3.5 0 0 1-.8 3.6c-.6.8-4 5.6-1 10.7A7.7 7.7 0 0 0 12 22a8 8 0 0 0 7-3.8 7.8 7.8 0 0 0 .6-6.5 8.7 8.7 0 0 0-2.6-4 1 1 0 0 0-1.6.7 10 10 0 0 1-.8 3.4 9.9 9.9 0 0 0-2.2-5.5A14.4 14.4 0 0 0 9 3.5l-.4-.3Z"
						/>
					</svg>
					High
				</span>
			</dd>
			<!-- <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">Team</dt> -->
			<!-- <dd class="mb-4 flex -space-x-4 sm:mb-5 rtl:space-x-reverse">
                <img
                    class="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                    src="/images/users/helene-engels.png"
                    alt="User avatar"
                />
                <img
                    class="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                    src="/images/users/jese-leos.png"
                    alt="User avatar"
                />
                <img
                    class="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
                    src="/images/users/bonnie-green.png"
                    alt="User avatar"
                />
                <a
                    class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-700 text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800"
                    href="#">+2</a
                >
            </dd> -->
			<!-- <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">
				Due Diligence Duration
			</dt>
			<dd class="flex items-center text-gray-900 dark:text-white">
				<svg
					class="me-1.5 h-4 w-4 text-gray-500 dark:text-gray-400"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						fill-rule="evenodd"
						d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z"
						clip-rule="evenodd"
					/>
				</svg>
				<span class="font-medium">3 months</span>
			</dd> -->
		</dl>
		<dl>
			<img src={imageUrl} alt={imageAlt} class="mb-4 h-48 w-full rounded-sm object-cover" />

			<KeyValueTable title="Financial Overview" data={financial_data} />
			<!-- <KeyValueTable title="Operational Overview" data={operational_data} /> -->
		</dl>
	</div>
	<div class="mt-4 border-t border-gray-200 pt-4 sm:mt-5 sm:pt-5 dark:border-gray-700">
		<button
			type="button"
			id="editProjectButton"
			data-modal-target="editProjectModal"
			data-modal-toggle="editProjectModal"
			class="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
		>
			<svg
				class="-ms-0.5 me-1.5 h-4 w-4"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					fill-rule="evenodd"
					d="M5 8a4 4 0 1 1 7.8 1.3l-2.5 2.5A4 4 0 0 1 5 8Zm4 5H7a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h2.2a3 3 0 0 1-.1-1.6l.6-3.4a3 3 0 0 1 .9-1.5L9 13Zm9-5a3 3 0 0 0-2 .9l-6 6a1 1 0 0 0-.3.5L9 18.8a1 1 0 0 0 1.2 1.2l3.4-.7c.2 0 .3-.1.5-.3l6-6a3 3 0 0 0-2-5Z"
					clip-rule="evenodd"
				/>
			</svg>
			Edit
		</button>
	</div>
	<!-- </div> -->
</Card>
