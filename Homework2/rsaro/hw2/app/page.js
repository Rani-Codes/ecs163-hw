'use client'
import React, { useEffect, useState } from "react";
import BarChart from "../components/BarChart";
import ScatterPlot from "../components/ScatterPlot";
import ParallelPlot from "@/components/ParallelPlot";
import * as d3 from "d3";

export default function Home() {
  const [genreData, setGenreData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [parallelData, setParallelData] = useState([]);

  useEffect(() => {
    d3.csv("/mxmh_survey_results.csv").then(data => {
      // ----- BarChart data -----
      const genreCounts = d3.rollup(
        data,
        v => v.length,
        d => d["Fav genre"]?.trim() ?? "Unknown"
      );

      const processedGenres = Array.from(genreCounts, ([genre, count]) => ({
        genre,
        count
      })).sort((a, b) => b.count - a.count);

      setGenreData(processedGenres);

      // ----- ScatterPlot data -----
      const processedScatter = data
        .filter(d => d["Hours per day"] && d.Anxiety) // remove missing values
        .map(d => ({
          hours: +d["Hours per day"],
          anxiety: +d.Anxiety
        }));

      setScatterData(processedScatter);


      const parallelData = data
      .filter(d =>
        d.Age && d["Hours per day"] && d.Anxiety && d.Depression &&
        d.Insomnia && d.OCD && d["Primary streaming service"]
      )
      .map(d => ({
        Age: +d.Age,
        Hours: +d["Hours per day"],
        Anxiety: +d.Anxiety,
        Depression: +d.Depression,
        Insomnia: +d.Insomnia,
        OCD: +d.OCD,
        Category: d["Primary streaming service"]
      }));

      setParallelData(parallelData);


    }).catch(err => console.error("Failed to load CSV:", err));
  }, []);

  return (
  <main className="min-h-screen p-4 bg-gray-50">
    <h1 className="text-2xl font-bold mb-4 text-center">Music & Mental Health Dashboard</h1>

    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-4">
        <BarChart data={genreData} width={600} height={300} />
        <ScatterPlot data={scatterData} width={400} height={300} />
      </div>

        <ParallelPlot data={parallelData} width={1200} height={600} />
    </div>
  </main>
  );
}
