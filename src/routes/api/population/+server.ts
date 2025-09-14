import type { RequestHandler } from '@sveltejs/kit';
import * as turf from '@turf/turf';

type GeocodeResultsJson = {
        result: {
            input: {
                address: { address: string };
                benchmark: {
                    isDefault: boolean;
                    benchmarkDescription: string;
                    id: string;
                    benchmarkName: string;
                };
            };
            addressMatches: Array<{
                tigerLine: {
                    side: string;
                    tigerLineId: string;
                };
                coordinates: {
                    x: number;
                    y: number;
                };
                addressComponents: {
                    zip: string;
                    streetName: string;
                    preType: string;
                    city: string;
                    preDirection: string;
                    suffixDirection: string;
                    fromAddress: string;
                    state: string;
                    suffixType: string;
                    toAddress: string;
                    suffixQualifier: string;
                    preQualifier: string;
                };
                matchedAddress: string;
            }>;
        };

};


async function geoencode(address: string): Promise<GeocodeResultsJson> {
	const geocodeURL = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');

	geocodeURL.search = new URLSearchParams({
		address,
		benchmark: 'Public_AR_Current',
		format: 'json'
	}).toString();

	// console.log('Geocode URL: ', geocodeURL.toString());

	const geocode = await fetch(geocodeURL.toString()).then((r) => r.json());
	// console.log('Geocode: ', JSON.stringify(geocode, null, 2));
	return geocode;
}

async function populationInRadius(address: string, radius: number): Promise<GeocodeResultsJson> {
	const result: GeocodeResultsJson = await geoencode(address);
    console.log("result: ", result.result.addressMatches[0].coordinates);
	const x = result.result.addressMatches[0].coordinates.x;
	const y = result.result.addressMatches[0].coordinates.y;
    console.log("x: ", x);
    console.log("y: ", y);
	// const addressMatch = result.result?.population?.result?.addressMatches?.[0];
    // console.log("addressMatch: ", addressMatch);
	// const x = addressMatch?.coordinates?.x;
	// const y = addressMatch?.coordinates?.y;
    // console.log("x: ", x);
    // console.log("y: ", y);
	return result;
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	console.log('GET request received');
	try {
		const address = url.searchParams.get('address') || '721 SE 39th Ct, Hillsboro, OR 97123';
		const radius = Number(url.searchParams.get('radius')) || 10;
		const population = await populationInRadius(address, radius);

		return new Response(JSON.stringify({ population }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
	}
};
