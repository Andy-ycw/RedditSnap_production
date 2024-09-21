"use client"
import React, { useEffect } from 'react';
import * as d3 from 'd3';

export default function D3Component ( json_obj ) {
    
    const data = JSON.parse(json_obj.data)
    useEffect(() => {
        data.forEach(d => {
            d.observed_tstz = d3.isoParse(d.observed_tstz);
            d.ups = +d.ups; // Convert value to a number
          });
        
        // The graph is rendered two times. The reason is to be found out; likely to be related to the use of useEffect.
        // This is why a .remove() is done to remove the extra graph.
        d3.select("#chart").select("svg").remove();

        // Set dimensions and margins for the chart.
        const container_width = 500;
        const container_height = 300;
        const margin = { top: 70, right: 30, bottom: 40, left: 80 };
        const g_width = container_width - margin.left - margin.right; 
        const g_height = container_height - margin.top - margin.bottom;

        // The const svg represents the container of all svg elements for this chart.
        const svg = d3.select("#chart")
        .append("svg")
            .attr("width", container_width)
            .attr("height", container_height)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up the x and y scales
        const x = d3.scaleTime().range([0, g_width]);
        const y = d3.scaleLinear().range([g_height, 0]);

        // Define the x and y domains
        x.domain(d3.extent(data, d => d.observed_tstz));
        y.domain([d3.min(data, d => d.ups), d3.max(data, d => d.ups)]);

        // Add the x-axis
        svg.append("g")
        .attr("transform", `translate(0,${g_height})`)
        .call(d3.axisBottom(x)
            // .tickValues(data.map(d => d.observed_tstz)) // Set tick values to the dates in data
            // .tickFormat(d3.utcFormat("%m-%d %H:%M"))); // Format the ticks as needed
            .ticks(d3.timeHour.every(12)) 
            .tickFormat(d3.timeFormat("%m%d %H"))); 

        // Add the y-axis
        svg.append("g")
        .call(d3.axisLeft(y))

        // Create the line generator
        const line = d3.line()
        .x(d => x(d.observed_tstz))
        .y(d => y(d.ups));

        // Add the line path to the SVG element
        svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1)
        .attr("d", line);
            }, []);

    return (
        <div className='flex justify-center' id="chart"></div>
        
    );
};

