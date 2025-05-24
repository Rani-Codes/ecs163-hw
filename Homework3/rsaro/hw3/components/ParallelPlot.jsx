"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function ParallelPlot({ data, width = 1000, height = 500 }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [filteredIDs, setFilteredIDs] = useState(null);
  const [highlightDim, setHighlightDim] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 50, right: 20, bottom: 30, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const rootSvg = d3.select(svgRef.current);
    rootSvg.selectAll("*").remove();

    const svg = rootSvg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimensions = ["Age", "Hours", "Anxiety", "Depression", "Insomnia", "OCD"];

    const yScales = {};
    dimensions.forEach(dim => {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[dim]))
        .range([innerHeight, 0]);
    });

    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, innerWidth]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(data.map(d => d.Category))]);

    const line = d3.line().defined(([, y]) => !isNaN(y));

    function path(d) {
      return line(dimensions.map(dim => [xScale(dim), yScales[dim](+d[dim])]));
    }

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("top", "20px")
      .style("right", "10px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("font-size", "12px")
      .style("padding", "4px 6px")
      .style("pointer-events", "none")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.2)")
      .style("opacity", 0);

    dimensions.forEach(dim => {
      svg.append("g")
        .attr("transform", `translate(${xScale(dim)},0)`)
        .call(d3.axisLeft(yScales[dim]).ticks(5));

      svg.append("text")
        .attr("x", xScale(dim))
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("cursor", "pointer")
        .text(dim)
        .on("mouseover", () => setHighlightDim(dim))
        .on("mouseout", () => setHighlightDim(null));
    });

    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Parallel Coordinates Plot of Music & Mental Health Factors");

    function handleBrush(event) {
      const brushedIDs = event.detail;
      setFilteredIDs(brushedIDs);
    }

    window.addEventListener("brushScatter", handleBrush);
    return () => window.removeEventListener("brushScatter", handleBrush);
  }, [data, width, height]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current).select("g");

    const dimensions = ["Age", "Hours", "Anxiety", "Depression", "Insomnia", "OCD"];

    const yScales = {};
    dimensions.forEach(dim => {
      yScales[dim] = d3.scaleLinear()
        .domain(d3.extent(data, d => +d[dim]))
        .range([height - 80, 0]);
    });

    const xScale = d3.scalePoint()
      .domain(dimensions)
      .range([0, width - 40]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(data.map(d => d.Category))]);

    const line = d3.line().defined(([, y]) => !isNaN(y));

    function path(d) {
      return line(dimensions.map(dim => [xScale(dim), yScales[dim](+d[dim])]));
    }

    svg.selectAll(".datapath").remove();

    let drawData = data;
    if (filteredIDs) drawData = data.filter(d => filteredIDs.includes(d.id));
    if (activeCategory) drawData = drawData.filter(d => d.Category === activeCategory);

    const tooltip = d3.select(tooltipRef.current);

    const highlightScale = highlightDim
      ? d3.scaleLinear()
          .domain(d3.extent(data, d => +d[highlightDim]))
          .range(["#c7d2fe", "#4338ca"])
      : null;

    svg.selectAll(".datapath")
      .data(drawData)
      .enter().append("path")
      .attr("class", "datapath")
      .attr("d", path)
      .attr("data-id", d => d.id)
      .style("fill", "none")
      .style("stroke", d => highlightScale ? highlightScale(+d[highlightDim]) : color(d.Category))
      .style("opacity", 0.4)
      .style("stroke-width", 1.5)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .style("stroke-width", 3)
          .style("opacity", 1);

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`
          <strong>Streaming Service:</strong> ${d.Category}<br/>
          <strong>Age:</strong> ${d.Age}<br/>
          <strong>Hours:</strong> ${d.Hours}<br/>
          <strong>Anxiety:</strong> ${d.Anxiety}<br/>
          <strong>Depression:</strong> ${d.Depression}<br/>
          <strong>Insomnia:</strong> ${d.Insomnia}<br/>
          <strong>OCD:</strong> ${d.OCD}
        `);
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke-width", 1.5)
          .style("opacity", 0.4);

        tooltip.transition().duration(300).style("opacity", 0);
      });
  }, [filteredIDs, data, width, height, highlightDim, activeCategory]);

  function resetBrush() {
    setFilteredIDs(null);
    setActiveCategory(null);
  }

  return (
    <div className="relative inline-block">
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>

      <button
        className="mt-4 ml-4 bg-gray-300 hover:bg-gray-400 text-sm px-3 py-1 rounded"
        onClick={resetBrush}
      >
        Reset Brush
      </button>

      <h1 className="text-center font-bold">Click buttons below to change filter on data shown!</h1>
      <ul className="flex gap-4 justify-center my-4">
        {[
          "Spotify",
          "Youtube Music",
          "Pandora",
          "Apple Music",
          "Other streaming service",
          "I do not use a streaming service."
        ].map(category => (
          <li
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded text-white cursor-pointer ${
              category === "Spotify" ? "bg-blue-500" :
              category === "Youtube Music" ? "bg-green-500" :
              category === "Pandora" ? "bg-orange-500" :
              category === "Apple Music" ? "bg-purple-500" :
              category === "Other streaming service" ? "bg-orange-800" :
              "bg-red-500"
            }`}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
}
