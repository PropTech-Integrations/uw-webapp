<script lang="ts">
	import { dashboard } from '$lib/dashboard/stores/dashboard.svelte';

	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let exportedJson = $state('');
	let importJson = $state('');
	let importError = $state('');

	function handleSave() {
		const success = dashboard.save();
		if (success) {
			alert('Dashboard saved successfully!');
		} else {
			alert('Failed to save dashboard. Please check browser settings.');
		}
	}

	function handleClear() {
		//   if (confirm('Are you sure you want to clear the saved dashboard layout? This cannot be undone.')) {
		dashboard.clearSavedDashboard();
		//     alert('Saved dashboard cleared. Refresh to see default layout.');
		//   }
	}

	function handleReset() {
		if (
			confirm('Are you sure you want to reset to the default layout? This will clear all widgets.')
		) {
			dashboard.resetToDefault();
		}
	}

	function handleExport() {
		const json = dashboard.exportDashboard();
		if (json) {
			exportedJson = json;
			showExportDialog = true;
		} else {
			alert('Failed to export dashboard');
		}
	}

	function handleImport() {
		importError = '';
		const success = dashboard.importDashboard(importJson);
		if (success) {
			showImportDialog = false;
			importJson = '';
			alert('Dashboard imported successfully!');
		} else {
			importError = 'Invalid dashboard configuration. Please check the JSON format.';
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(exportedJson).then(() => {
			alert('Dashboard configuration copied to clipboard!');
		});
	}

	function downloadJson() {
		const blob = new Blob([exportedJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="dashboard-controls flex items-center gap-2 border-b bg-white p-4">
	<div class="flex flex-1 items-center gap-2">
		<!-- Auto-save toggle -->
		<label class="flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				checked={dashboard.autoSaveEnabled}
				onchange={(e) => dashboard.setAutoSave(e.currentTarget.checked)}
				class="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
			/>
			<span class="text-sm text-gray-700">Auto-save</span>
		</label>

		<!-- Dev Mode toggle -->
		<label class="ml-4 flex cursor-pointer items-center gap-2">
			<input
				type="checkbox"
				checked={dashboard.devMode}
				onchange={(e) => dashboard.setDevMode(e.currentTarget.checked)}
				class="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
			/>
			<span class="text-sm text-gray-700">Dev Mode</span>
			<span class="text-xs text-gray-500">(disable storage)</span>
		</label>

		{#if dashboard.hasUnsavedChanges}
			<span class="ml-2 text-xs text-orange-600">• Unsaved changes</span>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<!-- Manual Save -->
		<button
			onclick={handleSave}
			disabled={!dashboard.hasUnsavedChanges}
			class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
		>
			Save Layout
		</button>

		<!-- Export -->
		<button
			onclick={handleExport}
			class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
		>
			Export
		</button>

		<!-- Import -->
		<button
			onclick={() => (showImportDialog = true)}
			class="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
		>
			Import
		</button>

		<!-- Reset -->
		<button
			onclick={handleReset}
			class="rounded bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
		>
			Reset
		</button>

		<!-- Clear Storage -->
		<button
			onclick={handleClear}
			class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
		>
			Clear Saved
		</button>
	</div>
</div>

<!-- Export Dialog -->
{#if showExportDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
		<div
			class="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white p-6"
		>
			<h3 class="mb-4 text-lg font-semibold">Export Dashboard Configuration</h3>

			<div class="mb-4 flex-1 overflow-auto">
				<textarea
					readonly
					value={exportedJson}
					class="h-64 w-full rounded border bg-gray-50 p-3 font-mono text-xs"
				></textarea>
			</div>

			<div class="flex justify-end gap-2">
				<button
					onclick={copyToClipboard}
					class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
				>
					Copy to Clipboard
				</button>
				<button
					onclick={downloadJson}
					class="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
				>
					Download JSON
				</button>
				<button
					onclick={() => (showExportDialog = false)}
					class="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import Dialog -->
{#if showImportDialog}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
		<div class="w-full max-w-2xl rounded-lg bg-white p-6">
			<h3 class="mb-4 text-lg font-semibold">Import Dashboard Configuration</h3>

			<div class="mb-4">
				<textarea
					bind:value={importJson}
					placeholder="Paste your dashboard JSON configuration here..."
					class="h-64 w-full rounded border p-3 font-mono text-xs"
				></textarea>
			</div>

			{#if importError}
				<p class="mb-4 text-sm text-red-600">{importError}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<button
					onclick={handleImport}
					disabled={!importJson.trim()}
					class="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Import
				</button>
				<button
					onclick={() => {
						showImportDialog = false;
						importJson = '';
						importError = '';
					}}
					class="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dashboard-controls {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>
