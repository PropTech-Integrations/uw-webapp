<script lang="ts">
	import { Button, Progressbar, Fileupload } from 'flowbite-svelte';

	type Status = 'idle' | 'uploading' | 'done' | 'error';

	let file: File | null = null;
	let checksum: string | null = null;
	let progress = 0;
	let status: Status = 'idle';
	let message = '';

	// 1) When a file is chosen, compute SHA‑256 and Base64‑encode it
	async function handleFileChange(e: Event) {
		file = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
		progress = 0;
		status = 'idle';
		message = '';
		checksum = null;

		if (file) {
			// read file into memory
			const buffer = await file.arrayBuffer();
			// compute SHA‑256 digest
			const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);                  // :contentReference[oaicite:0]{index=0}
			// turn ArrayBuffer into Uint8Array, then Base64
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			checksum = btoa(String.fromCharCode(...hashArray));                                 // :contentReference[oaicite:1]{index=1}
		}
	}

	// 2) Upload with checksum headers
	async function upload() {
		if (!file || !checksum) {
			status = 'error';
			message = 'File or checksum missing';
			return;
		}

		status = 'uploading';

		try {
			// get presigned URL (must have been signed to allow the checksum headers)
			const res = await fetch('/api/upload-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type,
					// if your backend needs it, you can also send the checksum here
					checksumAlgorithm: 'SHA256',
					checksumSHA256: checksum
				})
			});
			if (!res.ok) throw new Error('Couldn’t get upload URL');

			const { url } = await res.json();

			// do the upload via XHR so we can track progress and set headers
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('PUT', url);
				xhr.setRequestHeader('Content-Type', file!.type);
				xhr.setRequestHeader('x-amz-checksum-algorithm', 'SHA256');
				xhr.setRequestHeader('x-amz-checksum-sha256', checksum!);                          // :contentReference[oaicite:2]{index=2}

				xhr.upload.onprogress = e => {
					if (e.lengthComputable) {
						progress = Math.round((e.loaded / e.total) * 100);
					}
				};
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(new Error(`Upload failed (${xhr.status})`));
				};
				xhr.onerror = () => reject(new Error('Network error'));
				xhr.send(file);
			});

			status = 'done';
			message = 'Upload complete!';
		} catch (err) {
			status = 'error';
			message = (err as Error).message;
		}
	}
</script>

<Fileupload onchange={handleFileChange} />

{#if file}
	<div class="space-y-2">
		{#if checksum}
			<p class="font-mono text-sm">SHA‑256 checksum (Base64): {checksum}</p>
		{/if}

		<Button onclick={upload} disabled={status === 'uploading'}>
			{status === 'uploading' ? `Uploading… ${progress}%` : `Upload “${file.name}”`}
		</Button>

		<Progressbar {progress} />

		{#if status === 'done'}
			<p class="text-green-600">✅ {message}</p>
		{:else if status === 'error'}
			<p class="text-red-600">⚠️ {message}</p>
		{/if}
	</div>
{/if}
