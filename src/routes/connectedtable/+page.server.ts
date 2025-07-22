// Import SvelteKit types and libraries
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

import { getAWSIdentityId } from '$lib/auth/cognito';
import { getDynamoDBClient } from '$lib/db/awsClient';
import { getDataByUser } from '$lib/db/queries/getDataByUser';
// src/routes/+page.server.ts

export const load: PageServerLoad = async ({ locals, cookies }) => {
	console.log('Entering Server side load function: /connectedtable');

	const idTokencookies = cookies.get('id_token');
	const idTokenLocals = locals.user?.id_token;
	const idToken = cookies.get('id_token') || locals.user?.id_token;

	if (!idToken) throw error(401, 'Authentication required. IdToken is not set.');

	let identityId;
	let ddb;
	let data;
	try {
		identityId = await getAWSIdentityId({ idToken });
	} catch {
		throw error(401, 'Authentication required. getAWSIdentityId failed.');
	}

	try {
		ddb = await getDynamoDBClient(idToken);
	} catch {
		throw error(401, 'Authentication required. getDynamoDBClient failed.');
	}
	
	// console.log('ddb: ', ddb);
	console.log('identityId: ', identityId);



	// try {
	// 	data = await getDataByUser(ddb, identityId);
	// 	return { data };
	// } catch(e) {
	// 	console.error('Error in getDataByUser: ', e);
	// 	throw error(401, 'Authentication required. getDataByUser failed.');
	// }
};
