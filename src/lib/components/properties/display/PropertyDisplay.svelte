<script lang="ts">
	import { Tabs, TabItem, P, Accordion, AccordionItem } from 'flowbite-svelte';
	import InsightsTable from './InsightsTable.svelte';
	import PdfViewer from 'svelte-pdf';
	import EntitiesList from '../EntitiesList.svelte';
	import { marked } from 'marked';

	let { property } = $props();
	// console.log('property -------------------------->');
	// $inspect(property);
	let pages = $derived(property.pages.sort((a, b) => Number(a.pageId) - Number(b.pageId)));
	let insights = $derived(property.insights.sort((a, b) => Number(a.pageId) - Number(b.pageId)));
	console.log('insights -------------------------->');
	$inspect(insights);

	let texts = $derived(property.texts.sort((a, b) => Number(a.pageId) - Number(b.pageId)));
</script>

<Tabs
	tabStyle="full"
	class="flex divide-x divide-gray-200 rounded-lg shadow-sm rtl:divide-x-reverse dark:divide-gray-700"
>
	<TabItem class="w-full" open>
		{#snippet titleSlot()}
			<span>Page View</span>
		{/snippet}
		<!-- <p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Page View:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua.
		</p> -->
		<div class="my-4 grid grid-cols-4 gap-4">
			{#each pages as page, index}
				<div class="col-span-2">
					<P class="m-4 mb-0 font-bold">Page{page.pageId}</P>
					<PdfViewer scale={0.53} url={page.uri} showBorder={false} showButtons={['']} />
				</div>
				<div class="col-span-2">
					<EntitiesList
						entities={insights.filter((insight) => {
							return Number(insight.pageId) + 1 == Number(page.pageId);
						})}
					/>

					<Accordion flush>
						<AccordionItem>
							{#snippet header()}Raw Scanned Text{/snippet}
							<p>{index}</p>
							<p class="text-sm">
								{@html marked(
									texts
										.filter((text) => text.pageId == index)
										.map((text) => text.text)
										.join('\n')
								)}
							</p>
						</AccordionItem>
					</Accordion>
				</div>
			{/each}
		</div>
		<InsightsTable insights={property.insights} />
	</TabItem>
	<TabItem class="w-full">
		{#snippet titleSlot()}
			<span>Insights</span>
		{/snippet}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Dashboard:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua.
		</p>
		<div class="flex flex-wrap">
			{#each Array.from(new Set(property.insights.map((insight) => insight.category))) as category}
				<div class="w-1/2 p-2">
					<h3 class="mt-4 text-lg font-bold">{category}</h3>
					<InsightsTable
						insights={property.insights.filter((insight) => insight.category === category)}
					/>
				</div>
			{/each}
		</div>
	</TabItem>
	<TabItem class="w-full">
		{#snippet titleSlot()}
			<span>Verified Labels</span>
		{/snippet}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Settings:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua.
		</p>
	</TabItem>
	<TabItem class="w-full">
		{#snippet titleSlot()}
			<span>Export for Underwriting</span>
		{/snippet}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Users:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua.
		</p>
	</TabItem>
</Tabs>
