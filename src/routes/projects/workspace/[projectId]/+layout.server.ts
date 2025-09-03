import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Q_GET_PROJECT_BY_ID } from '$lib/realtime/graphql/queries/Project';
import { gql } from '$lib/realtime/graphql/requestHandler';
import type { Project } from '$lib/types/Project';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	let { projectId } = params;

	const idToken = cookies.get('id_token');
	if (!idToken) {
		throw error(401, 'Not Authorized');
	}

	const response = await gql<{ getProject: Project }>(
		Q_GET_PROJECT_BY_ID,
		{ id: projectId },
		idToken
	);
	if (!response) {
		throw error(404, 'Project not found');
	}

	if (!response.getProject) {
		throw error(404, 'Project not found');
	}

	return {
		project: response.getProject,
		idToken: idToken
	};
};
