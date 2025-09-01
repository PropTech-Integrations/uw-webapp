<script lang="ts">
	import { logger } from '$lib/logging/debug';
	import { TrashBinOutline } from 'flowbite-svelte-icons';

	type Document = {
		id: string;
		filename: string;
	};

	let { documents = $bindable() } = $props<{ documents: Document[] }>();
	// logger('documents', documents);

	let files: { file: File; uploading: boolean; progress: number; result: { success: boolean; message: string; sha256?: string } | null }[] = $state([]);
	// $inspect(files);

	// If documents is not empty, set files to the documents
	if (documents.length > 0) {
		files = documents.map((doc: Document) => ({ file: new File([], doc.filename), uploading: false, progress: 0, result: null }));
	}

	let fileInput: HTMLInputElement;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
		}
	}

	async function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		if (!input.files?.length) return;
		const fileList = Array.from(input.files);
		logger('fileList', fileList);
		await addAndUploadFiles(fileList);
		input.value = ''; // allow re-upload of same file(s)
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const droppedFiles = event.dataTransfer?.files;
		if (droppedFiles && droppedFiles.length > 0) {
			addAndUploadFiles(Array.from(droppedFiles));
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function removeFile(idx: number) {
		const removedFile = files[idx];
		files = files.slice(0, idx).concat(files.slice(idx + 1));
		documents = documents.filter((doc: Document) => doc.filename !== removedFile.file.name);
	}

	async function addAndUploadFiles(fileList: File[]) {
		for (const file of fileList) {
			await addAndUploadFile(file);
		}
	}

	async function addAndUploadFile(file: File) {
		const fileObj = { file, uploading: true, progress: 0, result: null };
		files = [...files, fileObj];
		const idx = files.length - 1;
		const form = new FormData();
		form.append('file', file);

		try {
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', '/properties/new');
				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) {
						files[idx].progress = Math.round((e.loaded / e.total) * 100);
						files = [...files];
					}
				};
				xhr.onload = () => {
					files[idx].uploading = false;
					if (xhr.status >= 200 && xhr.status < 300) {
						files[idx].result = JSON.parse(xhr.responseText);
						files = [...files];
						resolve();
					} else {
						files[idx].result = { success: false, message: `Upload failed (${xhr.status})` };
						files = [...files];
						reject(new Error(`Upload failed (${xhr.status})`));
					}
				};
				xhr.onerror = () => {
					files[idx].uploading = false;
					files[idx].result = { success: false, message: 'Network error' };
					files = [...files];
					reject(new Error('Network error'));
				};
				xhr.send(form);
			});
			documents = [...documents, { id: files[idx].result?.sha256 || '1234567890', filename: files[idx].file.name }];
		} catch (err) {
			files[idx].uploading = false;
			files[idx].result = { success: false, message: (err as Error).message };
			files = [...files];
		}
	}
</script>

<div
	class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-2 transition hover:border-gray-400"
	tabindex="0"
	role="button"
	onkeydown={handleKeydown}
	ondrop={handleDrop}
	ondragover={handleDragOver}
>
	<input
		type="file"
		accept=".pdf"
		multiple
		style="display: none;"
		bind:this={fileInput}
		onchange={handleFileChange}
	/>
	<svg class="mb-4 h-10 w-10  " fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4-4m0 0l-4 4m4-4v12"
		/>
	</svg>
	<p class="text-lg font-medium  ">Upload sources</p>
	<p class="text-sm text-center  ">
		Drag & drop<br/>or <span
			class="cursor-pointer underline"
			onclick={() => fileInput.click()}
			onkeydown={handleKeydown}
			tabindex="0"
			role="button">click</span
		> to upload
	</p>
	<p class="mt-2 text-xs  ">
		Supported file types: PDF
	</p>
</div>

{#if files.length}
	<table class="min-w-full mt-4 text-sm text-left  border rounded-lg">
		<thead class="bg-gray-50 dark:bg-gray-800">
			<tr>
				<th class="px-4 py-2">Your Documents</th>
				<th class="px-4 py-2 w-12"></th>
			</tr>
		</thead>
		<tbody>
			{#each files as f, idx}
				<tr class="border-b last:border-b-0">
					<td class="px-4 py-2">
						<div>
							<span>{f.file.name}</span>
							{#if f.uploading}
								<span class="ml-2 text-xs text-blue-500">Uploading… {f.progress}%</span>
							{/if}
							<!-- {#if f.result}
								{#if f.result.success}
									<span class="ml-2 text-green-600">✅ {f.result.message}</span>
								{:else}
									<span class="ml-2 text-red-600">⚠️ {f.result.message}</span>
								{/if}
							{/if} -->
						</div>
						{#if f.uploading}
							<progress class="w-full mt-1" max="100" value={f.progress}></progress>
						{/if}
					</td>
					<td class="px-4 py-2 text-center">
						<button
							type="button"
							class="text-red-500 hover:text-red-700"
							aria-label="Remove file"
							onclick={() => removeFile(idx)}
						>
						<TrashBinOutline class="shrink-0 h-6 w-6" />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
