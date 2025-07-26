import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const REGION = 'us-west-2'; // Update to your region
const TABLE_NAME = 'uw-dev-documents-e1tez94r';
const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const load: PageServerLoad = async () => {
	// console.log("params -------------------------->", params.id)
    // const DOCUMENT_HASH = params.id;
	try {
		const documentCommand = new ScanCommand({
			TableName: TABLE_NAME,
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