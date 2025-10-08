<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	// 1. PROPS: Define the component's API using runes.
	// We accept data and various dimensional settings as properties.
	let {
		data,
		width = 928,
		height = 500,
		marginTop = 30,
		marginRight = 0,
		marginBottom = 30,
		marginLeft = 40,
		barColor = 'steelblue'
	} = $props();

	// 2. DERIVED STATE: These are reactive values computed from props.
	// They will automatically update if any dependency (like `data` or `width`) changes.

	// The x-scale maps letters to horizontal positions.
	// It's sorted by descending frequency, just like in the original example.
	const x = $derived(
		d3
			.scaleBand()
			.domain(d3.groupSort(data, ([d]) => -d.frequency, (d) => d.letter))
			.range([marginLeft, width - marginRight])
			.padding(0.1)
	);

	// The y-scale maps frequency values to vertical positions.
	const y = $derived(
		d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.frequency)])
			.range([height - marginBottom, marginTop])
	);

	// 3. ACTIONS FOR D3: Svelte actions let D3 manipulate a DOM node that Svelte creates.
	// This is the bridge for imperative D3 code like axis generation.

	// Action for the X-axis
	const xAxisAction = (node) => {
		const xAxis = d3.axisBottom(x).tickSizeOuter(0);
		d3.select(node).call(xAxis);

		// The action must return an object with an `update` method
		// to handle prop changes, but because our scales are derived,
		// Svelte 5's reactivity model re-runs this entire function when `x` changes.
		// So, no explicit `update` is needed for this simple case.
	};

	// Action for the Y-axis
	const yAxisAction = (node) => {
		const yAxis = d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed());
		const g = d3.select(node);
		
		g.call(yAxis);
		
		// Remove the domain line for a cleaner look
		g.select('.domain').remove();

		// Add the axis label. Use a join to prevent adding a new label on every update.
		g.selectAll('.axis-label')
			.data(['↑ Frequency (%)'])
			.join('text')
			.attr('class', 'axis-label')
			.attr('x', -marginLeft)
			.attr('y', 10)
			.attr('fill', 'currentColor')
			.attr('text-anchor', 'start')
			.text((d) => d);
	};

</script>

<!-- 4. TEMPLATE: Declarative SVG markup controlled by Svelte -->
<svg {width} {height} viewBox="0 0 {width} {height}" style="max-width: 100%; height: auto;">
	<!-- Bar Group -->
	<g fill={barColor}>
		<!-- Use an #each block for the bars. This is the Svelte way. -->
		{#each data as d (d.letter)}
			<rect
				x={x(d.letter)}
				y={y(d.frequency)}
				height={y(0) - y(d.frequency)}
				width={x.bandwidth()}
			/>
		{/each}
	</g>

	<!-- X-Axis Group -->
	<!-- The `use:` directive applies our D3 action to this <g> element. -->
	<g transform="translate(0, {height - marginBottom})" use:xAxisAction />

	<!-- Y-Axis Group -->
	<g transform="translate({marginLeft}, 0)" use:yAxisAction />
</svg>