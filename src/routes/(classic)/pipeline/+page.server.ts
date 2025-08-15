import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DOCUMENT_BUCKET, DOCUMENTS_TABLE, REGION, FILE_UPLOADS_BUCKET } from '$env/static/private';

import type { PageServerLoad } from './$types';

interface PropertyList {
	properties: Record<string, Property>;
}

interface Property {
	// Unique identifier for the property
	id: string;
	name?: string;
	// Address of the property
	address?: string;
	assetType?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	thumbnailUrl?: string;
	date?: string;
}

async function fetchAllDocumentHighlights() {
	const region = REGION; // from your env

	// 1) Initialize the DynamoDB client
	const rawClient = new DynamoDBClient({ region });
	const docClient = DynamoDBDocumentClient.from(rawClient);

	const params = {
		TableName: DOCUMENTS_TABLE,
		FilterExpression: 'begins_with(PK, :pkPrefix) AND begins_with(SK, :skPrefix)',
		ExpressionAttributeValues: {
			':pkPrefix': `DOCUMENT#`,
			':skPrefix': 'ASSET#INSIGHT#Highlight'
		}
	};

	let items: any[] = [];
	let ExclusiveStartKey: Record<string, any> | undefined;

	do {
		const result = await docClient.send(new ScanCommand({ ...params, ExclusiveStartKey }));
		items = items.concat(result.Items ?? []);
		ExclusiveStartKey = result.LastEvaluatedKey;
	} while (ExclusiveStartKey);

	return items;
}

const classifyHighlight = (highlight: any) => {
	switch (highlight.name) {
		case 'Property Address':
			return 'address';
		case 'Property Asset Type':
			return 'assetType';
		case 'Property City':
			return 'city';
		case 'Property Country':
			return 'country';
		case  'Property Name':
			return 'name';
		case 'Property State':
			return 'state';
		case 'Property Zip':
			return 'zip';
		default:
			return 'Unknown';
	}
};

export const load: PageServerLoad = async () => {
	const highlights = await fetchAllDocumentHighlights();
	// console.log(highlights);

	const groupHighlightsByDocumentHash = (highlights: any[]) => {
		return highlights.reduce((acc, highlight) => {
			const hash = highlight.document.hash;
			if (!acc[hash]) {
				acc[hash] = [];
			}
			acc[hash].push({"name": highlight.name, "value": highlight.value, "category": highlight.category, "createdAt": highlight.createdAt});
			return acc;
		}, {} as Record<string, any[]>);
	};

	const highlightsGroupedByHash = groupHighlightsByDocumentHash(highlights);
	// console.log(highlightsGroupedByHash);

	const convertToPropertyList = (highlightMap: Record<string, any[]>): Property[] => {
		return Object.entries(highlightMap).map(([hash, highlights]) => {
			const property: any = { 
				id: hash,
				thumbnailUrl: `https://${DOCUMENT_BUCKET}.s3.us-west-2.amazonaws.com/${hash}/images/img-0.jpeg`
			};
			let createdAt = '';
			highlights.forEach((highlight) => {
				const key = classifyHighlight(highlight);
				property[key] = highlight.value;
				if (highlight.createdAt) {
					createdAt = highlight.createdAt;
				}
			});
			property.createdAt = createdAt ? new Date(createdAt).toLocaleString() : new Date().toLocaleString();
			return property;
		});
	};

	const properties = convertToPropertyList(highlightsGroupedByHash);
	// console.log("======================")
	// console.log(properties);
	// console.log("======================")


	// highlights.forEach((highlight) => {
	// 	console.log(highlight);
	// });

	// const properties: Property[] = [
	// 	{
	// 		id: '582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8',
	// 		address: '198 NE Combs Flat Rd, Prineville, OR 97754',
	// 		thumbnailUrl: '/images/properties/198NECombs.png',
	// 		url: '/properties/582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8/summary',
	// 		statusTags: ['Draft'],
	// 		date: 'Jul 18, 2025',
	// 		isDraft: false
	// 	},
	// 	{
	// 		id: 'c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de',
	// 		address: 'Hobby Lobby 4107 Broadway Street, Mount Vernon, IL 62864',
	// 		url: '/properties/c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de/summary',
	// 		statusTags: ['Go Signal'],
	// 		thumbnailUrl: '/images/properties/hobbylobby.png',
	// 		stats: ['280 units', '$858.14M', '$3M/unit', '$2,892.40/SF', '296.69K SF', '2005/R 2022'],
	// 		cap: '0.29%',
	// 		grm: '177.01',
	// 		date: 'Jul 18, 2025'
	// 	},
	// 	{
	// 		id: 'e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d',
	// 		address: '907-1015 S. WW White Rd, San Antonio, TX 78220, USA',
	// 		url: '/properties/e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d/summary',
	// 		thumbnailUrl: '/images/properties/loneoak.png',
	// 		statusTags: [],
	// 		stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
	// 		cap: '3.17%',
	// 		grm: '18.94',
	// 		date: 'Jul 18, 2025'
	// 	},
	// 	{
	// 		id: '27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5',
	// 		address: '9440-9680 Hageman Rd, Bakersfield, CA 93306, USA',
	// 		url: '/properties/27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5/summary',
	// 		thumbnailUrl: '/images/properties/plazaAtRiverLakes.png',
	// 		statusTags: [],
	// 		stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
	// 		cap: '3.17%',
	// 		grm: '18.94',
	// 		date: 'Jul 18, 2025'
	// 	}
	// ];
	// Return data to be used in the +page.svelte component
	return {
		properties: properties
	};
};
