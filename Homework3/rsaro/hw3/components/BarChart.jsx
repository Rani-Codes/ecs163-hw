"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function BarChart({ data, width = 800, height = 300 }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [sortAlpha, setSortAlpha] = useState(false); // toggle sorting

  // Initial render setup
  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 20, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const g = svg.select("g.content");
    if (!g.empty()) return; // prevent re-initialization

    const content = svg
      .append("g")
      .attr("class", "content")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip setup
    d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "4px 8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
      .style("opacity", 0);

    // Axes groups
    content.append("g").attr("class", "x-axis").attr("transform", `translate(0, ${innerHeight})`);
    content.append("g").attr("class", "y-axis");

    // Axis labels and titles
    content.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Favorite Music Genres Distribution");

    content.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Respondents");

    content.append("text")
      .attr("class", "x-label")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Music Genres");

    // Bars group
    content.append("g").attr("class", "bars");

  }, [data]);

  // Animate and sort on toggle
  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 40, right: 20, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const sortedData = [...data].sort(sortAlpha
      ? (a, b) => d3.ascending(a.genre, b.genre)
      : (a, b) => d3.descending(a.count, b.count)
    );

    const svg = d3.select(svgRef.current);
    const g = svg.select("g.content");

    const x = d3.scaleBand()
      .domain(sortedData.map(d => d.genre))
      .range([0, innerWidth])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Animate x-axis
    g.select("g.x-axis")
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    // Update y-axis (no animation needed)
    g.select("g.y-axis").call(yAxis);

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Join bars
    const bars = g.select("g.bars")
      .selectAll("rect")
      .data(sortedData, d => d.genre);

    // Enter + update with transition
    bars.join(
      enter => enter
        .append("rect")
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.count))
        .attr("fill", "#3b82f6")
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`<strong>${d.genre}</strong><br/>Respondents: ${d.count}`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(300).style("opacity", 0);
        }),
      update => update
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.count))
    );

  }, [sortAlpha, data]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Toggle sort button */}
      <button
        onClick={() => setSortAlpha(prev => !prev)}
        className="mb-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
      >
        Sort {sortAlpha ? "by Count" : "Alphabetically"}
      </button>

      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
}
