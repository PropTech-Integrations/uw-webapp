<script lang="ts">
	import UploadArea from '$lib/components/Upload/UploadArea.svelte';
	import SourceCard from '$lib/components/Upload/SourceCard.svelte';
	import ProgressBar from '$lib/components/Upload/ProgressBar.svelte';

	const sourceCards = [
		{
			title: 'PDF Documents',
			image: '/images/sources_page/om3.png',
			description: 'Offering Memorandums, Investment Presentations, and other PDF documents'
		},
		{
			title: 'Rent Roll',
			image: '/images/sources_page/rentroll.jpg',
			description:
				'Upload Rent Roll documents exported from Appfolio, Yardi and other property management systems.'
		},
		{
			title: 'T12',
			image: '/images/sources_page/t12.png',
			description:
				'Upload T12 and income/expense documents exported from common property management systems.'
		}
	];

	let currentCount = 2;
	const maxCount = 20;
</script>

<section
	class="space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-2 pt-0 shadow-md"
>


	<p class="text-gray-600 text-sm">
		Start your property analysis by adding sources. StratiqAI can base its responses on PDF
		documents such as offering memorandums, property reports, investor presentations. StratiqAI can
		also understand Rent Rolls, T12s and income an expense statements. 
		<span class="hidden md:inline">
			(Examples: marketing plans, course reading, research notes, meeting transcripts, sales
			documents, etc.)
		</span>
	</p>

	<UploadArea />

	<div class="grid grid-cols-1 gap-4">
		{#each sourceCards as card}
			<SourceCard {card} />
		{/each}
	</div>

	<ProgressBar {currentCount} {maxCount} />
</section>
