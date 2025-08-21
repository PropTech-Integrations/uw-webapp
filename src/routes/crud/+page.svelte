<script lang="ts">
	import GraphQLCrudUI from '$lib/components/GraphQLCrudUI/GraphQLCrudUI.svelte';

	const columns = [
		{ key: 'id', label: 'ID' },
		{ key: 'name', label: 'Name' },
		{ key: 'email', label: 'Email' }
	];

	const items = [
		{ id: 1, name: 'Alice', email: 'alice@example.com' },
		{ id: 2, name: 'Bob', email: 'bob@example.com' },
		{ id: 3, name: 'Charlie', email: 'charlie@example.com' }
	];
</script>

<div class="flex">
	<GraphQLCrudUI {items} {columns} />
</div>
