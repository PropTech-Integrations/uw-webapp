import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { PageServerLoad } from './$types';

/**
 * Asynchronously loads property data to be used in the +page.svelte component.
 *
 * @returns {Promise<{ properties: Property[] }>} An object containing an array of properties.
 */
export const load: PageServerLoad = async () => {
	interface Property {
		// Unique identifier for the property
		id: string;
		// Address of the property
		address: string;
		// URL to the property's detailed page
		url: string;
		// Optional URL for the property's thumbnail image
		thumbnailUrl?: string;
		// Array of status tags associated with the property
		statusTags: string[];
		// Optional array of statistical data related to the property
		stats?: string[];
		// Optional capitalization rate of the property
		cap?: string;
		// Optional gross rent multiplier of the property
		grm?: string;
		// Date associated with the property, e.g., listing date
		date: string;
		// Optional flag indicating if the property is a draft
		isDraft?: boolean;
	}

    // try {
    //     const documentCommand = new ScanCommand({
	// 		TableName: TABLE_NAME,
	// 		FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
	// 		ExpressionAttributeValues: {
	// 			':pk': 'DOCUMENT',
	// 			':sk': 'METADATA'
	// 		}
	// 	});


	const properties: Property[] = [
		{
			id: '582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8',
			address: '198 NE Combs Flat Rd, Prineville, OR 97754',
			thumbnailUrl: '/images/properties/198NECombs.png',
			url: '/properties/582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8/summary',
			statusTags: ['Draft'],
			date: 'Jul 18, 2025',
			isDraft: false
		},
		{
			id: 'c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de',
			address: 'Hobby Lobby 4107 Broadway Street, Mount Vernon, IL 62864',
			url: '/properties/c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de/summary',
			statusTags: ['Go Signal'],
			thumbnailUrl: '/images/properties/hobbylobby.png',
			stats: ['280 units', '$858.14M', '$3M/unit', '$2,892.40/SF', '296.69K SF', '2005/R 2022'],
			cap: '0.29%',
			grm: '177.01',
			date: 'Jul 18, 2025'
		},
		{
			id: 'e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d',
			address: '907-1015 S. WW White Rd, San Antonio, TX 78220, USA',
			url: '/properties/e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d/summary',
			thumbnailUrl: '/images/properties/loneoak.png',
			statusTags: [],
			stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
			cap: '3.17%',
			grm: '18.94',
			date: 'Jul 18, 2025'
		},
		{
			id: '27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5',
			address: '9440-9680 Hageman Rd, Bakersfield, CA 93306, USA',
			url: '/properties/27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5/summary',
			thumbnailUrl: '/images/properties/plazaAtRiverLakes.png',
			statusTags: [],
			stats: ['8 units', '$6.1M', '$763K/unit', '$948.09/SF', '6.43K SF', '2001/R 2018'],
			cap: '3.17%',
			grm: '18.94',
			date: 'Jul 18, 2025'
		}
	];
	// Return data to be used in the +page.svelte component
	return {
		properties,
	};
};
