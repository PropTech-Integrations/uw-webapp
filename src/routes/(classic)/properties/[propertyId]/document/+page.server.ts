// src/routes/documents/[hash]/+page.server.ts
import type { PageServerLoad } from './$types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DOCUMENTS_TABLE, REGION } from '$env/static/private';
import { buildProperty } from '$lib/db/buildProperty';
import type { IInsight } from '$lib/db/buildProperty';

export const load: PageServerLoad = async ({ params }) => {
  const documentHash = params.propertyId;         // pulled from the URL
  const tableName = DOCUMENTS_TABLE;              // from your env
  const region = REGION;                          // from your env

  // 1) Initialize the DynamoDB client
  const rawClient = new DynamoDBClient({ region });
  const docClient = DynamoDBDocumentClient.from(rawClient);

  // 2) Build PK and prepare pagination variables
  const pkValue = `DOCUMENT#${documentHash}`;
  let lastEvaluatedKey: Record<string, any> | undefined = undefined;
  const allItems: Record<string, any>[] = [];

  // 3) Page through results
  do {
    const cmd: QueryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': pkValue },
      ExclusiveStartKey: lastEvaluatedKey,
      // optional: Limit: 100,
    });

    const response = await docClient.send(cmd);
    const { Items, LastEvaluatedKey } = response;
    if (Items) {
      allItems.push(...Items);
    }
    lastEvaluatedKey = LastEvaluatedKey;
  } while (lastEvaluatedKey);

  
  // 4) Transform the items to a property object
  const property = buildProperty(allItems as IInsight[]);

  // 4) Return to the page as `items`
  return { property };
};
