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
      if (confirm('Are you sure you want to clear the saved dashboard layout? This cannot be undone.')) {
        dashboard.clearSavedDashboard();
        alert('Saved dashboard cleared. Refresh to see default layout.');
      }
    }
    
    function handleReset() {
      if (confirm('Are you sure you want to reset to the default layout? This will clear all widgets.')) {
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
  
  <div class="dashboard-controls flex items-center gap-2 p-4 bg-white border-b">
    <div class="flex items-center gap-2 flex-1">
      <!-- Auto-save toggle -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={dashboard.autoSaveEnabled}
          onchange={(e) => dashboard.setAutoSave(e.currentTarget.checked)}
          class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700">Auto-save</span>
      </label>
      
      {#if dashboard.hasUnsavedChanges}
        <span class="text-xs text-orange-600 ml-2">• Unsaved changes</span>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      <!-- Manual Save -->
      <button
        onclick={handleSave}
        disabled={!dashboard.hasUnsavedChanges}
        class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save Layout
      </button>
      
      <!-- Export -->
      <button
        onclick={handleExport}
        class="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
      >
        Export
      </button>
      
      <!-- Import -->
      <button
        onclick={() => showImportDialog = true}
        class="px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Import
      </button>
      
      <!-- Reset -->
      <button
        onclick={handleReset}
        class="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset
      </button>
      
      <!-- Clear Storage -->
      <button
        onclick={handleClear}
        class="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear Saved
      </button>
    </div>
  </div>
  
  <!-- Export Dialog -->
  {#if showExportDialog}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <h3 class="text-lg font-semibold mb-4">Export Dashboard Configuration</h3>
        
        <div class="flex-1 overflow-auto mb-4">
          <textarea
            readonly
            value={exportedJson}
            class="w-full h-64 p-3 border rounded font-mono text-xs bg-gray-50"
          />
        </div>
        
        <div class="flex gap-2 justify-end">
          <button
            onclick={copyToClipboard}
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy to Clipboard
          </button>
          <button
            onclick={downloadJson}
            class="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download JSON
          </button>
          <button
            onclick={() => showExportDialog = false}
            class="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Import Dialog -->
  {#if showImportDialog}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 class="text-lg font-semibold mb-4">Import Dashboard Configuration</h3>
        
        <div class="mb-4">
          <textarea
            bind:value={importJson}
            placeholder="Paste your dashboard JSON configuration here..."
            class="w-full h-64 p-3 border rounded font-mono text-xs"
          />
        </div>
        
        {#if importError}
          <p class="text-red-600 text-sm mb-4">{importError}</p>
        {/if}
        
        <div class="flex gap-2 justify-end">
          <button
            onclick={handleImport}
            disabled={!importJson.trim()}
            class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
          <button
            onclick={() => {
              showImportDialog = false;
              importJson = '';
              importError = '';
            }}
            class="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
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