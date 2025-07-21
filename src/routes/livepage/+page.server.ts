import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	console.log('Fetching document data from API: /prod/document/1');

	try {
		const response = await fetch(
			'https://378nyu75qb.execute-api.us-west-2.amazonaws.com/prod/document/1'
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch document data: ${response.statusText}`);
		}
		const data = await response.json();

		if (data.length === 0) {
			return {
				document: []
			};
		}
		// // Sort the data by pageId
		// if (Array.isArray(data)) {
		//     data.sort((a, b) => a.pageId - b.pageId);
		// }

		// let filteredData = data.filter((item: any) => item.SK.startsWith('ASSET#TEXT#') || item.SK.startsWith('ASSET#IMAGE#') || item.SK.startsWith('ASSET#PAGE#'));
		let filteredData = data.filter(
			(item: any) =>
				item.SK.startsWith('ASSET#TEXT#') ||
				item.SK.startsWith('ASSET#PAGE#') ||
				item.SK.startsWith('ASSET#IMAGE#')
		);
		let pages = filteredData.filter((item: any) => item.SK.startsWith('ASSET#PAGE#'));
		let images = filteredData.filter((item: any) => item.SK.startsWith('ASSET#IMAGE#'));
		let texts = filteredData.filter((item: any) => item.SK.startsWith('ASSET#TEXT#'));

		// Remove duplicate pages by pageId
		const uniquePages = new Map<number, any>();
		pages.forEach((page: any) => {
			if (!uniquePages.has(page.pageId)) {
				uniquePages.set(page.pageId, page);
			}
		});
		pages = Array.from(uniquePages.values());


		// Sort uniqueTexts by pageId
		pages.sort((a: number, b: number) => a - b);

		let organizedData: { pageId: number; url: string; images: any[]; text: string }[] = [];
		pages.forEach((page: any) => {
			console.log('Page Id', page.pageId);
			let text =
				filteredData.find(
					(text: any) => text.pageId == page.pageId-1 && text.SK.startsWith('ASSET#TEXT#')
				)?.text.replace(/!\[.*?\]\(.*?\)/g, '') || 'default text';

			let images = filteredData.filter((image: any) => image.pageId === page.pageId && image.SK.startsWith('ASSET#IMAGE'));
			// let text = filteredData.find((text: any) => text.pageId === page.pageId && text.SK.startsWith('ASSET#TEXT#'))?.text.replace(/!\[.*?\]\(.*?\)/g, '') || '';
			let url = 'https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/' + page.key;

			organizedData.push({
			    pageId: Number(page.pageId),
			    url: url,
			    images: images,
			    text: text,
			});
		});
        organizedData.sort((a, b) => a.pageId - b.pageId);


		// console.log("Organized Data", organizedData)
		return { document: organizedData };
	} catch (err) {
		console.error('Error fetching document data:', err);
		throw error(500, 'Could not fetch document data');
	}
};
