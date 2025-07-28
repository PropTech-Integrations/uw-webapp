<script lang="ts">
	import DiscoverButton from '../../../lib/components/Upload/DiscoverButton.svelte';
	import UploadArea from '../../../lib/components/Upload/UploadArea.svelte';
	import SourceCard from '../../../lib/components/Upload/SourceCard.svelte';
	import ProgressBar from '../../../lib/components/Upload/ProgressBar.svelte';

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
	class="space-y-6 rounded-2xl bg-white bg-gradient-to-br from-zinc-50 via-red-50 to-indigo-50 p-6 shadow-md"
>

	<!-- <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
    <li class="flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
        <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
            </svg>
     
        </span>
    </li>
    <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
        <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            <span class="me-2">2</span>
            Account <span class="hidden sm:inline-flex sm:ms-2">Info</span>
        </span>
    </li>
    <li class="flex items-center">
        <span class="me-2">3</span>
        Confirmation
    </li>
</ol> -->
	<!-- <li class="flex items-center text-gray-500 dark:text-gray-400 space-x-2.5 rtl:space-x-reverse">
      <span class="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
          2
      </span>
      <span>
          <h3 class="font-medium leading-tight">Company info</h3>
          <p class="text-sm">Step details here</p>
      </span>
  </li>
  <li class="flex items-center text-gray-500 dark:text-gray-400 space-x-2.5 rtl:space-x-reverse">
      <span class="flex items-center justify-center w-8 h-8 border border-gray-500 rounded-full shrink-0 dark:border-gray-400">
          3
      </span>
      <span>
          <h3 class="font-medium leading-tight">Payment info</h3>
          <p class="text-sm">Step details here</p>
      </span>
  </li> 
</ol>-->

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

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
		{#each sourceCards as card}
			<SourceCard {card} />
		{/each}
	</div>

	<ProgressBar {currentCount} {maxCount} />
</section>
