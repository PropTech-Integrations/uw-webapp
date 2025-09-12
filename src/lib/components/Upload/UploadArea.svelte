<!-- // Todos
// 1. Integrate GraphQL to update project.documents when files are uploaded or removed
// 2. Integrate the Project Store to update the documents when files are uploaded or removed
// 3. Create variable in the Project Store to represent a currently selected document -->

<script lang="ts">
	import { browser } from '$app/environment';
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Import Types and Data Stores
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	import type { Project, ProjectDocument } from '$lib/types/Project';
	import { project as projectStore, updateProject } from '$lib/stores/project.svelte';
	import { gql } from '$lib/realtime/graphql/requestHandler';
	import { M_UPDATE_PROJECT } from '$lib/realtime/graphql/mutations/Project';

	let { idToken }: { idToken: string } = $props();
	let project: Project = $derived($projectStore)!;

	// Documents are derived from the project store
	let documents = $derived(project?.documents || []);

	// Files are derived from the documents and are local to the component
	let files: {
		file: File;
		uploading: boolean;
		progress: number;
		result: { success: boolean; message: string; sha256?: string } | null;
		documentId?: string;
	}[] = $derived(
		documents.map((doc: ProjectDocument) => ({
			file: new File([], doc.filename),
			uploading: false,
			progress: 0,
			result: null,
			documentId: doc.id
		}))
	);

	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Logging
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	import { logger } from '$lib/logging/debug';


   async function graphQLUpdateProjectDocuments(documents: ProjectDocument[]) {
	try {
			const res = await gql<{ updateProject: Project }>(
				M_UPDATE_PROJECT,
				{ input: { id: project.id, documents: documents } },
				idToken
			);
		} catch (e) {
			console.error('Error updating project documents:', e);
			throw e;
		}
	}
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	// Svelte Component Functions
	// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
	import { TrashBinOutline } from 'flowbite-svelte-icons';
	import YesNoDialog from '$lib/components/Dialog/YesNoDialog.svelte';

	let fileInput: HTMLInputElement;
	let openDelete = $state(false);
	let current_file: any = $state(null);

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
		logger('idx: ', idx);
		const removedFile = files[idx];
		files = files.slice(0, idx).concat(files.slice(idx + 1));
		documents = documents.filter((doc: ProjectDocument) => doc.filename !== removedFile.file.name);
	}

	async function removeDocumentFromProject(documentId: string) {
		await graphQLUpdateProjectDocuments(project.documents.filter((doc) => doc.id !== documentId));
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
				xhr.onload = async () => {
					files[idx].uploading = false;
					if (xhr.status >= 200 && xhr.status < 300) {
						const result = JSON.parse(xhr.responseText);
						const updatedDocuments = project.documents
						logger('xhr.onload updatedDocuments: ', updatedDocuments);
						updatedDocuments.push({ id: result.sha256, filename: files[idx].file.name });
						await graphQLUpdateProjectDocuments(updatedDocuments);
						files[idx].result = result;
						logger('files[idx].result: ', files[idx].result);
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
			documents = [
				...documents,
				{ id: files[idx].result?.sha256 || '1234567890', filename: files[idx].file.name }
			];
		} catch (err) {
			files[idx].uploading = false;
			files[idx].result = { success: false, message: (err as Error).message };
			files = [...files];
		}
	}
</script>

<div
	class="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-2 pb-4 transition hover:border-gray-300 dark:border-gray-500"
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
	<svg class="mb-4 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4-4m0 0l-4 4m4-4v12"
		/>
	</svg>
	<p class="text-lg font-medium">Upload sources</p>
	<p class="text-center text-sm">
		Drag & drop<br />or
		<span
			class="cursor-pointer underline"
			onclick={() => fileInput.click()}
			onkeydown={handleKeydown}
			tabindex="0"
			role="button">click</span
		> to upload
	</p>
	<p class="mt-2 text-xs">Supported file types: PDF</p>
</div>

{#if files.length}
	<table class="mt-4 min-w-full border border-gray-300 text-left text-sm dark:border-gray-500">
		<thead
			class="border border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
		>
			<tr>
				<th class="px-4 py-2">Your Documents</th>
				<th class="w-12 px-4 py-2"></th>
			</tr>
		</thead>
		<tbody>
			{#each files as f, idx}
				<tr class="border border-b border-gray-300 last:border-b-0 dark:border-gray-500">
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
							<progress class="mt-1 w-full" max="100" value={f.progress}></progress>
						{/if}
					</td>
					<td class="px-4 py-2 text-center">
						<button
							type="button"
							class="text-red-500 hover:text-red-700"
							aria-label="Remove file"
						>
							<TrashBinOutline
								class="h-6 w-6 shrink-0"
								onclick={() => ((current_file = files[idx]), (openDelete = true))}
							/>
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
<YesNoDialog
	bind:open={openDelete}
	data={current_file}
	{idToken}
	onConfirm={() => removeDocumentFromProject(current_file?.documentId || '')}
/>
