<!-- src/lib/components/Map.svelte -->
<script lang="ts" module>
	// Declare global Leaflet types
	declare const L: any;
</script>

<script lang="ts">
	import { PUBLIC_GEOAPIFY_API_KEY } from '$env/static/public';
	import type { MapWidget } from '$lib/dashboard/types/widget';

	interface Props {
		data: MapWidget['data'];
	}

	let { data }: Props = $props();
	const apiKey = PUBLIC_GEOAPIFY_API_KEY;
	const lat = data.lat;
	const lon = data.lon;
	const zoom = data.zoom;

	// --- DOM Element Reference ---
	let mapContainer: HTMLDivElement; // This will be a reference to the <div> element, bound in the template.

	// --- Lifecycle with $effect ---
	// $effect runs after the component mounts. It will automatically re-run if any of its
	// dependencies change (though we don't have reactive dependencies here).
	// Crucially, it provides a way to clean up when the component is destroyed.
	$effect(() => {
		// Ensure the container element is ready and Leaflet is loaded
		if (!mapContainer || typeof L === 'undefined') {
			return;
		}

		console.log('===============');
		console.log(lat, lon, zoom);
		console.log('===============');
		// 1. Initialize the Leaflet map, binding it to our <div>
		const map = L.map(mapContainer).setView([lat, lon], zoom);

		// 2. Add the attribution text
		map.attributionControl.setPrefix('').addAttribution('');

		// 3. Create and add the Mapbox GL layer using the Geoapify style
		const gl = L.mapboxGL({
			style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
			accessToken: 'no-token' // not needed for Geoapify
		}).addTo(map);

		// 4. Return a cleanup function
		// This function will be called automatically when the component is unmounted.
		return () => {
			map.remove();
		};
	});
</script>

<!-- 
  This special Svelte element injects its contents into the <head> of the document.
  This is a great way to keep component-specific dependencies together.
-->
<svelte:head>
	<script
		type="text/javascript"
		src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.js"
	></script>
	<script
		type="text/javascript"
		src="https://api.tiles.mapbox.com/mapbox-gl-js/v1.4.0/mapbox-gl.js"
	></script>
	<link
		rel="stylesheet"
		type="text/css"
		href="https://api.tiles.mapbox.com/mapbox-gl-js/v1.4.0/mapbox-gl.css"
	/>
	<link
		rel="stylesheet"
		type="text/css"
		href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.css"
	/>
	<script
		type="text/javascript"
		src="https://rawgit.com/mapbox/mapbox-gl-leaflet/master/leaflet-mapbox-gl.js"
	></script>
</svelte:head>

<!-- 
  The component's markup. We use Tailwind classes for styling.
  'bind:this' gives us a direct reference to the DOM element for use in the script.
-->
<div class="h-full w-full" bind:this={mapContainer}></div>
