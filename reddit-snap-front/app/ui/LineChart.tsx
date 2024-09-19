"use client"
import React, { useEffect } from 'react';
import * as d3 from 'd3';

export default function D3Component ( json_obj ) {
    // console.log(typeof json_str.data)
    // console.log('hi', json_str)
    
    const data = JSON.parse(json_obj.data)
    useEffect(() => {
        console.log(data)
        data.forEach(d => {
            d.observed_tstz = d3.isoParse(d.observed_tstz);
            d.ups = +d.ups; // Convert value to a number
          });

        d3.select("#chart").select("svg").remove();
        // Set dimensions and margins for the chart

        const margin = { top: 70, right: 30, bottom: 40, left: 80 };
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        // Set up the x and y scales

        const x = d3.scaleTime()
        .range([0, width]);

        const y = d3.scaleLinear()
        .range([height, 0]);

        // Create the SVG element and append it to the chart container

        const svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create a fake dataset

        // const dataset = [
        // { date: new Date("2022-01-01"), value: 200 },
        // { date: new Date("2022-02-01"), value: 250 },
        // { date: new Date("2022-03-01"), value: 180 },
        // { date: new Date("2022-04-01"), value: 300 },
        // { date: new Date("2022-05-01"), value: 280 },
        // { date: new Date("2022-06-01"), value: 220 },
        // { date: new Date("2022-07-01"), value: 300 },
        // { date: new Date("2022-08-01"), value: 450 },
        // { date: new Date("2022-09-01"), value: 280 },
        // { date: new Date("2022-10-01"), value: 600 },
        // { date: new Date("2022-11-01"), value: 780 },
        // { date: new Date("2022-12-01"), value: 320 }
        // ];

        // Define the x and y domains

        x.domain(d3.extent(data, d => d.observed_tstz));
        y.domain([d3.min(data, d => d.ups), d3.max(data, d => d.ups)]);

        // Add the x-axis

        svg.append("g")
        .attr("transform", `translate(0,${height})`)
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

