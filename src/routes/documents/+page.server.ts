
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const REGION = 'us-west-2'; // Update to your region
const TABLE_NAME = 'uw-dev-documents-e1tez94r';
const DOCUMENT_HASH = "c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de";
const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const load: PageServerLoad = async () => {
	try {
		const pageCommand = new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: 'PK = :pk and begins_with(SK, :prefix)',
			ExpressionAttributeValues: {
				':pk': `DOCUMENT#${DOCUMENT_HASH}`,
				':prefix': 'ASSET#PAGE#'
			}
		});

		const textCommand = new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: 'PK = :pk and begins_with(SK, :prefix)',
			ExpressionAttributeValues: {
				':pk': `DOCUMENT#${DOCUMENT_HASH}`,
				':prefix': 'ASSET#TEXT#'
			}
		});

		const [pageResponse, textResponse] = await Promise.all([
			ddbDocClient.send(pageCommand),
			ddbDocClient.send(textCommand)
		]);

		if (!pageResponse.Items || pageResponse.Items.length === 0) {
			return {
				document: []
			};
		}

		const pages = pageResponse.Items;
		const texts = textResponse.Items || [];

		const uniquePages = new Map<number, any>();
		pages.forEach((page: any) => {
			if (!uniquePages.has(page.pageId)) {
				uniquePages.set(page.pageId, page);
			}
		});
		const uniquePagesArray = Array.from(uniquePages.values());

		uniquePagesArray.sort((a: any, b: any) => a.pageId - b.pageId);

		let organizedData: {
			pageId: number;
			url: string;
			images: any[];
			text: string;
			entities: any[];
		}[] = [];

		for (const page of uniquePagesArray) {
			let url = 'https://uw-dev-documents-e1tez94r.s3.us-west-2.amazonaws.com/' + page.key;
			let textItem = texts.find((text: any) => text.pageId === page.pageId);
			let text = textItem ? textItem.text : '';

			// Fetch insights for the current page
			const insightCommand = new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: 'PK = :pk and begins_with(SK, :prefix)',
				ExpressionAttributeValues: {
					':pk': `DOCUMENT#${DOCUMENT_HASH}`,
					':prefix': `ASSET#INSIGHT#${String(Number(page.pageId)-1)}#`
				}
			});
            console.log("insightCommand -------------------------->", insightCommand)

			const insightResponse = await ddbDocClient.send(insightCommand);
			const insights = insightResponse.Items || [];

			organizedData.push({
				pageId: Number(page.pageId),
				url: url,
				images: [], // Placeholder, as images are not fetched in this call
				text: text,
				entities: insights
			});

            organizedData.forEach((page) => {
                console.log("page -------------------------->", page.pageId)
            })
		}

		// console.log("Organized Data", organizedData);
		return { document: organizedData };
	} catch (err) {
		console.error('Error fetching document data:', err);
		throw error(500, 'Could not fetch document data');
	}
};