<script lang="ts">
	import SourceCard from '$lib/components/Upload/SourceCard.svelte';

    	// Data defined for this component - Source Cards
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
</script>

<div class="grid grid-cols-1 gap-4">
    {#each sourceCards as card}
        <SourceCard {card} />
    {/each}
</div>