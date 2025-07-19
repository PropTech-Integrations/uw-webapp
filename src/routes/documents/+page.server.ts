import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    console.log('Fetching document data from API: /prod/document/1');

    try {
        const response = await fetch('https://378nyu75qb.execute-api.us-west-2.amazonaws.com/prod/document/1');

        if (!response.ok) {
            throw new Error(`Failed to fetch document data: ${response.statusText}`);
        }
        const data = await response.json();
        return { document: data };
    } catch (err) {
        console.error('Error fetching document data:', err);
        throw error(500, 'Could not fetch document data');
    }
};