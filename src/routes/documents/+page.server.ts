import type { PageServerLoad } from './$types';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

import {DOCUMENTS_TABLE, REGION} from '$env/static/private';
const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const load: PageServerLoad = async () => {
	// console.log("params -------------------------->", params.id)
    // const DOCUMENT_HASH = params.id;
	try {
		const documentCommand = new ScanCommand({
			TableName: DOCUMENTS_TABLE,
			FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
			ExpressionAttributeValues: {
				':pk': 'DOCUMENT',
				':sk': 'METADATA'
			}
		});

		const documentResponse = await ddbDocClient.send(documentCommand);

		console.log("documentResponse -------------------------->", documentResponse)

		return {
			documents: documentResponse.Items
		};
	} catch (error) {
		console.error("Error fetching document -------------------------->", error);
		throw error;
	}
}