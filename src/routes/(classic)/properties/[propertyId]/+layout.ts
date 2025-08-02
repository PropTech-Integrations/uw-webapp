import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	let propertyId = params.propertyId;

	const properties = [
		{
			id: '582b8cda7fb7184fcdde7d7c254fb86ce978fa517059782c7537980ac3f261d8',
			name: '198 NE Combs Flat Rd', 
      address: '198 NE Combs Flat Rd, Prineville, OR 97754',
			image: '/images/properties/198NECombs.png'
		},
		{
			id: 'c42fdf5d3d1e873c8ae713110424968eec1dded045067183a387c5ff5e1b11de',
			name: 'Hobby Lobby',
			address: '4107 Broadway Street, Mount Vernon, IL 62868',
			image: '/images/properties/hobbylobby.png'
		},
		{
			id: 'e404e46d3a6158cdb05155e2f614692c4ef99104fc1ebddbd5c02aa6f57a158d',
			name: 'Lone Oak Shopping Center',
			address: '907-1015 S. WW White Rd, San Antonio, TX 78220',
			image: '/images/properties/loneoak.png'
		},
		{
			id: '27ac91e378b055931a20843d545dabfc6b5c75f7b2953147ccc5fb66fc9848f5',
			name: 'Plaza at RiverLakes',
			address: '9440-9680 Hageman Rd, Bakersfield, CA 93312',
			image: '/images/properties/plazaAtRiverLakes.png'
		}
	];

	if (!propertyId) {
		throw redirect(302, '/404');
	}

  const property = properties.find((property) => property.id === propertyId);

	return {
		property
	};
};
