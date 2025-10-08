<!-- BarChart.svelte -->
<script lang="ts">
    import * as d3 from "d3";
  
    // Props
    let {
      data = [],
      height = 500,
      margin = { top: 30, right: 0, bottom: 30, left: 40 },
      barFill = "steelblue"
    }: {
      data?: { letter: string; frequency: number }[];
      height?: number;
      margin?: { top: number; right: number; bottom: number; left: number };
      barFill?: string;
    } = $props();
  
    let container: HTMLDivElement | null = null;
    let svgEl: SVGSVGElement | null = null;
    let width: number | null = null; // set by ResizeObserver
    let ro: ResizeObserver | null = null;
  
    function cleanup() {
      if (svgEl) {
        svgEl.remove();
        svgEl = null;
      }
    }
  
    function render() {
      if (!container || !width || data.length === 0) return;
  
      cleanup();
  
      const W = width;
      const H = height;
  
      // Sort domain: descending by frequency
      const domain = d3.groupSort(
        data,
        ([d]) => -d.frequency,
        (d) => d.letter
      );
  
      const x = d3
        .scaleBand<string>()
        .domain(domain)
        .range([margin.left, W - margin.right])
        .padding(0.1);
  
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.frequency) ?? 0])
        .nice()
        .range([H - margin.bottom, margin.top]);
  
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", W)
        .attr("height", H)
        .attr("viewBox", [0, 0, W, H])
        .attr("style", "max-width: 100%; height: auto;");
  
      svgEl = svg.node() as SVGSVGElement;
  
      // Bars
      svg
        .append("g")
        .attr("fill", barFill)
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.letter)!)
        .attr("y", (d) => y(d.frequency))
        .attr("height", (d) => y(0) - y(d.frequency))
        .attr("width", x.bandwidth());
  
      // X Axis
      svg
        .append("g")
        .attr("transform", `translate(0,${H - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));
  
      // Y Axis
      const yAxis = svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat((v: number) => (v * 100).toFixed(0)))
        .call((g) => g.select(".domain").remove());
  
      // Y label
      yAxis
        .append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Frequency (%)");
    }
  
    // Observe container size once it's mounted
    $effect(() => {
      if (!container) return;
  
      if (!ro) {
        ro = new ResizeObserver((entries) => {
          const w = entries[0]?.contentRect?.width ?? 0;
          width = Math.max(320, Math.floor(w));
          render();
        });
        ro.observe(container);
      }
  
      return () => {
        ro?.disconnect();
        ro = null;
        cleanup();
      };
    });
  
    // Re-render when inputs change
    $effect(() => {
      if (!container || !width) return;
      render();
    });
  </script>
  
  <div bind:this={container} style="width: 100%;"></div>
  