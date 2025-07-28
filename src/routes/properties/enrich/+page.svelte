<script lang="ts">
	import IntegrationCard from '$lib/components/IntegrationCard.svelte';
	import DiscoverButton from '$lib/components/Upload/DiscoverButton.svelte';

	interface Integration {
		iconSrc: string;
		title: string;
		description: string;
		removeHref: string;
		connectHref: string;
		settingsHref: string;
	}

	const integrations: Integration[] = [
		{
			iconSrc: '/icons/mailchimp.svg',
			title: 'Mailchimp',
			description: 'Online platform for sending professionals e‑mails to mass recipients.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		},
		{
			iconSrc: '/icons/google-drive.svg',
			title: 'Google Drive',
			description: 'Online platform for sending professionals e‑mails to mass recipients.',
			removeHref: '#',
			connectHref: '#',
			settingsHref: '#'
		}
		// ... add other integrations
	];
</script>

<section
	class="w-full space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>
	<header class="flex items-center justify-between">
		<h1 class="font-poppins text-2xl font-semibold">New Property Analysis</h1>
		<DiscoverButton />
	</header>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-white">Integrations</h1>
		<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
			Add Integration
		</button>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each integrations as integration}
			<IntegrationCard {...integration} />
		{/each}
	</div>
</section>
