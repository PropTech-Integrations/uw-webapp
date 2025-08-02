<script lang="ts">
	import { Tabs, TabItem, P, Accordion, AccordionItem } from 'flowbite-svelte';
	import InsightsTable from './InsightsTable.svelte';
	import PdfViewer from 'svelte-pdf';
	import EntitiesList from '../EntitiesList.svelte';
	import { marked } from 'marked';


  const data = [{
        id: 1,
        city: "Amieshire",
        email: "Leora13@yahoo.com",
        firstName: "Ernest",
        lastName: "Schuppe",
        companyName: "Lebsack - Nicolas",
    },
    {
        id: 2,
        city: "Gust",
        email: "Mose_Gerhold51@yahoo.com",
        firstName: "Janis",
        lastName: "Vandervort",
        companyName: "Glover - Hermiston",
    },
];

const columns = [{
        id: "id",
        width: 50
    },
    {
        id: "city",
        width: 100,
        header: "City",
        footer: "City",
    },
    {
        id: "firstName",
        header: "First Name",
        footer: "First Name",
        width: 150,
    },
    {
        id: "lastName",
        header: "Last Name",
        footer: "Last Name",
        width: 150,
    },
    {
        id: "email",
        header: "Email",
        footer: "Email"
    },
    {
        id: "companyName",
        header: "Company",
        footer: "Company"
    },
];


	let { property } = $props();
</script>

<Tabs
	tabStyle="full"
	class="flex divide-x divide-gray-200 rounded-lg shadow-sm rtl:divide-x-reverse dark:divide-gray-700"
>
	<TabItem class="w-full" open>
		{#snippet titleSlot()}
			<span>Page View</span>
		{/snippet}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			<b>Page View:</b>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
			et dolore magna aliqua.
		</p>
		<div class="my-4 grid grid-cols-5 gap-4">
			{#each property.pages as page, index}
				<div class="col-span-2">
					<P class="m-4 mb-0 font-bold">Page{page.pageId}</P>
					<PdfViewer scale={0.75} url={page.uri} showBorder={false} showButtons={['']} />
				</div>
				<div class="col-span-2">
					<EntitiesList
						entities={property.insights.filter((insight) => insight.pageId === page.pageId)}
					/>

					<Accordion flush>
						<AccordionItem>
							{#snippet header()}Raw Scanned Text{/snippet}
							<p class="text-sm">
								{@html marked(
									property.texts
										.filter((text) => text.pageId === page.pageId)
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
