<script lang="ts">
	// import { invalidate } from '$app/navigation';
	// import { go } from '$app/navigation';
	import { goto } from '$app/navigation';
	let file: File | null = null;
	let progress = 0;
	let uploading = false;
	let result: { success: boolean; message: string; sha256?: string } | null = null;

	let fileInput: HTMLInputElement;

	// 1) make this async so we can await upload()
	async function handleFileChange(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
		progress = 0;
		result = null;

		if (file) {
			await upload();
		}
	}

	// 2) same upload logic as before
	async function upload() {
		if (!file) return;
		uploading = true;

		const form = new FormData();
		form.append('file', file);

		try {
			const response = await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', '/properties/new');
				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) {
						progress = Math.round((e.loaded / e.total) * 100);
					}
				};
				xhr.onload = () => {
					uploading = false;
					if (xhr.status >= 200 && xhr.status < 300) {
						result = JSON.parse(xhr.responseText);
						resolve();
					} else {
						reject(new Error(`Upload failed (${xhr.status})`));
					}
				};
				xhr.onerror = () => {
					uploading = false;
					reject(new Error('Network error'));
				};
				xhr.send(form);
			});

			// Redirect to properties summary page if upload was successful and we have a SHA256 hash
			// if (result?.success && result.sha256) {
			// 	goto(`/properties/document/${result.sha256}`);
			// }
		} catch (err) {
			result = { success: false, message: (err as Error).message };
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			file = files[0];
			handleFileChange({ currentTarget: { files } } as unknown as Event);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}
</script>

<div
	class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition hover:border-gray-400"
	tabindex="0"
	role="button"
	on:keydown={handleKeydown}
	on:drop={handleDrop}
	on:dragover={handleDragOver}
>
	{#if file}
		<div class="space-y-2">
			<p>{uploading ? `Uploading… ${progress}%` : `Ready to upload ${file.name}`}</p>
			<progress max="100" value={progress}></progress>

			{#if result}
				{#if result.success}
					<p class="text-green-600">✅ {result.message}</p>
				{:else}
					<p class="text-red-600">⚠️ {result.message}</p>
				{/if}
			{/if}
		</div>
	{/if}

	<input
		type="file"
		accept=".pdf"
		style="display: none;"
		bind:this={fileInput}
		on:change={handleFileChange}
	/>
	<svg class="mb-4 h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4-4m0 0l-4 4m4-4v12"
		/>
	</svg>
	<p class="text-lg font-medium text-gray-700">Upload sources</p>
	<p class="text-sm text-gray-500">
		Drag & drop or <span
			class="cursor-pointer text-blue-600 underline"
			on:click={() => fileInput.click()}
			on:keydown={handleKeydown}
			tabindex="0"
			role="button">choose file</span
		> to upload
	</p>
	<p class="mt-2 text-xs text-gray-400">
		Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3)
	</p>
</div>
