// src/routes/upload/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { REGION, FILE_UPLOADS_BUCKET } from '$env/static/private';

const s3 = new S3Client({ region: REGION });

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const file = form.get('file');

	if (!(file instanceof File)) {
		return new Response(JSON.stringify({ success: false, message: 'No file provided' }), {
			status: 400
		});
	}

	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// Calculate SHA256 hash of the file
	const sha256Hash = createHash('sha256').update(buffer).digest('hex');

	// Use the hash and append the file extension as the key for S3
	const key = `${sha256Hash}${file.name.substring(file.name.lastIndexOf('.'))}`;
	console.log(key)
	try {
		const command = new PutObjectCommand({
			Bucket: FILE_UPLOADS_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: file.type,
			ChecksumAlgorithm: 'SHA256'
		});
		console.log(command)
		await s3.send(command);

		return new Response(
			JSON.stringify({
				success: true,
				message: `Stored as ${key}`,
				sha256: sha256Hash
			}),
			{
				status: 200
			}
		);
	} catch (err) {
		console.error('S3 upload error', err);
		return new Response(JSON.stringify({ success: false, message: 'Upload failed' }), {
			status: 500
		});
	}
};
