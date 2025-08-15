<script lang="ts">
	const data = $props<{
		profile: { username: string; attributes: Record<string, string | null> };
		claims: Record<string, unknown>;
	}>();

	// Svelte 5 runes
	let tab = $state<'attributes' | 'claims'>('attributes');

	const attrsEntries = Object.entries(data.profile.attributes).sort((a, b) =>
		a[0].localeCompare(b[0])
	);
	const claimsEntries = Object.entries(data.claims).sort((a, b) => a[0].localeCompare(b[0]));
</script>

<h1 class="mb-3 text-2xl font-semibold">My Profile</h1>

<div class="mb-2">
	<div><strong>Username:</strong> {data.profile.username}</div>
</div>

<div class="my-3 flex gap-2">
	<button onclick={() => (tab = 'attributes')} aria-pressed={tab === 'attributes'}>
		User Pool Attributes
	</button>
	<button onclick={() => (tab = 'claims')} aria-pressed={tab === 'claims'}>
		ID Token Claims
	</button>
</div>

{#if tab === 'attributes'}
	<h2 class="mb-2 text-xl">Attributes</h2>
	{#if attrsEntries.length === 0}
		<p>No attributes.</p>
	{:else}
		<ul>
			{#each attrsEntries as [k, v]}
				<li><code>{k}</code>: {v ?? 'null'}</li>
			{/each}
		</ul>
	{/if}
{:else}
	<h2 class="mb-2 text-xl">ID Token Claims</h2>
	{#if claimsEntries.length === 0}
		<p>No claims.</p>
	{:else}
		<ul>
			{#each claimsEntries as [k, v]}
				<li><code>{k}</code>: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	button[aria-pressed='true'] {
		font-weight: 600;
		text-decoration: underline;
	}
	ul {
		list-style: none;
		padding-left: 0;
	}
	li {
		padding: 2px 0;
	}
	code {
		background: rgba(0, 0, 0, 0.05);
		padding: 0 0.25rem;
		border-radius: 0.25rem;
	}
</style>
