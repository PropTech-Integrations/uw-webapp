<script lang="ts">
    import PdfViewer from 'svelte-pdf';
    import { getPageS3Url } from '$lib/utils/s3urls';
	import type { DocumentAndPages } from '$lib/types/Document';
    import type { PageProps } from './$types';
    import { project as projectStore } from '$lib/stores/project.svelte';
    
    let { data }: PageProps = $props();
    // Use reactive project store instead of static data
    let project = $derived($projectStore);
	// let documentAndPages: DocumentAndPages | null = $state(null);
</script>

<h1>Document Analysis - You made it!</h1>
{#if project}
	<pre>{JSON.stringify(project, null, 2)}</pre>
{:else}
	<p>Loading project data...</p>
{/if}

<!-- {#if documentAndPages}
<div class="my-4 grid grid-cols-4 gap-4">
    <div class="text-sm text-gray-700">
        {#if documentAndPages?.pages?.items}
            <ul>
                {#each documentAndPages?.pages?.items as page}
                    <div class="col-span-2">
                        <PdfViewer
                            scale={0.8}
                            showBorder={false}
                            showButtons={['']}
                            url={getPageS3Url(
                                documentAndPages?.s3Bucket,
                                documentAndPages?.docHash,
                                page.pageNumber
                            )}
                        />
                    </div>
                {/each}
            </ul>
        {:else}
            <p>No pages found.</p>
        {/if}
    </div>
</div>
{:else}
<p class="text-sm text-gray-500 dark:text-gray-400">
    <b>Dashboard:</b>
    Click to load document analysis data...
</p>
{/if} -->