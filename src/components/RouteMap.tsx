import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Flight } from '../types';
import { AIRPORTS } from '../lib/airports';

interface RouteMapProps {
  flights: Flight[];
}

export function RouteMap({ flights }: RouteMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = 800;
    const height = 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.5])
      .center([0, 20]); // Center on Africa/Europe

    const path = d3.geoPath().projection(projection);

    // Initial setup
    const g = svg.append("g");

    // Background water
    const background = g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#050505");

    // Grid lines (graticule)
    const graticule = d3.geoGraticule();
    g.append("path")
      .datum(graticule())
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#27272a")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.1);

    const render = () => {
      g.selectAll(".countries").attr("d", path);
      g.selectAll(".graticule").attr("d", path);
      g.selectAll(".route").attr("d", (d: any) => path(d));
      
      g.selectAll(".airport-pin")
        .attr("transform", (d: any) => {
          const coords = AIRPORTS[d];
          const p = coords ? projection([coords[1], coords[0]]) : null;
          return p ? `translate(${p[0]}, ${p[1]})` : "translate(-100,-100)";
        });
    };

    // Load world data
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json").then((data: any) => {
      // @ts-ignore
      const land = topojson.feature(data, data.objects.land);

      g.append("path")
        .datum(land)
        .attr("class", "countries")
        .attr("d", path)
        .attr("fill", "#18181b")
        .attr("stroke", "#27272a")
        .attr("stroke-width", 0.5);

      // Draw Routes
      const routeData = flights.map(f => {
        const from = AIRPORTS[f.from.toUpperCase()];
        const to = AIRPORTS[f.to.toUpperCase()];
        if (from && to) return { 
          type: "LineString", 
          coordinates: [[from[1], from[0]], [to[1], to[0]]],
          id: f.id
        };
        return null;
      }).filter(Boolean);

      g.selectAll(".route")
        .data(routeData)
        .enter()
        .append("path")
        .attr("class", "route")
        .attr("d", (d: any) => path(d))
        .attr("fill", "none")
        .attr("stroke", "#60a5fa") // Brighter Blue
        .attr("stroke-width", 2.5) // Thicker
        .attr("stroke-linecap", "round")
        .attr("opacity", 1)
        .style("filter", "drop-shadow(0 0 12px rgba(96, 165, 250, 0.6))") // Stronger Glow
        .attr("stroke-dasharray", function() {
           const l = (this as SVGPathElement).getTotalLength();
           return `${l} ${l}`;
        })
        .attr("stroke-dashoffset", function() {
           return (this as SVGPathElement).getTotalLength();
        })
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);

      // Draw Airports as Pins (📍 style)
      const airportCodes = Array.from(new Set(flights.flatMap(f => [f.from.toUpperCase(), f.to.toUpperCase()])));
      
      const pinGroups = g.selectAll(".airport-pin")
        .data(airportCodes)
        .enter()
        .append("g")
        .attr("class", "airport-pin")
        .attr("transform", (d: any) => {
          const coords = AIRPORTS[d];
          const p = coords ? projection([coords[1], coords[0]]) : null;
          return p ? `translate(${p[0]}, ${p[1]})` : "translate(-100,-100)";
        });

      // Pin Head (Physical like 📍)
      pinGroups.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -10)
        .attr("stroke", "#d1d5db") // Silver needle
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round");

      pinGroups.append("circle")
        .attr("cx", 0)
        .attr("cy", -10)
        .attr("r", 4)
        .attr("fill", "#ef4444") // Red head
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style("filter", "drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))");

      // Pin Label (Hidden by default, shows on hover in professional apps)
      pinGroups.append("text")
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "8px")
        .attr("font-family", "monospace")
        .attr("font-weight", "bold")
        .text(d => d);

      // Set up interactions
      const zoom = d3.zoom<SVGSVGElement, any>()
        .scaleExtent([0.5, 8]) // Zoom relative to initial scale
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom as any);

      // Initial render for positions
      render();
    });

  }, [flights]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center select-none" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight uppercase text-[12px] opacity-80">Mission Map</h3>
          <p className="text-[10px] text-zinc-500 font-mono">DRAG TO PAN • SCROLL TO ZOOM</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          Projection Active
        </div>
      </div>
      
      <div className="relative w-full aspect-[16/10] flex items-center justify-center overflow-hidden bg-zinc-950/20 rounded-xl border border-zinc-800/50">
        <svg 
          ref={svgRef} 
          width="800" 
          height="500" 
          viewBox="0 0 800 500" 
          className="max-w-full h-auto touch-none pointer-events-auto"
        />
      </div>

      <div className="mt-8 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full">
        {Array.from(new Set(flights.flatMap(f => [f.from.toUpperCase(), f.to.toUpperCase()]))).map(icao => (
          <div key={icao} className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[10px] font-mono text-zinc-300 group hover:border-blue-500/50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            {icao}
          </div>
        ))}
      </div>
    </div>
  );
}
