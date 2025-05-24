"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function BarChart({ data, width = 800, height = 300 }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 40, right: 20, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.genre))
      .range([0, innerWidth])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .nice()
      .range([innerHeight, 0]);

    svg.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    svg.append("g").call(d3.axisLeft(y));

    // Tooltip div
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "4px 8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
      .style("opacity", 0);

    // Bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.genre))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d.count))
      .attr("fill", "#3b82f6")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${d.genre}</strong><br/>Respondents: ${d.count}`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
      });

    // Chart title
    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Favorite Music Genres Distribution");

    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Respondents");

    // X axis label
    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Music Genres");

  }, [data, width, height]);

  return (
    <div className="relative flex justify-center">
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
}
