<script lang="ts">
	import { Button, Modal } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import type { DeleteModalProps } from './types';
	import { gql } from '$lib/realtime/websocket/AppSyncWsClient';
	import type { UserItem } from '$lib/types/UserItem';

	let {
		open = $bindable(true),
		title = 'Are you sure you want to delete this?',
		yes = "Yes, I'm sure",
		no = 'No, cancel',
		data,
		idToken
	}: DeleteModalProps = $props();

	$inspect(data);
	async function deleteProject(id: string, idToken: string) {
		console.log('deleteProject', id);
		const mutation = `
		mutation DeleteProject($input: DeleteUserItemInput!) {
			deleteUserItem(input: $input) {
		      entityType entityId data createdAt
			}
		}
	`;
		const input = { entityType: 'PROJECT', entityId: id };
		console.log('input', JSON.stringify(input, null, 2));
		try {
			const res = await gql<{ deleteUserItem: UserItem }>(mutation, { input }, idToken);
			return res.deleteUserItem;
		} catch (e) {
			console.error('Error deleting project:', e);
			throw e;
		}
	}
</script>

<Modal bind:open size="sm">
	<ExclamationCircleOutline class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />

	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-300">{title}</h3>
	<div class="mb-6 flex flex-row items-center rounded-lg p-4">
		<img src={data.image} alt={data.name} class="h-50 w-50 mr-6 rounded" />
		<div class="flex flex-col items-start">
			<div class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{data.name}</div>
			<div class="mb-1 text-sm text-gray-500 dark:text-gray-300">{data.address}</div>
			<div class="mb-1 text-sm text-gray-500 dark:text-gray-300">
				{data.city}, {data.state}
				{data.zip}
			</div>
			<div class="mb-1 text-xs text-gray-400 dark:text-gray-400">Type: {data.assetType}</div>
			<div class="mb-1 text-xs text-gray-400 dark:text-gray-400">Status: {data.status}</div>
		</div>
	</div>

	<div class="flex items-center justify-center">
		<Button
			color="red"
			class="mr-2"
			onclick={async () => {
				await deleteProject(data.id, idToken);
				open = false;
			}}>{yes}</Button
		>
		<Button color="alternative" onclick={() => (open = false)}>{no}</Button>
	</div>
</Modal>

<!--
  @component
  [Go to docs](https://flowbite-svelte-admin-dashboard.vercel.app/)
  ## Type
  [DeleteModalProps](https://github.com/themesberg/flowbite-svelte-admin-dashboard/blob/main/src/lib/types.ts#L237)
  ## Props
  @prop open = $bindable(true)
  @prop title = 'Are you sure you want to delete this?'
  @prop yes = "Yes, I'm sure"
  @prop no = 'No, cancel'
  -->
