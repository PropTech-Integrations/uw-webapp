<script lang="ts">
	import { Button, Input, Label, Modal, Textarea, Checkbox, Select } from 'flowbite-svelte';
	import type { UserModalProps } from './types';

	let { open = $bindable(true), data }: UserModalProps = $props();

	function init(form: HTMLFormElement) {
		for (const key in data) {
			const el = form.elements.namedItem(key);
			if (!el) continue;
			if (el instanceof HTMLInputElement) {
				if (el.type === 'checkbox') {
					el.checked = Boolean((data as any)[key]);
				} else {
					el.value = String((data as any)[key] ?? '');
				}
			} else if (el instanceof HTMLTextAreaElement) {
				el.value = String((data as any)[key] ?? '');
			} else if (el instanceof HTMLSelectElement) {
				el.value = String((data as any)[key] ?? '');
			}
		}
	}
</script>

<Modal
	bind:open
	title={Object.keys(data).length ? 'Edit project' : 'Add new project'}
	size="md"
	class="m-4"
>
	<!-- Modal body -->
	<div class="space-y-6 p-0">
		<form action="#" use:init>
			<div class="grid grid-cols-6 gap-6">
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Name</span>
					<Input name="name" class="border outline-none" placeholder="e.g. Downtown Office Tower" required />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Asset Type</span>
					<Input name="assetType" class="border outline-none" placeholder="e.g. Office" required />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Address</span>
					<Input name="address" class="border outline-none" placeholder="e.g. 100 Market St" required />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>City</span>
					<Input name="city" class="border outline-none" placeholder="e.g. San Francisco" />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>State</span>
					<Input name="state" class="border outline-none" placeholder="e.g. CA" />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Zip</span>
					<Input name="zip" class="border outline-none" placeholder="e.g. 94105" />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Country</span>
					<Input name="country" class="border outline-none" placeholder="e.g. USA" />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Image URL</span>
					<Input name="image" class="border outline-none" placeholder="e.g. ./images/downtown-office.png" />
				</Label>
				<Label class="col-span-6 space-y-2">
					<span>Description</span>
					<Textarea
						id="description"
						name="description"
						rows={4}
						class="w-full bg-gray-50 outline-none dark:bg-gray-700"
						placeholder="Project description"
					/>
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Status</span>
					<Select name="status" class="border outline-none">
						<option value="Active">Active</option>
						<option value="Archived">Archived</option>
						<option value="Deleted">Deleted</option>
					</Select>
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Tags (comma separated)</span>
					<Input name="tags" class="border outline-none" placeholder="e.g. Office, High-rise, Downtown" />
				</Label>
				<Label class="col-span-6 space-y-2 sm:col-span-3">
					<span>Public</span>
					<div class="flex items-center space-x-2">
						<Checkbox name="isPublic" />
						<span class="text-sm text-gray-600 dark:text-gray-300">Make project public</span>
					</div>
				</Label>
			</div>
		</form>
	</div>

	<!-- Modal footer -->
	{#snippet footer()}
		<Button type="submit">{Object.keys(data).length ? 'Save project' : 'Add project'}</Button>
	{/snippet}
</Modal>

<!--
  @component
  [Go to docs](https://flowbite-svelte-admin-dashboard.vercel.app/)
  ## Type
  [UserModalProps](https://github.com/themesberg/flowbite-svelte-admin-dashboard/blob/main/src/lib/types.ts#L244)
  ## Props
  @prop open = $bindable(true)
  @prop data
  -->
